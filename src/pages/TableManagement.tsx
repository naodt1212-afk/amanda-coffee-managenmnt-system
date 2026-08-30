import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table, Order } from '../types';
import { Button, Badge, Modal, EmptyState } from '../components/UI';
import { Layers, Check, X, Shield, Users, Coffee, HelpCircle, ArrowRight } from 'lucide-react';

export const TableManagement: React.FC = () => {
  const { tables, orders, updateTableStatus, navigateTo, showToast } = useApp();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Find linked order for table
  const getActiveOrderForTable = (tableId: string): Order | undefined => {
    return orders.find(o => o.tableId === tableId && (o.status !== 'completed' && o.status !== 'cancelled'));
  };

  const handleOpenTableDetails = (table: Table) => {
    setSelectedTable(table);
  };

  const handleFreeTable = () => {
    if (!selectedTable) return;
    updateTableStatus(selectedTable.id, 'available', undefined);
    showToast(`${selectedTable.number} is now marked as available`, 'success');
    setSelectedTable(null);
  };

  const handleOccupyTable = () => {
    if (!selectedTable) return;
    updateTableStatus(selectedTable.id, 'occupied', undefined);
    showToast(`${selectedTable.number} marked as occupied`, 'info');
    setSelectedTable(null);
  };

  const handleTrackOrder = (orderId: string) => {
    // Navigate directly to Payments cashier or orders list
    setSelectedTable(null);
    navigateTo('admin-orders');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Block */}
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Table & Seating Management</h1>
        <p className="text-xs text-stone-400 mt-1">Monitor live tables, track diner durations, and check active checkouts from the floor map</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-100 flex flex-col gap-1 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Tables</span>
          <span className="text-xl font-bold text-stone-850">{tables.length} seats</span>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 flex flex-col gap-1 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Available Spots</span>
          <span className="text-xl font-bold text-emerald-950">
            {tables.filter(t => t.status === 'available').length} free
          </span>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50 flex flex-col gap-1 shadow-xs">
          <span className="text-[10px] font-bold text-amber-850 uppercase tracking-widest">Occupied Spot</span>
          <span className="text-xl font-bold text-amber-950">
            {tables.filter(t => t.status === 'occupied').length} active
          </span>
        </div>
      </div>

      {/* Grid Table floor plan cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const activeOrder = getActiveOrderForTable(table.id);
          const isOccupied = table.status === 'occupied';

          return (
            <div
              key={table.id}
              onClick={() => handleOpenTableDetails(table)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 select-none flex flex-col justify-between h-40 shadow-xs ${
                isOccupied 
                  ? 'bg-amber-50/50 border-amber-900/15 hover:border-amber-900/30' 
                  : 'bg-white border-stone-100 hover:border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-black text-stone-900 text-lg">{table.number}</h3>
                  <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>
                
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                  Capacity: 4 Diners
                </span>
              </div>

              {/* Order quick overview */}
              {isOccupied && activeOrder ? (
                <div className="bg-white border border-amber-900/10 rounded-xl p-2 mt-2 flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-amber-950">Order #{activeOrder.id}</span>
                  <div className="flex justify-between items-center text-[10px] text-stone-500 font-bold">
                    <span>{activeOrder.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                    <span className="text-amber-950">{activeOrder.total} ETB</span>
                  </div>
                </div>
              ) : isOccupied ? (
                <p className="text-[10px] text-amber-800 font-semibold bg-amber-50 p-1.5 rounded-lg text-center">
                  Manual Seated (No Cart)
                </p>
              ) : (
                <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50/50 p-1.5 rounded-lg text-center">
                  Empty Spot
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Details Dialog */}
      {selectedTable && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTable(null)}
          title={`Terminal: ${selectedTable.number}`}
        >
          {(() => {
            const activeOrder = getActiveOrderForTable(selectedTable.id);
            const isOccupied = selectedTable.status === 'occupied';

            return (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400 font-bold uppercase">Seating Status</span>
                    <span className="text-sm font-bold text-stone-850">
                      {isOccupied ? 'Occupied / Dine-In session' : 'Available for Customers'}
                    </span>
                  </div>
                  <Badge status={selectedTable.status} />
                </div>

                {isOccupied && activeOrder ? (
                  <div className="flex flex-col gap-3 bg-stone-50/30 p-4 rounded-xl border border-stone-100">
                    <div className="flex justify-between items-start border-b border-stone-100 pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">Active Order #{activeOrder.id}</h4>
                        <span className="text-[9px] text-stone-400 block font-semibold">Placed at {activeOrder.createdAt}</span>
                      </div>
                      <span className="text-xs font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-sm">
                        {activeOrder.total} ETB
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 py-1">
                      {activeOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-600">
                          <span>{item.quantity}x {item.menuItem.name}</span>
                          <span>{item.menuItem.price * item.quantity} ETB</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleTrackOrder(activeOrder.id)}
                      className="w-full mt-2 text-xs font-bold bg-white"
                      icon={<ArrowRight size={14} />}
                    >
                      Open POS Actions Panel
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic text-center py-4 bg-stone-50/50 rounded-xl">
                    No active bill or tracked cart associated with this seat.
                  </p>
                )}

                {/* Operations */}
                <div className="flex gap-2.5 mt-2">
                  {isOccupied ? (
                    <Button variant="outline" onClick={handleFreeTable} className="flex-1 bg-white border-stone-200 text-stone-700">
                      Free Spot ✓
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleOccupyTable} className="flex-1 bg-white border-stone-200 text-stone-700">
                      Mark Seated 🍽️
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setSelectedTable(null)} className="flex-1">
                    Close Details
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

    </div>
  );
};
