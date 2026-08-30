import { MenuItem, Table, InventoryItem, Expense, User } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@amanda.com', name: 'Amanda Admin', role: 'admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'u2', email: 'manager@amanda.com', name: 'Selam Manager', role: 'manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'u3', email: 'cashier@amanda.com', name: 'Kebede Cashier', role: 'cashier', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80' },
  { id: 'u4', email: 'waiter@amanda.com', name: 'Yonas Waiter', role: 'waiter', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'u5', email: 'kitchen@amanda.com', name: 'Aster Kitchen', role: 'kitchen', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' }
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Coffee
  {
    id: 'm1',
    name: 'Ethiopian Macchiato',
    description: 'Our signature double-layered macchiato with strong Harar coffee beans and rich textured milk.',
    price: 90,
    category: 'Coffee',
    image: '/images/macchiato.jpg',
    availability: true,
    preparationTime: 3
  },
  {
    id: 'm2',
    name: 'Amanda Espresso',
    description: 'Double shot of our hand-roasted Yirgacheffe espresso beans with dense gold crema.',
    price: 80,
    category: 'Coffee',
    image: '/images/espresso.jpg',
    availability: true,
    preparationTime: 2
  },
  {
    id: 'm3',
    name: 'Traditional Jebena Bunna',
    description: 'Slow-brewed traditional coffee prepared in a clay pot (Jebena), served with popcorn and frankincense aroma.',
    price: 110,
    category: 'Coffee',
    image: '/images/jebena.jpg',
    availability: true,
    preparationTime: 7
  },
  {
    id: 'm4',
    name: 'Café Latte',
    description: 'Silky smooth micro-foamed steamed milk over our premium espresso shot.',
    price: 120,
    category: 'Coffee',
    image: '/images/latte.jpg',
    availability: true,
    preparationTime: 4
  },
  {
    id: 'm5',
    name: 'Cappuccino',
    description: 'Equal parts espresso, steamed milk, and heavy textured milk foam with a dust of premium cocoa.',
    price: 110,
    category: 'Coffee',
    image: '/images/cappuccino.jpg',
    availability: true,
    preparationTime: 4
  },
  {
    id: 'm6',
    name: 'Iced Amanda Mocha',
    description: 'Rich chocolate, espresso, chilled milk, and ice topped with chocolate drizzle.',
    price: 135,
    category: 'Coffee',
    image: '/images/mocha.jpg',
    availability: true,
    preparationTime: 5
  },

  // Tea
  {
    id: 'm7',
    name: 'Ethiopian Spiced Tea (Shai)',
    description: 'Black tea infused with cardamom, cinnamon, cloves, and ginger.',
    price: 60,
    category: 'Tea',
    image: '/images/spiced_tea.jpg',
    availability: true,
    preparationTime: 3
  },
  {
    id: 'm8',
    name: 'Green Jasmine Tea',
    description: 'Fragrant and soothing premium green tea leaves infused with natural jasmine flowers.',
    price: 75,
    category: 'Tea',
    image: '/images/green_tea.jpg',
    availability: true,
    preparationTime: 3
  },

  // Juice
  {
    id: 'm9',
    name: 'Special Avocado & Mango Juice (Spis)',
    description: 'Thick layered fresh avocado and mango puree, served traditional style with fresh lime and Vimto syrup.',
    price: 140,
    category: 'Juice',
    image: '/images/spis_juice.jpg',
    availability: true,
    preparationTime: 5
  },
  {
    id: 'm10',
    name: 'Fresh Mixed Fruit Juice',
    description: 'Squeezed to order: orange, papaya, and mango layered beautifully in a glass.',
    price: 130,
    category: 'Juice',
    image: '/images/fruit_juice.jpg',
    availability: true,
    preparationTime: 5
  },

  // Food
  {
    id: 'm11',
    name: 'Premium Chicken Club Sandwich',
    description: 'Grilled chicken breast, crispy beef bacon, fried egg, lettuce, tomato, and garlic mayo on toasted sourdough.',
    price: 240,
    category: 'Food',
    image: '/images/sandwich.jpg',
    availability: true,
    preparationTime: 10
  },
  {
    id: 'm12',
    name: 'Amanda Special Chechebsa',
    description: 'Shredded flatbread braised with Ethiopian spiced butter (Niter Kibbeh) and berbere, served with honey and fresh yogurt.',
    price: 190,
    category: 'Food',
    image: '/images/chechebsa.jpg',
    availability: true,
    preparationTime: 8
  },
  {
    id: 'm13',
    name: 'Egg Firfir',
    description: 'Scrambled eggs simmered in a rich tomato, onion, and berbere sauce, mixed with broken pieces of injera.',
    price: 180,
    category: 'Food',
    image: '/images/egg_firfir.jpg',
    availability: true,
    preparationTime: 8
  },
  {
    id: 'm14',
    name: 'Butter Croissant',
    description: 'Flaky, buttery, golden French-style pastry baked fresh in-house daily.',
    price: 90,
    category: 'Food',
    image: '/images/croissant.jpg',
    availability: true,
    preparationTime: 1
  },

  // Soft Drinks
  {
    id: 'm15',
    name: 'Ambo Mineral Water',
    description: 'Naturally sparkling mineral water from the volcanic springs of Ambo, served chilled with lemon.',
    price: 60,
    category: 'Soft Drinks',
    image: '/images/ambo_water.jpg',
    availability: true,
    preparationTime: 1
  },
  {
    id: 'm16',
    name: 'Coca Cola',
    description: 'Classic chilled soft drink.',
    price: 50,
    category: 'Soft Drinks',
    image: '/images/coca_cola.jpg',
    availability: true,
    preparationTime: 1
  }
];

