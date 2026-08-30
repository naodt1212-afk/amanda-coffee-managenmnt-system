import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, PaymentMethod } from '../types';
import { Button, Input, Badge, Modal, EmptyState } from '../components/UI';
import { CreditCard, DollarSign, Wallet, RefreshCw, Printer, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { AmandaLogo } from '../components/AmandaLogo';

export const Payments: React.FC = () => {
  const { orders, payOrder, activeReceipt, setActiveReceipt, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Payment State inputs
  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  // Dialog controls
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filter unpaid orders
  const unpaidOrders = useMemo(() => {
    return orders.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled');
  }, [orders]);

  const activeOrder = useMemo(() => {
    return unpaidOrders.find(o => o.id === selectedOrderId) || null;
  }, [unpaidOrders, selectedOrderId]);

  // Calculations
  const calculatedTotal = useMemo(() => {
    if (!activeOrder) return 0;
    return Math.max(0, activeOrder.total - discount);
  }, [activeOrder, discount]);

  const calculatedChange = useMemo(() => {
    if (amountPaid <= 0 || amountPaid < calculatedTotal) return 0;
    return amountPaid - calculatedTotal;
  }, [amountPaid, calculatedTotal]);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDiscount(0);
    setAmountPaid(0);
  };

  const handleProcessCheckout = () => {
    if (!activeOrder) return;
    if (amountPaid < calculatedTotal && paymentMethod === 'cash') {
      showToast(`Amount paid is less than the bill total! Needs ${calculatedTotal} ETB`, 'error');
      return;
    }

    const paidResult = payOrder(activeOrder.id, paymentMethod, discount, amountPaid);
    if (paidResult) {
      setActiveReceipt(paidResult);
      setIsReceiptOpen(true);
      // Reset
      setSelectedOrderId('');
      setDiscount(0);
      setAmountPaid(0);
    }
  };

  const handlePrintReceipt = () => {
    // Elegant system print integration
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Cashier Terminal (POS)</h1>
        <p className="text-xs text-stone-400 mt-1">Accept customer payments, allocate discounts, and generate official fiscal paper receipts</p>
      </div>

      {/* Main cashier bento panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unpaid Order Feed */}
        <div className="lg:col-span-1 bg-white border border-stone-100 rounded-2xl p-5 flex flex-col h-[70vh]">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-50 pb-2 block mb-3">
            Active Billing Bills ({unpaidOrders.length})
          </span>

          <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-1">
            {unpaidOrders.length === 0 ? (
              <p className="text-xs text-stone-400 italic text-center py-12">No pending bills on the floor</p>
            ) : (
              unpaidOrders.map((ord) => {
                const isSelected = ord.id === selectedOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord.id)}
                    className={`p-3.5 border rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-bold ${
                      isSelected 
                        ? 'bg-amber-900 text-white border-amber-950 scale-102' 
                        : 'bg-stone-50/50 border-stone-100 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={isSelected ? 'text-white' : 'text-stone-900'}>Order #{ord.id}</span>
                      <span className={`text-[10px] font-semibold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        {ord.tableNumber} • {ord.items.length} items
                      </span>
                    </div>
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-amber-900'}`}>
                      {ord.total} ETB
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Checkout Billing Detail Screen */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeOrder ? (
            <div className="bg-white border border-stone-100 rounded-2xl p-6 flex flex-col gap-5 shadow-xs">
              
              {/* Order quick overview */}
              <div className="flex justify-between items-start border-b border-stone-50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Bill Summary: Order #{activeOrder.id}</h3>
                  <span className="text-xs text-stone-400 font-semibold">{activeOrder.tableNumber} • {activeOrder.customerName || 'Walk-In'}</span>
                </div>
                <Badge status={activeOrder.status} />
              </div>

              {/* Items checklist */}
              <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto border-b border-stone-50 pb-4">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-stone-600 font-bold">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span>{item.menuItem.price * item.quantity} ETB</span>
                  </div>
                ))}
              </div>

              {/* Dynamic Billing Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-1">
                
                {/* Method selector */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Method</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'cash', label: 'Cash', icon: <DollarSign size={14} /> },
                      { key: 'telebirr', label: 'Telebirr', icon: <Wallet size={14} /> },
                      { key: 'other', label: 'Other', icon: <CreditCard size={14} /> }
                    ].map((m) => {
                      const isSel = paymentMethod === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => setPaymentMethod(m.key as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold ${
                            isSel 
                              ? 'bg-amber-900 text-white border-amber-950 scale-102 shadow-xs' 
                              : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                          }`}
                        >
                          {m.icon}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Number Fields */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pricing overrides</span>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Discount (ETB)"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      min={0}
                    />
                    <Input
                      label="Amount Paid (ETB)"
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      min={0}
                      disabled={paymentMethod !== 'cash'}
                    />
                  </div>
                </div>
              </div>

              {/* Accounting breakout summary */}
              <div className="bg-stone-50/50 rounded-xl p-4 border border-stone-100/60 flex flex-col gap-2 text-xs font-semibold mt-1">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{activeOrder.total} ETB</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>-{discount} ETB</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-100 pt-2">
                  <span>Grand Bill Total</span>
                  <span>{calculatedTotal} ETB</span>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Refund Change</span>
                    <span>{calculatedChange} ETB</span>
                  </div>
                )}
              </div>

              {/* Checkout process button */}
              <Button
                variant="primary"
                onClick={handleProcessCheckout}
                className="w-full py-4 rounded-xl text-sm font-bold shadow-md"
              >
                Confirm Payment & Close Order
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-stone-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[50vh]">
              <div className="p-3 bg-stone-100 rounded-full text-stone-400 mb-4">
                <CreditCard size={28} />
              </div>
              <p className="text-sm font-bold text-stone-800">Select Unpaid Bill</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Tap on any table/unpaid bill from the active list on the left to begin calculating discounts and collecting payment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Printable Receipt Dialog Box */}
      {activeReceipt && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="POS Invoice Receipt"
          maxWidth="max-w-md"
        >
          {/* Paper receipt design */}
          <div className="flex flex-col gap-4 border-dashed border border-stone-300 p-6 bg-stone-50/20 rounded-xl font-mono text-xs text-stone-800" id="printable-receipt">
            <div className="text-center flex flex-col items-center border-b border-stone-200 pb-4">
              <AmandaLogo variant="compact" size="sm" className="mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-1">Bole Road, Addis Ababa</span>
              <span className="text-[10px] text-stone-400 mt-0.5">Phone: +251 116 123456</span>
            </div>

            <div className="flex flex-col gap-1 border-b border-stone-100 pb-2">
              <div className="flex justify-between">
                <span>Receipt #: {activeReceipt.id}</span>
                <span>Table: {activeReceipt.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {activeReceipt.createdAt}</span>
                <span>Type: {activeReceipt.orderSource.toUpperCase()}</span>
              </div>
            </div>

            {/* List of items */}
            <div className="flex flex-col gap-2 border-b border-stone-100 pb-2">
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>{item.menuItem.price * item.quantity} ETB</span>
                </div>
              ))}
            </div>

            {/* Accounting details */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{activeReceipt.subtotal} ETB</span>
              </div>
              <div className="flex justify-between font-black text-stone-900 border-t border-stone-200 pt-2 text-sm">
                <span>GRAND TOTAL</span>
                <span>{activeReceipt.total} ETB</span>
              </div>
              <div className="flex justify-between text-stone-500 mt-1">
                <span>Payment Method</span>
                <span className="uppercase">{activeReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-stone-200">
              <p className="font-semibold text-stone-900">MELKAM MEGEB! THANK YOU!</p>
              <p className="text-[10px] text-stone-400 mt-1">Amedegnalehu. Please visit us again.</p>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              className="flex-1 bg-white"
              icon={<Printer size={16} />}
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsReceiptOpen(false)}
              className="flex-1"
            >
              Finished Checkout
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
};
