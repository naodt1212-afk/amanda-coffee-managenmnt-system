export type Role = 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export type Category = 'Coffee' | 'Tea' | 'Juice' | 'Food' | 'Soft Drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in ETB
  category: Category;
  image: string;
  availability: boolean;
  preparationTime?: number; // in minutes
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cash' | 'telebirr' | 'other';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  orderSource: 'customer' | 'staff';
  customerName?: string;
}

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied';
  currentOrderId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  minStock: number;
  status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock';
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  note: string;
  timestamp: string;
}

export type NotificationType = 'new_order' | 'order_ready' | 'low_stock' | 'payment_confirmation' | 'important_admin_notification';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface DashboardStats {
  todaySales: number;
  dailyOrdersCount: number;
  monthlySales: number;
  customersCount: number;
  expensesTotal: number;
  netProfit: number;
}
