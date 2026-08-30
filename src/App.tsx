import React, { useState } from 'react';
import { AppProvider, useApp, ActivePage } from './context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerMenu } from './pages/CustomerMenu';
import { OrderStatus } from './pages/OrderStatus';
import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { MenuManagement } from './pages/MenuManagement';
import { TableManagement } from './pages/TableManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { KitchenDisplay } from './pages/KitchenDisplay';
import { Payments } from './pages/Payments';
import { Reports } from './pages/Reports';
import { Employees } from './pages/Employees';
import { Settings } from './pages/Settings';
import { ToastContainer, Badge } from './components/UI';
import { AmandaLogo } from './components/AmandaLogo';
import { 
  Coffee, BarChart2, ShoppingBag, Table, Package, ChefHat, 
  CreditCard, TrendingUp, Users, Settings as SettingsIcon, 
  LogOut, Bell, Menu as Hamburger, X, AlertCircle, Sparkles, Check, Info 
} from 'lucide-react';

// Sidebar Link Item Type
interface NavigationLink {
  page: ActivePage;
  label: string;
  icon: React.ReactNode;
}

const AppContent: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    activePage, 
    navigateTo, 
    logout, 
    toasts,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Define Links per role based on centralized permission system
  const getSidebarLinks = (): NavigationLink[] => {
    if (!currentRole) return [];

    const links: Record<string, NavigationLink[]> = {
      admin: [
        { page: 'admin-dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
        { page: 'admin-orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
        { page: 'admin-menu', label: 'Menu List', icon: <Coffee size={16} /> },
        { page: 'admin-tables', label: 'Tables Map', icon: <Table size={16} /> },
        { page: 'admin-inventory', label: 'Inventory', icon: <Package size={16} /> },
        { page: 'admin-kitchen', label: 'Kitchen KDS', icon: <ChefHat size={16} /> },
        { page: 'admin-payments', label: 'POS Cashier', icon: <CreditCard size={16} /> },
        { page: 'admin-reports', label: 'Reports', icon: <TrendingUp size={16} /> },
        { page: 'admin-employees', label: 'Employees', icon: <Users size={16} /> },
        { page: 'admin-settings', label: 'Settings', icon: <SettingsIcon size={16} /> }
      ],
      manager: [
        { page: 'admin-dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
        { page: 'admin-orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
        { page: 'admin-menu', label: 'Menu List', icon: <Coffee size={16} /> },
        { page: 'admin-tables', label: 'Tables Map', icon: <Table size={16} /> },
        { page: 'admin-inventory', label: 'Inventory', icon: <Package size={16} /> },
        { page: 'admin-kitchen', label: 'Kitchen KDS', icon: <ChefHat size={16} /> },
        { page: 'admin-reports', label: 'Reports', icon: <TrendingUp size={16} /> }
      ],
      cashier: [
        { page: 'admin-dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
        { page: 'admin-orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
        { page: 'admin-tables', label: 'Tables Map', icon: <Table size={16} /> },
        { page: 'admin-payments', label: 'POS Cashier', icon: <CreditCard size={16} /> }
      ],
      waiter: [
        { page: 'admin-orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
        { page: 'admin-tables', label: 'Tables Map', icon: <Table size={16} /> }
      ],
      kitchen: [
        { page: 'admin-kitchen', label: 'Kitchen KDS', icon: <ChefHat size={16} /> }
      ]
    };

    return links[currentRole] || [];
  };

  const navLinks = getSidebarLinks();

  // Screen router logic
  const renderPage = () => {
    switch (activePage) {
      // Customer
      case 'customer-menu':
      case 'customer-cart':
        return <CustomerMenu />;
      case 'customer-order-status':
        return <OrderStatus />;
      
      // Staff Auth
      case 'admin-login':
        return <AdminLogin />;

      // Staff Dashboard Pages (Protected)
      case 'admin-dashboard':
        return <Dashboard />;
      case 'admin-orders':
        return <Orders />;
      case 'admin-menu':
        return <MenuManagement />;
      case 'admin-tables':
        return <TableManagement />;
      case 'admin-inventory':
        return <InventoryManagement />;
      case 'admin-kitchen':
        return <KitchenDisplay />;
      case 'admin-payments':
        return <Payments />;
      case 'admin-reports':
        return <Reports />;
      case 'admin-employees':
        return <Employees />;
      case 'admin-settings':
        return <Settings />;
      default:
        return <CustomerMenu />;
    }
  };

  // Check if current active view belongs to customer or auth portal
  const isPublicView = activePage.startsWith('customer-') || activePage === 'admin-login';

  // Manage welcome popup dismissal state in sessionStorage
  const [showWelcomePopup, setShowWelcomePopup] = React.useState(false);

  React.useEffect(() => {
    if (activePage.startsWith('customer-')) {
      const isDismissed = sessionStorage.getItem('amanda_welcome_dismissed');
      if (!isDismissed) {
        // Show after a subtle 500ms delay for visual elegance
        const timer = setTimeout(() => setShowWelcomePopup(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [activePage]);

  const dismissPopup = () => {
    sessionStorage.setItem('amanda_welcome_dismissed', 'true');
    setShowWelcomePopup(false);
  };

  if (isPublicView) {
    const isCustomerView = activePage.startsWith('customer-');

    if (isCustomerView) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#120A05] via-[#1A120B] to-[#2D1B14] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden">
          <ToastContainer toasts={toasts} />
          
          {/* Beautiful Smartphone Mockup Frame for Desktop, fluidly scaling to full screen on Mobile */}
          <div className="w-full sm:max-w-[420px] sm:h-[880px] sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-[#F8F9FA] relative flex flex-col overflow-hidden sm:border-8 sm:border-stone-850">
            {/* Device Status Bar Accent on larger screens */}
            <div className="hidden sm:flex h-6 bg-[#1A120B] text-[10px] text-stone-400 px-6 items-center justify-between font-bold flex-shrink-0 z-50 select-none">
              <span>9:41 AM</span>
              {/* Speaker Notch */}
              <div className="w-16 h-4 bg-stone-900 rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-4 h-2.5 bg-stone-500 rounded-xs" />
              </div>
            </div>

            {/* Simulated Customer App Viewport */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, x: 15, y: 0 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -15, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col"
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky Home Indicator on Desktop frame */}
            <div className="hidden sm:flex h-5 bg-[#F8F9FA] items-center justify-center flex-shrink-0 border-t border-stone-100 z-50">
              <div className="w-28 h-1 bg-stone-300 rounded-full" />
            </div>
          </div>

          {/* Opening Welcome Popup Modal Overlay */}
          {showWelcomePopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md animate-fade-in">
              <div 
                className="bg-gradient-to-b from-[#2D1B14] to-[#1A120B] rounded-[32px] border border-[#D4A373]/30 p-8 max-w-xs w-full text-center shadow-2xl relative overflow-hidden animate-scale-up"
              >
                {/* Decorative golden radial background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#D4A373]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Amanda Coffee High-Fidelity Logo */}
                <div className="mb-4 flex justify-center">
                  <AmandaLogo variant="badge" size="sm" className="shadow-lg border border-[#D4A373]/20" />
                </div>

                <h3 className="font-display text-xl font-black text-white tracking-wide mb-2">
                  Welcome to AMANDA COFFEE ☕
                </h3>

                <p className="text-[11px] text-stone-300 leading-relaxed font-light mb-6 px-1">
                  Enjoy our hand-roasted coffee, fresh food, and premium drinks. Browse the menu and place your order directly from your table.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={dismissPopup}
                    className="w-full py-3 bg-[#D4A373] text-[#1A120B] text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#D4A373]/20 hover:bg-[#c99867] transition active:scale-95 duration-200"
                  >
                    View Menu
                  </button>
                  <button
                    onClick={dismissPopup}
                    className="text-[10px] text-stone-400 hover:text-white transition font-bold uppercase tracking-widest py-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Admin login or other standalone views
    return (
      <div className="relative">
        <ToastContainer toasts={toasts} />
        {renderPage()}
      </div>
    );
  }

  // Dashboard staff layout Shell wrapper
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-stone-950">
      <ToastContainer toasts={toasts} />

      {/* Responsive Sidebar for larger devices */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#1A120B] text-stone-200 border-r border-stone-900 flex-shrink-0">
        <div className="flex flex-col gap-6 p-6">
          {/* Brand Logo Header */}
          <div className="flex flex-col gap-1 border-b border-stone-800/80 pb-4">
            <AmandaLogo variant="horizontal" size="sm" />
            <div className="mt-1 bg-[#2D1B14] px-2.5 py-0.5 rounded-full border border-[#D4A373]/10 self-start">
              <span className="text-[9px] text-[#D4A373] font-bold uppercase tracking-wider">{currentRole} Portal</span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const isSelected = activePage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isSelected 
                      ? 'bg-[#D4A373] text-[#1A120B] scale-102 shadow-md shadow-[#D4A373]/10' 
                      : 'hover:bg-[#D4A373]/10 text-stone-300 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer logout */}
        <div className="p-6 border-t border-stone-800/80 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-800 bg-[#2D1B14] flex items-center justify-center p-1.5 flex-shrink-0 shadow-inner">
              <AmandaLogo variant="icon" className="w-full h-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{currentUser?.name}</span>
              <span className="text-[9px] uppercase font-bold text-stone-400">{currentUser?.role}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-800 hover:border-[#D4A373]/20 text-stone-300 hover:text-white text-xs font-bold transition"
          >
            <LogOut size={14} /> Log Out Terminal
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Hidden default) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" 
            onClick={() => setIsMobileSidebarOpen(false)} 
          />
          {/* Drawer content */}
          <aside className="relative flex flex-col justify-between w-64 bg-[#1A120B] text-stone-200 p-6 z-10 animate-slide-right">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-stone-800/80 pb-4">
                <AmandaLogo variant="horizontal" size="sm" />
                <button onClick={() => setIsMobileSidebarOpen(false)} className="text-stone-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((item) => {
                  const isSelected = activePage === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => {
                        navigateTo(item.page);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-[#D4A373] text-[#1A120B] shadow-md shadow-[#D4A373]/10' 
                          : 'hover:bg-[#D4A373]/10 text-stone-300 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-4 border-t border-stone-800/80 pt-4">
              <button
                onClick={() => {
                  logout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-800 text-stone-300 hover:text-white text-xs font-bold transition"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main viewport Container layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Burger menu trigger */}
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-50 text-stone-600 transition"
          >
            <Hamburger size={20} />
          </button>

          {/* Current view subtitle */}
          <span className="text-xs uppercase font-bold text-stone-400 tracking-wider hidden sm:block">
            Secure POS Station Terminal • bole_branch
          </span>
          <span className="text-xs uppercase font-bold text-stone-400 tracking-wider sm:hidden">
            Amanda POS
          </span>

          {/* Right utility items */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notification Bell Menu */}
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl transition relative"
            >
              <Bell size={18} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4A373] text-[#1A120B] text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Menu Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl border border-stone-200/80 shadow-2xl w-80 p-4 z-40 animate-slide-up">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-stone-800">Alerts Hub ({unreadNotificationCount})</span>
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-[#D4A373] hover:underline font-bold"
                  >
                    Clear All Read
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-stone-400 italic text-center py-6">No unread notifications</p>
                  ) : (
                    notifications.map((n) => {
                      const icons = {
                        new_order: <Sparkles size={12} className="text-[#D4A373]" />,
                        order_ready: <Check size={12} className="text-[#D4A373]" />,
                        low_stock: <AlertCircle size={12} className="text-red-600" />,
                        payment_confirmation: <Check size={12} className="text-[#D4A373]" />,
                        important_admin_notification: <Info size={12} className="text-stone-600" />
                      };

                      const backgrounds = {
                        new_order: "bg-[#D4A373]/10",
                        order_ready: "bg-[#D4A373]/5",
                        low_stock: "bg-rose-50",
                        payment_confirmation: "bg-[#D4A373]/5",
                        important_admin_notification: "bg-stone-50"
                      };

                      return (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            showToast(`Inspecting: ${n.title}`, 'info');
                          }}
                          className={`p-2 rounded-xl flex gap-2.5 items-start cursor-pointer transition ${
                            n.isRead ? 'opacity-55 hover:opacity-100 bg-white' : backgrounds[n.type] || 'bg-stone-50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5`}>
                            {icons[n.type] || <Info size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-black text-stone-900 leading-tight">{n.title}</h4>
                            <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="w-full h-px bg-stone-100 my-2" />
                <button 
                  onClick={() => setIsNotifOpen(false)} 
                  className="w-full text-center py-1 text-[10px] font-bold text-stone-500 hover:text-stone-800 transition"
                >
                  Close Panel
                </button>
              </div>
            )}

            {/* Quick mini avatar profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-[#2D1B14] flex items-center justify-center p-1 flex-shrink-0 shadow-sm">
                <AmandaLogo variant="icon" className="w-full h-full" />
              </div>
              <span className="text-xs font-bold text-stone-850 hidden sm:inline">{currentUser?.name.split(' ')[0]}</span>
            </div>

          </div>
        </header>

        {/* Page Render Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
