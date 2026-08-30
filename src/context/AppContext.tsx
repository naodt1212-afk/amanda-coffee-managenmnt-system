import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, MenuItem, Table, Order, CartItem, InventoryItem, StockMovement, Notification, Expense, DashboardStats, ToastMessage } from '../types';
import { MOCK_USERS, MOCK_MENU_ITEMS, MOCK_TABLES, MOCK_INVENTORY, MOCK_EXPENSES, INITIAL_ORDERS } from '../data/mockData';

export type ActivePage = 
  | 'customer-menu' 
  | 'customer-cart' 
  | 'customer-order-status' 
  | 'customer-order-confirmation'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-orders'
  | 'admin-menu'
  | 'admin-tables'
  | 'admin-inventory'
  | 'admin-kitchen'
  | 'admin-payments'
  | 'admin-reports'
  | 'admin-employees'
  | 'admin-settings';

interface AppContextType {
  // Authentication
  currentUser: User | null;
  currentRole: Role | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];

  // Routing
  activePage: ActivePage;
  navigateTo: (page: ActivePage) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  // Menu Management
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Table Management
  tables: Table[];
  selectTable: (id: string) => void;
  currentTable: Table | null;
  updateTableStatus: (id: string, status: 'available' | 'occupied', currentOrderId?: string) => void;

  // Cart & Customer Ordering
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName?: string) => Promise<Order>;

  // Order Management
  orders: Order[];
  createOrderFromStaff: (tableId: string, items: CartItem[], customerName?: string) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => void;
  addItemsToExistingOrder: (orderId: string, items: CartItem[]) => void;

  // Payments
  payOrder: (orderId: string, method: 'cash' | 'telebirr' | 'other', discount: number, amountPaid: number) => Order | null;
  activeReceipt: Order | null;
  setActiveReceipt: (order: Order | null) => void;

  // Inventory Management
  inventory: InventoryItem[];
  adjustStock: (itemId: string, quantity: number, type: 'in' | 'out' | 'adjust', note: string) => void;
  stockHistory: StockMovement[];

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addSystemNotification: (type: Notification['type'], title: string, message: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Expenses & Reports
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  getDashboardStats: () => DashboardStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Core Data lists loaded from mock files with localStorage persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const mapUnsplashToLocal = (item: MenuItem): MenuItem => {
      if (!item.image || !item.image.includes('unsplash.com')) return item;
      let localImage = item.image;
      const id = item.id;
      if (id === 'm1') localImage = '/images/macchiato.jpg';
      else if (id === 'm2') localImage = '/images/espresso.jpg';
      else if (id === 'm3') localImage = '/images/jebena.jpg';
      else if (id === 'm4') localImage = '/images/latte.jpg';
      else if (id === 'm5') localImage = '/images/cappuccino.jpg';
      else if (id === 'm6') localImage = '/images/mocha.jpg';
      else if (id === 'm7') localImage = '/images/spiced_tea.jpg';
      else if (id === 'm8') localImage = '/images/green_tea.jpg';
      else if (id === 'm9') localImage = '/images/spis_juice.jpg';
      else if (id === 'm10') localImage = '/images/fruit_juice.jpg';
      else if (id === 'm11') localImage = '/images/sandwich.jpg';
      else if (id === 'm12') localImage = '/images/chechebsa.jpg';
      else if (id === 'm13') localImage = '/images/egg_firfir.jpg';
      else if (id === 'm14') localImage = '/images/croissant.jpg';
      else if (id === 'm15') localImage = '/images/ambo_water.jpg';
      else if (id === 'm16') localImage = '/images/coca_cola.jpg';
      return { ...item, image: localImage };
    };

    const saved = localStorage.getItem('amanda_menu_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(mapUnsplashToLocal);
        }
      } catch (e) {
        console.error('Failed to parse saved menu items:', e);
      }
    }
    return MOCK_MENU_ITEMS.map(mapUnsplashToLocal);
  });

  useEffect(() => {
    localStorage.setItem('amanda_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [orders, setOrders] = useState<Order[]>(() => {
    // Return INITIAL_ORDERS on mount
    return INITIAL_ORDERS as Order[];
  });

  // Client states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('customer-menu');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'important_admin_notification',
      title: 'Welcome to Amanda Coffee!',
      message: 'The system has been loaded with premium Ethiopian café mock dataset.',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'n2',
      type: 'low_stock',
      title: 'Inventory Alert',
      message: 'Sugar stock is critical! Only 2 kg remaining.',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show dynamic banner
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Helper to sync route hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // Validate and routing
        if (hash.startsWith('order/')) {
          const ordId = hash.split('/')[1];
          setActiveOrderId(ordId);
          setActivePage('customer-order-status');
        } else if (hash === 'login') {
          setActivePage('admin-login');
        } else {
          setActivePage(hash as ActivePage);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    window.location.hash = page;
  };

  // Stock Movement tracking logs
  const [stockHistory, setStockHistory] = useState<StockMovement[]>([
    { id: 'sm1', itemId: 'i1', itemName: 'Premium Coffee Beans (Yirgacheffe)', type: 'in', quantity: 20, note: 'Weekly supplier restocking', timestamp: '2026-08-27 15:40' },
    { id: 'sm2', itemId: 'i3', itemName: 'Refined White Sugar', type: 'out', quantity: 5, note: 'Daily kitchen depletion', timestamp: '2026-08-28 08:15' }
  ]);

  // Authenticate user
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo password checks
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && password === '12345678') {
      setCurrentUser(foundUser);
      setCurrentRole(foundUser.role);
      showToast(`Logged in successfully as ${foundUser.name}`, 'success');
      
      // Navigate to correct staff landing route
      if (foundUser.role === 'kitchen') {
        navigateTo('admin-kitchen');
      } else {
        navigateTo('admin-dashboard');
      }
      return true;
    }
    showToast('Invalid credentials. Double-check your email and password.', 'error');
    return false;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    showToast('Logged out successfully', 'info');
    navigateTo('customer-menu');
  };

  // Menu actions
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'm' + (menuItems.length + 1)
    };
    setMenuItems(prev => [newItem, ...prev]);
    showToast(`Added ${item.name} to the menu!`, 'success');
  };

  const updateMenuItem = (id: string, updated: Partial<MenuItem>) => {
    let itemName = '';
    const isAvailabilityUpdate = 'availability' in updated;
    
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        itemName = item.name;
        return { ...item, ...updated };
      }
      return item;
    }));

    if (isAvailabilityUpdate && itemName) {
      if (updated.availability) {
        showToast(`${itemName} is now available.`, 'success');
      } else {
        showToast(`${itemName} marked Out of Stock.`, 'success');
      }
    } else {
      showToast('Menu item updated successfully!', 'success');
    }
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    showToast('Menu item removed', 'info');
  };

  // Tables
  const selectTable = (id: string) => {
    const tableObj = tables.find(t => t.id === id) || null;
    setCurrentTable(tableObj);
    if (tableObj) {
      showToast(`Table selected: ${tableObj.number}`, 'success');
    }
  };

  const updateTableStatus = (id: string, status: 'available' | 'occupied', currentOrderId?: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status, currentOrderId } : t));
  };

  // Cart operations
  const addToCart = (menuItem: MenuItem, quantity: number, instructions?: string) => {
    if (!menuItem.availability) {
      showToast('This item is currently out of stock!', 'error');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.menuItem.id === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].specialInstructions = instructions || updated[existingIndex].specialInstructions;
        return updated;
      }
      return [...prev, { menuItem, quantity, specialInstructions: instructions }];
    });
    showToast(`Added ${quantity}x ${menuItem.name} to cart`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.menuItem.id === itemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Add system persistent alert
  const addSystemNotification = (type: Notification['type'], title: string, message: string) => {
    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Place customer self order
  const placeOrder = async (customerName: string = 'Guest Customer'): Promise<Order> => {
    if (!currentTable) {
      showToast('Please select a table first!', 'error');
      throw new Error('Table not selected');
    }
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      throw new Error('Cart is empty');
    }

    // Verify all cart items are available in real-time before checkout
    const unavailableItems = cart.filter(item => {
      const freshItem = menuItems.find(m => m.id === item.menuItem.id);
      return freshItem ? !freshItem.availability : !item.menuItem.availability;
    });

    if (unavailableItems.length > 0) {
      showToast(`Sorry, ${unavailableItems[0].menuItem.name} is currently out of stock. Please remove it from your cart!`, 'error');
      throw new Error('Unavailable items in cart');
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
    const total = subtotal; // ETB currency with simple 1:1 total

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      tableId: currentTable.id,
      tableNumber: currentTable.number,
      items: [...cart],
      subtotal,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      orderSource: 'customer',
      customerName
    };

    // Update state lists
    setOrders(prev => [newOrder, ...prev]);
    updateTableStatus(currentTable.id, 'occupied', newOrder.id);
    
    // Clear and redirect
    clearCart();
    setActiveOrderId(newOrder.id);

    // Trigger Notification
    addSystemNotification(
      'new_order',
      'New Customer Order',
      `${customerName} placed Order #${newOrder.id} at ${currentTable.number} for ETB ${total}`
    );

    showToast('Order placed successfully! Sending to kitchen...', 'success');
    navigateTo('customer-order-status');
    return newOrder;
  };

  // Create staff side order directly from terminal/POS
  const createOrderFromStaff = (tableId: string, items: CartItem[], customerName: string = 'Dine-In Customer'): Order => {
    const tableObj = tables.find(t => t.id === tableId)!;
    const subtotal = items.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
    const total = subtotal;

    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      tableId: tableId,
      tableNumber: tableObj?.number || 'Takeaway',
      items: items,
      subtotal,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      orderSource: 'staff',
      customerName
    };

    setOrders(prev => [newOrder, ...prev]);
    if (tableObj) {
      updateTableStatus(tableId, 'occupied', newOrder.id);
    }

    addSystemNotification(
      'new_order',
      'Staff Placed Order',
      `Order #${newOrder.id} logged for ${tableObj?.number || 'Takeaway'} - ETB ${total}`
    );

    showToast(`Order #${newOrder.id} logged successfully`, 'success');
    return newOrder;
  };

  // Update order status & fire Toast / Notifications when appropriate
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status };
        
        // Trigger specific notification flow
        if (status === 'ready') {
          addSystemNotification(
            'order_ready',
            'Order Ready to Serve',
            `Order #${orderId} for ${o.tableNumber} is prepared and ready!`
          );
          showToast(`Order #${orderId} is READY! Waiter/Cashier notified.`, 'success');
        } else if (status === 'completed') {
          showToast(`Order #${orderId} completed successfully.`, 'success');
        } else {
          showToast(`Order #${orderId} updated to ${status}.`, 'info');
        }
        
        return updated;
      }
      return o;
    }));
  };

  // Cancel Order
  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        showToast(`Order #${orderId} has been cancelled.`, 'error');
        updateTableStatus(o.tableId, 'available', undefined);
        return { ...o, status: 'cancelled' as const };
      }
      return o;
    }));
  };

  // Add items to existing order
  const addItemsToExistingOrder = (orderId: string, extraItems: CartItem[]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const mergedItems = [...o.items];
        extraItems.forEach(extra => {
          const matched = mergedItems.find(i => i.menuItem.id === extra.menuItem.id);
          if (matched) {
            matched.quantity += extra.quantity;
          } else {
            mergedItems.push(extra);
          }
        });
        const subtotal = mergedItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
        showToast(`Added items to Order #${orderId}`, 'success');
        return { ...o, items: mergedItems, subtotal, total: subtotal };
      }
      return o;
    }));
  };

  // Process payment screen
  const payOrder = (orderId: string, method: 'cash' | 'telebirr' | 'other', discount: number, amountPaid: number): Order | null => {
    let orderToReturn: Order | null = null;
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedTotal = Math.max(0, o.total - discount);
        const paidOrder: Order = {
          ...o,
          paymentStatus: 'paid',
          paymentMethod: method,
          total: updatedTotal,
          status: 'completed' // Complete the order when paid
        };
        orderToReturn = paidOrder;
        
        // Mark Table available again
        updateTableStatus(o.tableId, 'available', undefined);
        
        addSystemNotification(
          'payment_confirmation',
          'Payment Confirmed',
          `Order #${orderId} paid with ${method.toUpperCase()} (Total ETB ${updatedTotal})`
        );
        showToast(`Payment of ETB ${updatedTotal} accepted! Receipt generated.`, 'success');
        return paidOrder;
      }
      return o;
    }));

    return orderToReturn;
  };

  // Inventory logic
  const adjustStock = (itemId: string, quantity: number, type: 'in' | 'out' | 'adjust', note: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        let newStock = item.currentStock;
        if (type === 'in') newStock += quantity;
        else if (type === 'out') newStock = Math.max(0, item.currentStock - quantity);
        else if (type === 'adjust') newStock = quantity;

        // Recalculate status
        let status: InventoryItem['status'] = 'in_stock';
        if (newStock === 0) status = 'out_of_stock';
        else if (newStock <= item.minStock / 2) status = 'critical';
        else if (newStock <= item.minStock) status = 'low_stock';

        const updatedItem = {
          ...item,
          currentStock: newStock,
          status,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        // If low or critical, trigger notification
        if (status === 'critical' || status === 'out_of_stock') {
          addSystemNotification(
            'low_stock',
            'Critical Stock Alert!',
            `${item.name} is extremely low (${newStock} ${item.unit} remaining). Restock immediately!`
          );
        }

        // Add history log
        const logId = 'sm-' + Math.random().toString(36).substr(2, 9);
        setStockHistory(history => [
          {
            id: logId,
            itemId,
            itemName: item.name,
            type,
            quantity,
            note,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
          },
          ...history
        ]);

        showToast(`${item.name} stock updated successfully`, 'success');
        return updatedItem;
      }
      return item;
    }));
  };

  // Expense addition
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: 'e' + (expenses.length + 1)
    };
    setExpenses(prev => [newExp, ...prev]);
    showToast(`Expense for ${expense.category} logged`, 'success');
  };

  // Mark specific notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Mark all
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All alerts marked as read', 'info');
  };

  // Dashboard Stats live calculation based on current state
  const getDashboardStats = (): DashboardStats => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    
    const todaySales = paidOrders
      .filter(o => o.createdAt.startsWith(todayStr) || o.id === '1021') // Include mock completed seed
      .reduce((acc, o) => acc + o.total, 0) + 24580; // Add standard baseline base from user requirements

    const dailyOrdersCount = orders.length + 125; // baseline scale

    const monthlySales = paidOrders.reduce((acc, o) => acc + o.total, 0) + 485200; // baseline scale

    const customersCount = Math.round(dailyOrdersCount * 2.6);

    const expensesTotal = expenses.reduce((acc, e) => acc + e.amount, 0) + 52000;

    const netProfit = monthlySales - expensesTotal;

    return {
      todaySales,
      dailyOrdersCount,
      monthlySales,
      customersCount,
      expensesTotal,
      netProfit
    };
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider value={{
      currentUser,
      currentRole,
      login,
      logout,
      users: MOCK_USERS,
      
      activePage,
      navigateTo,
      activeOrderId,
      setActiveOrderId,

      menuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,

      tables,
      selectTable,
      currentTable,
      updateTableStatus,

      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,

      orders,
      createOrderFromStaff,
      updateOrderStatus,
      cancelOrder,
      addItemsToExistingOrder,

      payOrder,
      activeReceipt,
      setActiveReceipt,

      inventory,
      adjustStock,
      stockHistory,

      notifications,
      unreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addSystemNotification,

      toasts,
      showToast,

      expenses,
      addExpense,
      getDashboardStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
