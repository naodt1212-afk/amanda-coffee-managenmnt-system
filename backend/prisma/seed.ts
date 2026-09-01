import { PrismaClient, Role, Category, OrderStatus, PaymentStatus, PaymentMethod, TableStatus, InventoryStatus, StockMovementType, OrderSource, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Amanda Coffee database...');

  // Clean existing data (in dependency order)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.diningTable.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.cafeSettings.deleteMany();
  await prisma.user.deleteMany();

  // ---- USERS (staff accounts, mirrors frontend MOCK_USERS) ----
  const passwordHash = await bcrypt.hash('12345678', 10);

  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@amanda.com', name: 'Amanda Admin', role: Role.admin, passwordHash, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { email: 'manager@amanda.com', name: 'Selam Manager', role: Role.manager, passwordHash, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { email: 'cashier@amanda.com', name: 'Kebede Cashier', role: Role.cashier, passwordHash, avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100' },
      { email: 'waiter@amanda.com', name: 'Yonas Waiter', role: Role.waiter, passwordHash, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      { email: 'kitchen@amanda.com', name: 'Aster Kitchen', role: Role.kitchen, passwordHash, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
    ],
  });

  console.log(`Created ${users.count} users`);

  // ---- MENU ITEMS (mirrors frontend MOCK_MENU_ITEMS) ----
  const menuData = [
    // Coffee
    { name: 'Ethiopian Macchiato', description: 'Our signature double-layered macchiato with strong Harar coffee beans and rich textured milk.', price: 90, category: Category.Coffee, image: '/images/macchiato.jpg', availability: true, preparationTime: 3 },
    { name: 'Amanda Espresso', description: 'Double shot of our hand-roasted Yirgacheffe espresso beans with dense gold crema.', price: 80, category: Category.Coffee, image: '/images/espresso.jpg', availability: true, preparationTime: 2 },
    { name: 'Traditional Jebena Bunna', description: 'Slow-brewed traditional coffee prepared in a clay pot (Jebena), served with popcorn and frankincense aroma.', price: 110, category: Category.Coffee, image: '/images/jebena.jpg', availability: true, preparationTime: 7 },
    { name: 'Café Latte', description: 'Silky smooth micro-foamed steamed milk over our premium espresso shot.', price: 120, category: Category.Coffee, image: '/images/latte.jpg', availability: true, preparationTime: 4 },
    { name: 'Cappuccino', description: 'Equal parts espresso, steamed milk, and heavy textured milk foam with a dust of premium cocoa.', price: 110, category: Category.Coffee, image: '/images/cappuccino.jpg', availability: true, preparationTime: 4 },
    { name: 'Iced Amanda Mocha', description: 'Rich chocolate, espresso, chilled milk, and ice topped with chocolate drizzle.', price: 135, category: Category.Coffee, image: '/images/mocha.jpg', availability: true, preparationTime: 5 },
    // Tea
    { name: 'Ethiopian Spiced Tea (Shai)', description: 'Black tea infused with cardamom, cinnamon, cloves, and ginger.', price: 60, category: Category.Tea, image: '/images/spiced_tea.jpg', availability: true, preparationTime: 3 },
    { name: 'Green Jasmine Tea', description: 'Fragrant and soothing premium green tea leaves infused with natural jasmine flowers.', price: 75, category: Category.Tea, image: '/images/green_tea.jpg', availability: true, preparationTime: 3 },
    // Juice
    { name: 'Special Avocado & Mango Juice (Spis)', description: 'Thick layered fresh avocado and mango puree, served traditional style with fresh lime and Vimto syrup.', price: 140, category: Category.Juice, image: '/images/spis_juice.jpg', availability: true, preparationTime: 5 },
    { name: 'Fresh Mixed Fruit Juice', description: 'Squeezed to order: orange, papaya, and mango layered beautifully in a glass.', price: 130, category: Category.Juice, image: '/images/fruit_juice.jpg', availability: true, preparationTime: 5 },
    // Food
    { name: 'Premium Chicken Club Sandwich', description: 'Grilled chicken breast, crispy beef bacon, fried egg, lettuce, tomato, and garlic mayo on toasted sourdough.', price: 240, category: Category.Food, image: '/images/sandwich.jpg', availability: true, preparationTime: 10 },
    { name: 'Amanda Special Chechebsa', description: 'Shredded flatbread braised with Ethiopian spiced butter (Niter Kibbeh) and berbere, served with honey and fresh yogurt.', price: 190, category: Category.Food, image: '/images/chechebsa.jpg', availability: true, preparationTime: 8 },
    { name: 'Egg Firfir', description: 'Scrambled eggs simmered in a rich tomato, onion, and berbere sauce, mixed with broken pieces of injera.', price: 180, category: Category.Food, image: '/images/egg_firfir.jpg', availability: true, preparationTime: 8 },
    { name: 'Butter Croissant', description: 'Flaky, buttery, golden French-style pastry baked fresh in-house daily.', price: 90, category: Category.Food, image: '/images/croissant.jpg', availability: true, preparationTime: 1 },
    // Soft Drinks
    { name: 'Ambo Mineral Water', description: 'Naturally sparkling mineral water from the volcanic springs of Ambo, served chilled with lemon.', price: 60, category: Category.Soft_Drinks, image: '/images/ambo_water.jpg', availability: true, preparationTime: 1 },
    { name: 'Coca Cola', description: 'Classic chilled soft drink.', price: 50, category: Category.Soft_Drinks, image: '/images/coca_cola.jpg', availability: true, preparationTime: 1 },
  ];

  const menuItems = [];
  for (const item of menuData) {
    const created = await prisma.menuItem.create({ data: item });
    menuItems.push(created);
  }

  console.log(`Created ${menuItems.length} menu items`);

  // ---- DINING TABLES (mirrors MOCK_TABLES) ----
  const tables = [];
  for (let i = 1; i <= 8; i++) {
    const created = await prisma.diningTable.create({
      data: {
        number: `Table ${String(i).padStart(2, '0')}`,
        status: TableStatus.available,
      },
    });
    tables.push(created);
  }

  console.log(`Created ${tables.length} dining tables`);

  // ---- SEED ORDERS (mirrors INITIAL_ORDERS) ----
  // Order 1021: complete at Table 01
  const order1 = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      tableNumber: tables[0].number,
      subtotal: 360,
      discount: 0,
      total: 360,
      status: OrderStatus.completed,
      paymentStatus: PaymentStatus.paid,
      paymentMethod: PaymentMethod.cash,
      createdAt: new Date('2026-08-28T08:30:00'),
      orderSource: OrderSource.customer,
      customerName: 'Samrawit',
      items: {
        create: [
          { menuItemId: menuItems[0].id, itemName: 'Ethiopian Macchiato', itemPrice: 90, quantity: 2 },
          { menuItemId: menuItems[12].id, itemName: 'Egg Firfir', itemPrice: 180, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  // Order 1022: preparing at Table 02
  const order2 = await prisma.order.create({
    data: {
      tableId: tables[1].id,
      tableNumber: tables[1].number,
      subtotal: 300,
      discount: 0,
      total: 300,
      status: OrderStatus.preparing,
      paymentStatus: PaymentStatus.unpaid,
      createdAt: new Date('2026-08-28T10:10:00'),
      orderSource: OrderSource.customer,
      customerName: 'Daniel',
      items: {
        create: [
          { menuItemId: menuItems[2].id, itemName: 'Traditional Jebena Bunna', itemPrice: 110, quantity: 1 },
          { menuItemId: menuItems[11].id, itemName: 'Amanda Special Chechebsa', itemPrice: 190, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  // Order 1023: pending at Table 04
  const order3 = await prisma.order.create({
    data: {
      tableId: tables[3].id,
      tableNumber: tables[3].number,
      subtotal: 760,
      discount: 0,
      total: 760,
      status: OrderStatus.pending,
      paymentStatus: PaymentStatus.unpaid,
      createdAt: new Date('2026-08-28T11:15:00'),
      orderSource: OrderSource.customer,
      customerName: 'Alem',
      items: {
        create: [
          { menuItemId: menuItems[8].id, itemName: 'Special Avocado & Mango Juice (Spis)', itemPrice: 140, quantity: 2 },
          { menuItemId: menuItems[10].id, itemName: 'Premium Chicken Club Sandwich', itemPrice: 240, quantity: 2 },
        ],
      },
    },
    include: { items: true },
  });

  // Link occupied tables to their current orders
  await prisma.diningTable.update({ where: { id: tables[1].id }, data: { status: TableStatus.occupied, currentOrderId: order2.id } });
  await prisma.diningTable.update({ where: { id: tables[3].id }, data: { status: TableStatus.occupied, currentOrderId: order3.id } });

  console.log('Created 3 seed orders');

  // ---- INVENTORY (mirrors MOCK_INVENTORY) ----
  const inventoryData = [
    { name: 'Premium Coffee Beans (Yirgacheffe)', currentStock: 45, unit: 'kg', minStock: 15, status: InventoryStatus.in_stock },
    { name: 'Fresh Whole Milk', currentStock: 8, unit: 'Liters', minStock: 10, status: InventoryStatus.low_stock },
    { name: 'Refined White Sugar', currentStock: 2, unit: 'kg', minStock: 5, status: InventoryStatus.critical },
    { name: 'Spiced Tea Leaves Blend', currentStock: 12, unit: 'kg', minStock: 3, status: InventoryStatus.in_stock },
    { name: 'Fresh Avocados', currentStock: 28, unit: 'kg', minStock: 10, status: InventoryStatus.in_stock },
    { name: 'Fresh Mangoes', currentStock: 15, unit: 'kg', minStock: 8, status: InventoryStatus.in_stock },
    { name: 'Premium Sourdough Flour', currentStock: 50, unit: 'kg', minStock: 20, status: InventoryStatus.in_stock },
    { name: 'Paper Takeaway Cups (12oz)', currentStock: 120, unit: 'pcs', minStock: 200, status: InventoryStatus.low_stock },
    { name: 'Ambo Sparkling Mineral Bottles', currentStock: 0, unit: 'bottles', minStock: 24, status: InventoryStatus.out_of_stock },
  ];

  const inventoryItems = [];
  for (const item of inventoryData) {
    const created = await prisma.inventoryItem.create({
      data: { ...item, lastUpdated: new Date('2026-08-28T10:00:00') },
    });
    inventoryItems.push(created);
  }

  console.log(`Created ${inventoryItems.length} inventory items`);

  // ---- STOCK MOVEMENTS (mirrors seed history) ----
  await prisma.stockMovement.createMany({
    data: [
      { itemId: inventoryItems[0].id, itemName: 'Premium Coffee Beans (Yirgacheffe)', type: StockMovementType.in, quantity: 20, note: 'Weekly supplier restocking', timestamp: new Date('2026-08-27T15:40:00') },
      { itemId: inventoryItems[2].id, itemName: 'Refined White Sugar', type: StockMovementType.out, quantity: 5, note: 'Daily kitchen depletion', timestamp: new Date('2026-08-28T08:15:00') },
    ],
  });

  console.log('Created stock movements');

  // ---- NOTIFICATIONS (mirrors seed) ----
  await prisma.notification.createMany({
    data: [
      { type: NotificationType.important_admin_notification, title: 'Welcome to Amanda Coffee!', message: 'The system has been loaded with premium Ethiopian café mock dataset.', isRead: false, createdAt: new Date() },
      { type: NotificationType.low_stock, title: 'Inventory Alert', message: 'Sugar stock is critical! Only 2 kg remaining.', isRead: false, createdAt: new Date() },
    ],
  });

  console.log('Created notifications');

  // ---- EXPENSES (mirrors MOCK_EXPENSES) ----
  await prisma.expense.createMany({
    data: [
      { category: 'Rent', amount: 35000, description: 'Monthly café venue lease payment', date: new Date('2026-08-01') },
      { category: 'Raw Materials', amount: 18500, description: 'Yirgacheffe coffee beans bulk order', date: new Date('2026-08-10') },
      { category: 'Utilities', amount: 8500, description: 'Water and electricity bills', date: new Date('2026-08-15') },
      { category: 'Staff Payroll', amount: 10000, description: 'Weekly wages for shifts', date: new Date('2026-08-20') },
    ],
  });

  console.log('Created expenses');

  // ---- CAFE SETTINGS ----
  await prisma.cafeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: 'AMANDA COFFEE',
      address: 'Bole Road, Addis Ababa, Ethiopia',
      tablesCount: 8,
      taxPercent: 15,
      servicePercent: 5,
      autoPrintReceipt: false,
    },
  });

  console.log('Created cafe settings');

  console.log('✅ Seed complete!');
  console.log('Demo login accounts (password: 12345678):');
  console.log('  admin@amanda.com    (admin)');
  console.log('  manager@amanda.com  (manager)');
  console.log('  cashier@amanda.com  (cashier)');
  console.log('  waiter@amanda.com   (waiter)');
  console.log('  kitchen@amanda.com  (kitchen)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
