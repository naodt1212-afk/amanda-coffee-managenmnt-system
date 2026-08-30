import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, Table, CartItem } from '../types';
import { Button, Input, Badge, Modal, EmptyState } from '../components/UI';
import { Search, ShoppingBag, Plus, Minus, Check, X, SlidersHorizontal, Trash2, UserPlus, Table as TableIcon } from 'lucide-react';

export const Orders: React.FC = () => {
  const { 
    orders, 
    tables, 
    menuItems, 
    updateOrderStatus, 
    cancelOrder, 
    createOrderFromStaff, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  // Custom Staff Order Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [staffCart, setStaffCart] = useState<CartItem[]>([]);
  const [staffCustomerName, setStaffCustomerName] = useState('');
  
  // Filtered staff orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.includes(searchQuery) || 
                            (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handle staff cart additions
  const handleAddToStaffCart = (item: typeof menuItems[0]) => {
    setStaffCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    showToast(`Added ${item.name} to order queue`, 'success');
  };

  const handleUpdateStaffCartQty = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setStaffCart(prev => prev.filter(i => i.menuItem.id !== itemId));
      return;
    }
    setStaffCart(prev => prev.map(i => i.menuItem.id === itemId ? { ...i, quantity } : i));
  };

  const handleConfirmStaffOrder = () => {
    if (!selectedTableId) {
      showToast('Please allocate a Table for this Dine-In Order!', 'error');
      return;
    }
    if (staffCart.length === 0) {
      showToast('Please select at least one beverage or meal', 'error');
      return;
    }

    createOrderFromStaff(selectedTableId, staffCart, staffCustomerName.trim() || 'Staff Customer');
    setIsCreateModalOpen(false);
    
    // Reset form
    setStaffCart([]);
    setSelectedTableId('');
    setStaffCustomerName('');
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Order Management</h1>
          <p className="text-xs text-stone-400 mt-1">Track active orders, prepare bills, and create manual staff dine-in logs</p>
        </div>

        {/* Create Manual POS Order */}
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus size={16} />}
          className="self-start sm:self-auto"
        >
          New Manual Order
        </Button>
      </div>

      {/* POS Filter Controls */}
      <div className="bg-white border border-stone-100 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search by Order ID, Table name, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'] as const).map((filter) => {
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
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Order detail Blocks */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="We couldn't find any orders matching your selected status filter or search queries."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            return (
              <div key={order.id} className="bg-white border border-stone-100 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                <div>
                  {/* Card upper header */}
                  <div className="flex items-start justify-between border-b border-stone-50 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-950">Order #{order.id}</span>
                        <Badge status={order.status} />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 block font-medium">Placed: {order.createdAt}</span>
                    </div>
                    <span className="text-sm font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">
                      {order.total} ETB
                    </span>
                  </div>

                  {/* Dining Parameters details */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 mb-3 bg-stone-50/70 p-2 rounded-lg border border-stone-100/50">
                    <span className="flex items-center gap-1">
                      <TableIcon size={12} className="text-amber-800" /> {order.tableNumber}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={12} className="text-stone-400" /> {order.customerName || 'Guest'}
                    </span>
                  </div>

                  {/* List of items inside order */}
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-stone-600">
                        <span className="truncate flex items-center gap-2">
                          <span className="font-black text-amber-800 bg-amber-50 rounded-sm px-1.5 py-0.5 text-[10px]">
                            {item.quantity}x
                          </span>
                          {item.menuItem.name}
                        </span>
                        <span className="font-medium text-stone-500">{item.menuItem.price * item.quantity} ETB</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POS Operations Footer Buttons */}
                <div className="border-t border-stone-50 pt-4 mt-4 flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase font-black text-stone-400 tracking-wider">
                    Bill: <span className={order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{order.paymentStatus}</span>
                  </div>

                  <div className="flex gap-1.5">
                    {order.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="py-1 px-2.5 text-xs font-bold"
                      >
                        Prepare 🍳
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="py-1 px-2.5 text-xs font-bold bg-amber-50 text-amber-900"
                      >
                        Mark Ready 🔔
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="py-1 px-2.5 text-xs font-bold bg-sky-50 text-sky-900"
                      >
                        Mark Served 🍽️
                      </Button>
                    )}
                    {order.status === 'served' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="py-1 px-2.5 text-xs font-bold bg-emerald-50 text-emerald-900"
                      >
                        Complete ✓
                      </Button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        onClick={() => cancelOrder(order.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Order Placement Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Staff POS Dine-In Log"
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Menu Selection Side */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1">
              Select Drinks & Dishes
            </h4>
            
            {/* Simple scrollable menu grid */}
            <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {menuItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleAddToStaffCart(item)}
                  className="p-2 border border-stone-100 rounded-xl flex gap-3 items-center hover:bg-amber-50/50 cursor-pointer transition"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 relative">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        console.error(`Orders staff image failed to load: ${item.name}`, item.image);
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          if (!parent.querySelector('.image-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'image-fallback absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 text-center';
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
                            `;
                            parent.appendChild(fallback);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                    <span className="text-[10px] font-extrabold text-amber-900">{item.price} ETB</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold bg-stone-100 px-2 py-0.5 rounded-sm">Add +</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Settings Side */}
          <div className="flex flex-col gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-1">
              Order Parameters
            </h4>

            {/* Selection inputs */}
            <Input
              label="Customer Reference"
              placeholder="e.g. VIP guest, Walk-in, table owner"
              value={staffCustomerName}
              onChange={(e) => setStaffCustomerName(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Allocate Table
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full bg-white text-stone-900 border border-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1.5 focus:ring-amber-900"
              >
                <option value="">-- Choose Table --</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>{t.number} ({t.status})</option>
                ))}
              </select>
            </div>

            {/* Selected Queue list */}
            <div className="flex-1 overflow-y-auto max-h-40 flex flex-col gap-2 bg-white rounded-xl border border-stone-100 p-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Queue List</span>
              {staffCart.length === 0 ? (
                <p className="text-[11px] text-stone-400 italic text-center py-6">No items selected yet</p>
              ) : (
                staffCart.map(item => (
                  <div key={item.menuItem.id} className="flex justify-between items-center text-xs pb-1.5 border-b border-stone-50">
                    <span className="font-semibold text-stone-800 truncate max-w-[120px]">{item.menuItem.name}</span>
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-md">
                      <button onClick={() => handleUpdateStaffCartQty(item.menuItem.id, item.quantity - 1)} className="p-0.5 bg-white rounded-sm text-stone-600 hover:bg-stone-200"><Minus size={10} /></button>
                      <span className="font-bold px-1 text-[10px]">{item.quantity}</span>
                      <button onClick={() => handleUpdateStaffCartQty(item.menuItem.id, item.quantity + 1)} className="p-0.5 bg-white rounded-sm text-stone-600 hover:bg-stone-200"><Plus size={10} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total count */}
            <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-xs">
              <span className="font-bold text-stone-500">Total Price:</span>
              <span className="text-sm font-black text-amber-950">
                {staffCart.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0)} ETB
              </span>
            </div>

            <Button
              variant="primary"
              onClick={handleConfirmStaffOrder}
              disabled={!selectedTableId || staffCart.length === 0}
              className="w-full mt-2"
            >
              Confirm Log
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
