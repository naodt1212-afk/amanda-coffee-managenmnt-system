import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export const listExpenses = async () => {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });
  return expenses.map((e) => ({
    ...e,
    amount: Number(e.amount),
    date: e.date,
  }));
};

export const createExpense = async (data: {
  category: string;
  amount: number;
  description: string;
  date: string;
}) => {
  const expense = await prisma.expense.create({
    data: {
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
    },
  });
  return {
    ...expense,
    amount: Number(expense.amount),
  };
};

export const getExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) {
    throw new ApiError(404, 'Expense not found.', 'EXPENSE_NOT_FOUND');
  }
  return { ...expense, amount: Number(expense.amount) };
};

export const deleteExpense = async (id: string) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Expense not found.', 'EXPENSE_NOT_FOUND');
  }
  await prisma.expense.delete({ where: { id } });
  return { id };
};
