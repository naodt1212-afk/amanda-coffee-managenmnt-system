import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, Category } from '../types';
import { Button, Input, Badge, Modal } from '../components/UI';
import { AmandaLogo } from '../components/AmandaLogo';
import { Coffee, Search, ShoppingBag, Plus, Minus, Trash2, MapPin, ChevronRight, X, Clock, HelpCircle, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CustomerMenu: React.FC = () => {
  const { 
    menuItems, 
    tables, 
    currentTable, 
    selectTable, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    placeOrder,
    navigateTo,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalInstructions, setModalInstructions] = useState('');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Filter menu items - only show available items (admin marks them unavailable/out-of-stock to hide them)
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory && item.availability;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const categories: (Category | 'All')[] = ['All', 'Coffee', 'Tea', 'Juice', 'Food', 'Soft Drinks'];

  // Handle Cart pricing
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  }, [cart]);

  const handleOpenItem = (item: MenuItem) => {
    if (!item.availability) {
      showToast('This item is currently unavailable.', 'error');
      return;
    }
    setSelectedItemForModal(item);
    setModalQuantity(1);
    setModalInstructions('');
  };

  const handleConfirmAddToCart = () => {
    if (selectedItemForModal) {
      addToCart(selectedItemForModal, modalQuantity, modalInstructions);
      setSelectedItemForModal(null);
    }
  };

  const handleCheckout = async () => {
    if (!currentTable) {
      showToast('Please select your table number first!', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsPlacingOrder(true);
    try {
      await placeOrder(customerName.trim() || 'Guest Customer');
      setIsCartOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-stone-900 pb-28">
      {/* Premium Cafe Hero Header */}
      <header className="bg-[#1A120B] text-stone-100 relative overflow-hidden py-8 px-4 rounded-b-3xl shadow-lg border-b border-stone-900">
        <div className="absolute inset-0 bg-radial-gradient from-[#1A120B]/60 to-[#1A120B]/90 pointer-events-none" />
        <div className="relative max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <AmandaLogo variant="compact" size="md" light />
          </div>
          <p className="text-stone-300 text-xs mt-1 max-w-xs font-light">
            Premium Hand-Roasted Ethiopian Yirgacheffe & Traditional Jebena Experience
          </p>
          
          {/* Table Selector Box */}
          <div className="mt-5 w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xs">
            <span className="text-xs uppercase tracking-widest font-bold text-[#D4A373] block mb-2">
              Select Your Table
            </span>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => {
                const isSelected = currentTable?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTable(t.id)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-[#D4A373] text-[#1A120B] scale-105 shadow-md shadow-[#D4A373]/10' 
                        : 'bg-white/5 hover:bg-white/10 text-stone-200 border border-white/5'
                    }`}
                  >
                    {t.number.replace('Table ', 'T-')}
                  </button>
                );
              })}
            </div>
            {currentTable ? (
              <p className="text-xs text-emerald-400 font-medium mt-3 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ordering for Table: <span className="font-bold">{currentTable.number}</span>
              </p>
            ) : (
              <p className="text-xs text-[#D4A373] mt-2 font-medium">
                ⚠️ Please tap your table number above to place an order
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Search */}
        <div className="mb-5">
          <Input
            placeholder="Search freshly brewed espresso, juices, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} className="text-stone-400" />}
          />
        </div>

        {/* Categories Carousel */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 relative">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap relative transition-colors duration-200 focus:outline-none cursor-pointer"
                style={{
                  color: isActive ? '#1A120B' : '#57534e',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-[#D4A373] rounded-full -z-10 shadow-3d-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            {activeCategory === 'All' ? 'Our Menu' : activeCategory}
          </h2>
          <span className="text-xs text-stone-400 font-medium">{filteredItems.length} items available</span>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 p-6 shadow-3d-sm">
            <p className="text-sm font-semibold text-stone-600">No items found matching your filter</p>
            <p className="text-xs text-stone-400 mt-1">Try resetting your search query or choosing another category</p>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 gap-4 perspective-1000"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12, rotateX: -4 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 280, damping: 25 }}
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="bg-white rounded-2xl border border-stone-100/80 p-3.5 flex gap-4 cursor-pointer relative card-3d glare-effect shadow-3d-sm"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.error(`Image failed to load for menu item: ${item.name} (${item.id})`, item.image);
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          if (!parent.querySelector('.image-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'image-fallback absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2 text-center';
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee mb-1"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
                              <span class="text-[9px] font-bold uppercase tracking-wider truncate max-w-full">${item.name}</span>
                            `;
                            parent.appendChild(fallback);
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-stone-900 text-sm truncate">{item.name}</h3>
                        <span className="text-sm font-bold text-[#1A120B] whitespace-nowrap bg-[#D4A373]/20 px-2 py-0.5 rounded-md">
                          {item.price} ETB
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 pr-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                        <Clock size={12} /> {item.preparationTime || 4} mins prep
                      </span>
                      <span className="text-xs font-bold text-[#1A120B] hover:text-[#1A120B]/95 flex items-center gap-0.5 bg-[#D4A373] hover:bg-[#bfa282] px-2.5 py-1 rounded-lg shadow-sm transition active:scale-95">
                        Order <Plus size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Floating Cart Button (Pill at Bottom) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-11/12">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#1A120B] hover:bg-[#2D1B14] text-white p-4.5 rounded-full shadow-2xl flex items-center justify-between transition-transform duration-200 active:scale-95 border border-[#D4A373]/20"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#2D1B14] p-2 rounded-full relative">
                <ShoppingBag size={18} />
                <span className="absolute -top-1 -right-1 bg-[#D4A373] text-[#1A120B] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-stone-300 block font-medium">Review Cart</span>
                <span className="text-sm font-bold">Table: {currentTable?.number || 'Select Table'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-extrabold">{subtotal} ETB</span>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer / Overlay modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" 
            onClick={() => setIsCartOpen(false)} 
          />

          {/* Drawer content */}
          <div className="relative bg-white w-full max-w-xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col z-10 animate-slide-up">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-[#1A120B]" />
                <h3 className="font-display text-lg font-bold text-stone-900">Your Fresh Order</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Customer details */}
              <div className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-3 border border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Order Parameters</h4>
                <Input
                  label="Your Name (Optional)"
                  placeholder="e.g. Samrawit, Daniel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100 mt-1">
                  <span className="text-xs font-semibold text-stone-600">Dining Spot:</span>
                  <Badge status={currentTable ? currentTable.number : 'No Table Selected'} />
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Selected Cups & Plates</h4>
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex gap-3 items-center border-b border-stone-50 pb-3">
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.error(`Cart image failed to load for menu item: ${item.menuItem.name}`, item.menuItem.image);
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          if (!parent.querySelector('.image-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'image-fallback w-14 h-14 rounded-xl flex flex-col items-center justify-center bg-stone-100 text-stone-400 text-center flex-shrink-0';
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
                            `;
                            parent.insertBefore(fallback, parent.firstChild);
                          }
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate">{item.menuItem.name}</h5>
                      <span className="text-xs text-[#1A120B] font-extrabold">{item.menuItem.price} ETB</span>
                      {(() => {
                        const freshItem = menuItems.find(m => m.id === item.menuItem.id);
                        const isUnavailable = freshItem ? !freshItem.availability : !item.menuItem.availability;
                        if (isUnavailable) {
                          return (
                            <p className="text-[10px] text-red-500 font-extrabold mt-1 uppercase animate-pulse">
                              ⚠️ This item is currently unavailable.
                            </p>
                          );
                        }
                        return null;
                      })()}
                      {item.specialInstructions && (
                        <p className="text-[10px] text-stone-400 italic mt-0.5">"{item.specialInstructions}"</p>
                      )}
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl">
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                        className="p-1 rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold px-1 text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const freshItem = menuItems.find(m => m.id === item.menuItem.id);
                          if (freshItem && !freshItem.availability) {
                            showToast('This item is currently unavailable.', 'error');
                            return;
                          }
                          updateCartQuantity(item.menuItem.id, item.quantity + 1);
                        }}
                        className="p-1 rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Summary & Checkout footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/50">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Subtotal</span>
                  <span>{subtotal} ETB</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Service & Tax (Inclusive)</span>
                  <span>0.00 ETB</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span>{subtotal} ETB</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleCheckout}
                isLoading={isPlacingOrder}
                disabled={!currentTable}
                className="w-full py-4.5 rounded-full text-base font-bold shadow-lg flex items-center justify-center gap-2"
              >
                Confirm & Place Order ({subtotal} ETB)
              </Button>
              {!currentTable && (
                <p className="text-[11px] text-red-500 font-medium text-center mt-2 animate-pulse">
                  ⚠️ Please select Table number to confirm order!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal (Quantity selector) */}
      {selectedItemForModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItemForModal(null)}
          title="Customize Item"
        >
          <div className="flex flex-col gap-4">
            <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-100 relative">
              <img
                src={selectedItemForModal.image}
                alt={selectedItemForModal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.error(`Modal image failed to load for menu item: ${selectedItemForModal.name}`, selectedItemForModal.image);
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    if (!parent.querySelector('.image-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'image-fallback absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center';
                      fallback.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee mb-2"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2"/></svg>
                        <span class="text-xs font-bold uppercase tracking-wider text-stone-500">${selectedItemForModal.name}</span>
                      `;
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
            </div>
            <div>
              <div className="flex justify-between items-center gap-2">
                <h3 className="font-display text-xl font-bold text-stone-900">{selectedItemForModal.name}</h3>
                <span className="text-lg font-extrabold text-[#1A120B]">{selectedItemForModal.price} ETB</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">{selectedItemForModal.description}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between border-y border-stone-100 py-3 mt-1">
              <span className="text-xs font-semibold text-stone-600">Select Quantity</span>
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl">
                <button
                  onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-stone-800 w-6 text-center">{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity(prev => prev + 1)}
                  className="p-1.5 rounded-lg bg-white text-stone-700 hover:bg-stone-200 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Special Instructions
              </label>
              <textarea
                placeholder="e.g. Extra hot, no sugar, dairy-free milk alternative..."
                rows={2}
                value={modalInstructions}
                onChange={(e) => setModalInstructions(e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-[#D4A373]"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleConfirmAddToCart}
              className="w-full mt-2"
            >
              Add {modalQuantity} to Cart ({selectedItemForModal.price * modalQuantity} ETB)
            </Button>
          </div>
        </Modal>
      )}

      {/* Elegant Café Footer with Admin Link */}
      <footer className="mt-16 bg-stone-900 text-stone-400 py-12 px-6 border-t border-stone-800 rounded-t-3xl">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-2 text-stone-100">
            <Coffee className="text-[#D4A373]" size={24} />
            <span className="font-display font-bold text-lg tracking-wider">AMANDA COFFEE</span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
            Handcrafting coffee experiences daily. From our handpicked Yirgacheffe and Harar estates straight to your clay jebena bunna cup.
          </p>

          <div className="flex gap-6 text-xs font-semibold">
            <button onClick={() => navigateTo('customer-menu')} className="hover:text-stone-200 transition">Menu</button>
            <a href="#about" className="hover:text-stone-200 transition">About</a>
            <a href="#contact" className="hover:text-stone-200 transition">Contact</a>
          </div>

          <div className="w-full h-px bg-stone-800/60 my-2" />

          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-600">
            <span>© 2026 AMANDA COFFEE. All rights reserved.</span>
            
            {/* The ONLY Access point for Staff Login */}
            <button
              onClick={() => navigateTo('admin-login')}
              className="text-stone-500 hover:text-[#D4A373] font-semibold border border-stone-800 hover:border-[#D4A373]/20 px-3 py-1 rounded-md transition"
            >
              Staff Portal (Admin)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
