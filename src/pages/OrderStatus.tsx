import React from 'react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UI';
import { ArrowLeft, Coffee, Check, Clock, RefreshCw, ShoppingBag, MapPin, Heart } from 'lucide-react';
import { AmandaLogo } from '../components/AmandaLogo';

export const OrderStatus: React.FC = () => {
  const { 
    orders, 
    activeOrderId, 
    navigateTo, 
    updateOrderStatus,
    showToast 
  } = useApp();

  // Find current order
  const order = orders.find(o => o.id === activeOrderId);

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received by cashier & sent to kitchen queue' },
    { key: 'preparing', label: 'In the Kitchen', desc: 'Chef Aster is preparing your fresh order' },
    { key: 'ready', label: 'Ready to Collect', desc: 'Ready on the counter! Pick up at espresso bar' },
    { key: 'served', label: 'Served to Table', desc: 'Delivered directly to your table' },
    { key: 'completed', label: 'Completed', desc: 'Enjoy your Amanda Coffee experience!' }
  ];

  // Calculate step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'served': return 3;
      case 'completed': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  // Simulator for demonstration of future Socket.IO
  const handleSimulateNextStep = () => {
    if (!order) return;
    const statuses: Array<typeof order.status> = ['pending', 'preparing', 'ready', 'served', 'completed'];
    const currentIdx = statuses.indexOf(order.status);
    if (currentIdx < statuses.length - 1) {
      const nextStatus = statuses[currentIdx + 1];
      updateOrderStatus(order.id, nextStatus);
    } else {
      showToast('Order is already completed! Thank you.', 'info');
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex flex-col items-center justify-center text-center gap-4">
        <div className="p-3 bg-stone-100 rounded-full text-stone-400">
          <ShoppingBag size={32} />
        </div>
        <h3 className="font-display text-xl font-bold text-stone-950">No Active Order Tracked</h3>
        <p className="text-xs text-stone-500 max-w-xs">
          You do not have any active order currently tracked in this session. Scan the QR code or place an order from the menu.
        </p>
        <Button variant="primary" onClick={() => navigateTo('customer-menu')} className="mt-4">
          Go to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-20">
      {/* Mini sticky sub-header */}
      <nav className="bg-white border-b border-stone-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <button 
          onClick={() => navigateTo('customer-menu')} 
          className="p-2 -ml-2 rounded-lg hover:bg-stone-50 text-[#1A120B] transition flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <AmandaLogo variant="horizontal" size="xs" />
        <div className="w-8" /> {/* Balance spacer */}
      </nav>

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Status Card Banner */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10" />
          
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block mb-1">
                Active Order ID
              </span>
              <h1 className="text-2xl font-black text-stone-900">#{order.id}</h1>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-amber-800" /> Allocated at <span className="font-semibold text-stone-800">{order.tableNumber}</span>
              </p>
            </div>
            <Badge status={order.status} />
          </div>

          <div className="w-full h-px bg-stone-100 my-4" />

          {/* Progress Flow */}
          {order.status === 'cancelled' ? (
            <div className="bg-red-50 text-red-800 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Order Cancelled</h4>
                <p className="text-[11px] text-red-600">This order was cancelled. Please request help from staff.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 relative pl-4.5">
              {/* Vertical line indicator */}
              <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-stone-100" />
              {/* Highlight fill line */}
              <div 
                className="absolute left-2.5 top-2 w-[2px] bg-amber-900 transition-all duration-500" 
                style={{ height: `${(currentStepIdx / 4) * 94}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Node Dot */}
                    <div className="absolute -left-[14px] top-1 z-10">
                      {isCompleted ? (
                        <div className="bg-amber-900 border border-amber-950 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-xs">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-stone-200 text-stone-400 rounded-full w-[18px] h-[18px]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className={`text-xs font-bold leading-none ${isCurrent ? 'text-amber-900' : isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed font-medium">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Demo simulator box */}
        <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl mb-6">
          <div className="flex items-start gap-2 mb-3">
            <RefreshCw size={14} className="text-amber-700 animate-spin-slow mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Socket.IO Event Simulator</h4>
              <p className="text-[10px] text-stone-400">
                Simulate how real-time Socket.IO triggers from the kitchen and cashier terminal instantly update the customer's page.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSimulateNextStep}
            disabled={order.status === 'completed' || order.status === 'cancelled'}
            className="w-full text-xs font-semibold bg-white border border-stone-200"
          >
            Advance Status Simulation ➔
          </Button>
        </div>

        {/* Order Details items summary */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
          <h3 className="font-display text-lg font-extrabold text-stone-900 mb-4">Summary of Plates</h3>
          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-stone-600 border-b border-stone-50 pb-2">
                <div className="flex gap-2 items-center">
                  <span className="font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                  <span>{item.menuItem.name}</span>
                </div>
                <span className="font-bold text-stone-800">{item.menuItem.price * item.quantity} ETB</span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-stone-100 my-4" />

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500">Bill Total</span>
            <span className="text-base font-extrabold text-amber-900">{order.total} ETB</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-stone-500">Payment Status</span>
            <Badge status={order.paymentStatus} />
          </div>
        </div>

        {/* Brand stamp */}
        <div className="flex flex-col items-center justify-center text-center mt-12 gap-2 pb-8">
          <AmandaLogo variant="badge" size="sm" className="opacity-75" />
          <span className="font-display text-[10px] font-bold tracking-widest uppercase text-[#1A120B]/50 mt-1">
            Thank you for dining with Amanda Coffee!
          </span>
        </div>
      </main>
    </div>
  );
};
