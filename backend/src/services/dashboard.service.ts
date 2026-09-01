import { PaymentStatus, Category, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getCategoryDisplayName } from './menu.service';

// Dashboard statistics mirroring frontend getDashboardStats()
export const getDashboardStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Sold orders (paid)
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: PaymentStatus.paid },
    select: { total: true, createdAt: true, id: true },
  });

  const allOrders = await prisma.order.findMany({ select: { id: true, createdAt: true } });
  const expenses = await prisma.expense.findMany({ select: { amount: true } });

  const isToday = (d: Date) => d >= todayStart;
  const isThisMonth = (d: Date) => d >= monthStart;

  const todaySales = paidOrders
    .filter((o) => isToday(o.createdAt))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const monthlySales = paidOrders
    .filter((o) => isThisMonth(o.createdAt))
    .reduce((sum, o) => sum + Number(o.total), 0);

  const dailyOrdersCount = allOrders.filter((o) => isToday(o.createdAt)).length;

  const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = monthlySales - expensesTotal;

  // Active customers (approx: 2.6x orders)
  const customersCount = Math.round(dailyOrdersCount * 2.6);

  return {
    todaySales,
    dailyOrdersCount,
    monthlySales,
    customersCount,
    expensesTotal,
    netProfit,
  };
};

// Report summary: gross sales, expenses, net profit
export const getReportSummary = async (from?: string, to?: string) => {
  const where: Prisma.OrderWhereInput = { paymentStatus: PaymentStatus.paid };

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const paidOrders = await prisma.order.findMany({
    where,
    select: { total: true },
  });

  const grossSales = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const expenses = await prisma.expense.findMany({ select: { amount: true, date: true } });
  const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    grossSales,
    expensesTotal: expenseTotal,
    netProfit: grossSales - expenseTotal,
  };
};

// Sales breakdown by menu category
export const getCategorySales = async () => {
  // Fetch all paid orders with their items to compute per-category sales
  const soldItems = await prisma.orderItem.findMany({
    where: {
      order: {
        paymentStatus: PaymentStatus.paid,
      },
    },
    include: {
      menuItem: true,
    },
  });

  const categoryTotals: Record<string, { sales: number; items: number }> = {};

  for (const item of soldItems) {
    // Use item.category from menuItem, fallback by name
    const category = item.menuItem ? getCategoryDisplayName(item.menuItem.category) : 'Other';
    if (!categoryTotals[category]) {
      categoryTotals[category] = { sales: 0, items: 0 };
    }
    categoryTotals[category].sales += Number(item.itemPrice) * item.quantity;
    categoryTotals[category].items += item.quantity;
  }

  const hasData = Object.keys(categoryTotals).length > 0;

  // Build a sorted list with percentages; include all known categories
  const allCategories = Object.values(Category).map(getCategoryDisplayName);
  const totalSales = Object.values(categoryTotals).reduce((s, c) => s + c.sales, 0);

  const result = allCategories
    .map((cat) => {
      const data = categoryTotals[cat] || { sales: 0, items: 0 };
      return {
        category: cat,
        sales: data.sales,
        items: data.items,
        percent: totalSales > 0 ? Math.round((data.sales / totalSales) * 100) : 0,
      };
    })
    .sort((a, b) => b.sales - a.sales);

  // If no paid orders exist, return array with 0s
  return hasData ? result : result.map((r) => ({ ...r, sales: 0, percent: 0 }));
};

// Best-selling menu items (inferred from paid order items)
export const getBestSellers = async () => {
  const soldItems = await prisma.orderItem.groupBy({
    by: ['itemName'],
    _sum: { quantity: true },
    _count: { _all: true },
    where: {
      order: {
        paymentStatus: PaymentStatus.paid,
      },
    },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  return soldItems
    .map((item) => ({
      name: item.itemName,
      count: item._sum.quantity || 0,
      orderCount: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);
};
