import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';
import { Button, Input, Badge, Modal, EmptyState } from '../components/UI';
import { Plus, Search, HelpCircle, History, Package, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { inventory, adjustStock, stockHistory, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock'>('all');
  
  // Modals Control
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Form Fields
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'adjust'>('in');
  const [adjustNote, setAdjustNote] = useState('');

  // Filtering
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustQty(5);
    setAdjustType('in');
    setAdjustNote('Received supplier delivery batch');
    setIsAdjustOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustQty <= 0) return;
    adjustStock(selectedItem.id, adjustQty, adjustType, adjustNote.trim() || 'Manual stock adjustment');
    setIsAdjustOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Inventory & Stock Ledger</h1>
          <p className="text-xs text-stone-400 mt-1">Regulate raw café materials, log weekly deliveries, and view stock depletion trails</p>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          onClick={() => setIsHistoryOpen(true)}
          icon={<History size={16} />}
          className="self-start sm:self-auto bg-white"
        >
          View Stock Movement Logs
        </Button>
      </div>

      {/* Quick alert bar for critical items */}
      {inventory.some(i => i.status === 'critical' || i.status === 'out_of_stock') && (
        <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Critical Reorder Alert!</h4>
            <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
              Certain vital ingredients (such as White Sugar or Sparkling Water Bottles) have collapsed past safety margins. Procure immediately to avoid serving disruptions!
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search raw ingredients by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'in_stock', 'low_stock', 'critical', 'out_of_stock'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  isActive 
                    ? 'bg-amber-900 text-white' 
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-100'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Table of items */}
      {filteredInventory.length === 0 ? (
        <EmptyState
          title="No Ingredients Found"
          description="Try clearing your search query or selecting another stock level filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4 text-center">Safety Stock Limit</th>
                  <th className="py-3 px-4 text-center">Current Quantity</th>
                  <th className="py-3 px-4 text-center">Stock status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-100 text-stone-600 rounded-lg">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900">{item.name}</span>
                          <span className="text-[9px] text-stone-400 font-normal">Last updated: {item.lastUpdated}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-stone-500 font-bold">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-stone-900">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAdjust(item)}
                        className="py-1 px-2.5 text-xs font-bold bg-white"
                      >
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(null)}
          title={`Update: ${selectedItem.name}`}
        >
          <form onSubmit={handleConfirmAdjust} className="flex flex-col gap-4">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100/60 flex justify-between items-center text-xs">
              <span className="text-stone-500 font-semibold">Active Inventory:</span>
              <span className="font-black text-stone-850">{selectedItem.currentStock} {selectedItem.unit}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Adjustment Action</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'in', label: 'Restock (+)', styles: 'border-emerald-200 text-emerald-800 bg-emerald-50/20' },
                  { key: 'out', label: 'Wastage (-)', styles: 'border-rose-200 text-rose-800 bg-rose-50/20' },
                  { key: 'adjust', label: 'Overrule (=)', styles: 'border-sky-200 text-sky-800 bg-sky-50/20' }
                ].map((action) => {
                  const isSel = adjustType === action.key;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => setAdjustType(action.key as any)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition ${
                        isSel 
                          ? 'bg-amber-900 border-amber-950 text-white shadow-xs' 
                          : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label={`Adjust Quantity (${selectedItem.unit})`}
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              required
              min={1}
            />

            <Input
              label="Transaction Memo Notes"
              placeholder="e.g. Broken packaging, supplier delivery, morning use"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2">
              Apply Stock Update
            </Button>
          </form>
        </Modal>
      )}

      {/* Stock History Logs Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Stock Movement Trails"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs text-stone-400 mb-2">Exhaustive transaction history of ingredients arriving or leaving Amanda Coffee</p>
          
          <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {stockHistory.map((movement) => {
              const isIn = movement.type === 'in';
              const isOut = movement.type === 'out';
              return (
                <div key={movement.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isIn ? 'bg-emerald-50 text-emerald-800' : isOut ? 'bg-rose-50 text-rose-800' : 'bg-sky-50 text-sky-800'}`}>
                      {isIn ? <ArrowUp size={14} /> : isOut ? <ArrowDown size={14} /> : <Package size={14} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-stone-900">{movement.itemName}</span>
                      <span className="text-[10px] text-stone-400 font-normal">Memo: "{movement.note}"</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col gap-0.5">
                    <span className={`font-black ${isIn ? 'text-emerald-700' : isOut ? 'text-red-600' : 'text-sky-700'}`}>
                      {isIn ? '+' : isOut ? '-' : '='} {movement.quantity}
                    </span>
                    <span className="text-[9px] text-stone-400 font-normal">{movement.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

    </div>
  );
};
