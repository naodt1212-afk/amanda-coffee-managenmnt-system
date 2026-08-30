import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Badge, EmptyState } from '../components/UI';
import { ChefHat, Clock, MessageSquare, CheckCircle, Flame, Sparkles } from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, showToast } = useApp();

  // Filter orders relevant for kitchen: pending (not yet preparing) and preparing (active on range)
  const kitchenOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'preparing')
                 .sort((a, b) => {
                   // Put preparing items on top of pending queue
                   if (a.status === 'preparing' && b.status === 'pending') return -1;
                   if (a.status === 'pending' && b.status === 'preparing') return 1;
                   return 0;
                 });
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Row */}
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Kitchen Display Terminal (KDS)</h1>
          <p className="text-xs text-stone-400 mt-1">Live order ticket feed for baking, traditional coffee boiling, and sandwich grills</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs bg-amber-900 text-amber-50 px-3 py-2 rounded-xl font-bold">
          <ChefHat size={16} className="text-amber-300" />
          <span>aster_chef terminal</span>
        </div>
      </div>

      {/* Grid of Tickets */}
      {kitchenOrders.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-stone-100 p-6 flex flex-col items-center text-center">
          <div className="p-4 bg-amber-50 text-amber-900 rounded-full mb-4 animate-bounce">
            <Sparkles size={32} />
          </div>
          <h3 className="font-display text-lg font-bold text-stone-900">All Clear in the Kitchen!</h3>
          <p className="text-xs text-stone-400 max-w-xs mt-1">No orders are currently waiting in the queue. Brew a Jebena Bunna cup and relax!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            const isPreparing = order.status === 'preparing';

            return (
              <div 
                key={order.id} 
                className={`border rounded-2xl p-6 flex flex-col justify-between shadow-xs ${
                  isPreparing 
                    ? 'bg-amber-50/20 border-amber-900/30 ring-1 ring-amber-900/10' 
                    : 'bg-white border-stone-100'
                }`}
              >
                <div>
                  {/* Card Ticket Header */}
                  <div className="flex items-start justify-between border-b border-stone-100 pb-3 mb-3">
                    <div>
                      <span className="text-xs font-black text-stone-900 block">Ticket #{order.id}</span>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                        Allocated: {order.tableNumber}
                      </span>
                    </div>
                    <Badge status={order.status} />
                  </div>

                  {/* Receipt Items list (enlarged for visibility) */}
                  <div className="flex flex-col gap-3 py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 border-b border-stone-50/50 pb-2">
                        <div className="flex justify-between text-sm font-black text-stone-900">
                          <span className="flex items-center gap-2">
                            <span className="bg-stone-900 text-white rounded-lg px-2.5 py-0.5 text-xs font-black">
                              {item.quantity}
                            </span>
                            {item.menuItem.name}
                          </span>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded-md italic font-semibold flex items-center gap-1.5 mt-1.5">
                            <MessageSquare size={10} /> "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Footer Button */}
                <div className="border-t border-stone-100 pt-4 mt-4 flex items-center justify-between gap-3 text-xs">
                  <span className="text-stone-400 font-bold flex items-center gap-1">
                    <Clock size={12} /> {order.createdAt.substring(11, 16)}
                  </span>

                  <div className="flex-1 max-w-xs">
                    {isPreparing ? (
                      <Button
                        variant="primary"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        icon={<CheckCircle size={14} />}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600"
                      >
                        Mark Recipe Ready
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        icon={<Flame size={14} />}
                        className="w-full bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                      >
                        Start Cooking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