export const MOCK_TABLES: Table[] = [
  { id: 't1', number: 'Table 01', status: 'available' },
  { id: 't2', number: 'Table 02', status: 'occupied', currentOrderId: 'ord-102' },
  { id: 't3', number: 'Table 03', status: 'available' },
  { id: 't4', number: 'Table 04', status: 'occupied', currentOrderId: 'ord-103' },
  { id: 't5', number: 'Table 05', status: 'available' },
  { id: 't6', number: 'Table 06', status: 'available' },
  { id: 't7', number: 'Table 07', status: 'available' },
  { id: 't8', number: 'Table 08', status: 'available' }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Premium Coffee Beans (Yirgacheffe)', currentStock: 45, unit: 'kg', minStock: 15, status: 'in_stock', lastUpdated: '2026-08-28 09:30' },
  { id: 'i2', name: 'Fresh Whole Milk', currentStock: 8, unit: 'Liters', minStock: 10, status: 'low_stock', lastUpdated: '2026-08-28 10:15' },
  { id: 'i3', name: 'Refined White Sugar', currentStock: 2, unit: 'kg', minStock: 5, status: 'critical', lastUpdated: '2026-08-28 08:00' },
  { id: 'i4', name: 'Spiced Tea Leaves Blend', currentStock: 12, unit: 'kg', minStock: 3, status: 'in_stock', lastUpdated: '2026-08-28 11:20' },
  { id: 'i5', name: 'Fresh Avocados', currentStock: 28, unit: 'kg', minStock: 10, status: 'in_stock', lastUpdated: '2026-08-28 10:00' },
  { id: 'i6', name: 'Fresh Mangoes', currentStock: 15, unit: 'kg', minStock: 8, status: 'in_stock', lastUpdated: '2026-08-28 10:00' },
  { id: 'i7', name: 'Premium Sourdough Flour', currentStock: 50, unit: 'kg', minStock: 20, status: 'in_stock', lastUpdated: '2026-08-28 06:00' },
  { id: 'i8', name: 'Paper Takeaway Cups (12oz)', currentStock: 120, unit: 'pcs', minStock: 200, status: 'low_stock', lastUpdated: '2026-08-28 11:45' },
  { id: 'i9', name: 'Ambo Sparkling Mineral Bottles', currentStock: 0, unit: 'bottles', minStock: 24, status: 'out_of_stock', lastUpdated: '2026-08-28 12:00' }
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', category: 'Rent', amount: 35000, description: 'Monthly café venue lease payment', date: '2026-08-01' },
  { id: 'e2', category: 'Raw Materials', amount: 18500, description: 'Yirgacheffe coffee beans bulk order', date: '2026-08-10' },
  { id: 'e3', category: 'Utilities', amount: 8500, description: 'Water and electricity bills', date: '2026-08-15' },
  { id: 'e4', category: 'Staff Payroll', amount: 10000, description: 'Weekly wages for shifts', date: '2026-08-20' }
];

// Seed initial orders for system operation
export const INITIAL_ORDERS = [
  {
    id: '1021',
    tableId: 't1',
    tableNumber: 'Table 01',
    items: [
      { menuItem: MOCK_MENU_ITEMS[0], quantity: 2 }, // Macchiato
      { menuItem: MOCK_MENU_ITEMS[12], quantity: 1 } // Egg Firfir
    ],
    subtotal: 360,
    total: 360,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    createdAt: '2026-08-28 08:30',
    orderSource: 'customer',
    customerName: 'Samrawit'
  },
  {
    id: '1022',
    tableId: 't2',
    tableNumber: 'Table 02',
    items: [
      { menuItem: MOCK_MENU_ITEMS[2], quantity: 1 }, // Traditional Jebena Bunna
      { menuItem: MOCK_MENU_ITEMS[11], quantity: 1 } // Chechebsa
    ],
    subtotal: 300,
    total: 300,
    status: 'preparing',
    paymentStatus: 'unpaid',
    createdAt: '2026-08-28 10:10',
    orderSource: 'customer',
    customerName: 'Daniel'
  },
  {
    id: '1023',
    tableId: 't4',
    tableNumber: 'Table 04',
    items: [
      { menuItem: MOCK_MENU_ITEMS[8], quantity: 2 }, // Avocado & Mango juice
      { menuItem: MOCK_MENU_ITEMS[10], quantity: 2 } // Chicken club sandwich
    ],
    subtotal: 760,
    total: 760,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: '2026-08-28 11:15',
    orderSource: 'customer',
    customerName: 'Alem'
  }
];
