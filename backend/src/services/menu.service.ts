import { Category } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

const getCategoryFromApi = (category: string): Category => {
  // Frontend uses "Soft Drinks" with a space; DB enum uses "Soft_Drinks"
  if (category === 'Soft Drinks') return Category.Soft_Drinks;
  if (Object.values(Category).includes(category as Category)) {
    return category as Category;
  }
  throw new ApiError(400, `Invalid category: ${category}`, 'INVALID_CATEGORY');
};

export const getCategoryDisplayName = (category: Category): string => {
  return category === Category.Soft_Drinks ? 'Soft Drinks' : category;
};

export const listMenuItems = async (filters: {
  search?: string;
  category?: string;
  availability?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' as const } },
      { description: { contains: filters.search, mode: 'insensitive' as const } },
    ];
  }

  if (filters.category && filters.category !== 'all') {
    where.category = getCategoryFromApi(filters.category);
  }

  if (filters.availability !== undefined && filters.availability !== 'all') {
    if (filters.availability === 'available') {
      where.availability = true;
    } else if (filters.availability === 'sold_out') {
      where.availability = false;
    }
  }

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Map DB category enums back to frontend display values
  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    category: getCategoryDisplayName(item.category),
  }));
};

export const getMenuItemById = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(404, 'Menu item not found.', 'MENU_ITEM_NOT_FOUND');
  }
  return {
    ...item,
    price: Number(item.price),
    category: getCategoryDisplayName(item.category),
  };
};

export const createMenuItem = async (data: {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  availability: boolean;
  preparationTime?: number;
}) => {
  return prisma.menuItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      category: getCategoryFromApi(data.category),
      image: data.image,
      availability: data.availability,
      preparationTime: data.preparationTime,
    },
  });
};

export const updateMenuItem = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    availability?: boolean;
    preparationTime?: number;
  }
) => {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Menu item not found.', 'MENU_ITEM_NOT_FOUND');
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.category !== undefined) updateData.category = getCategoryFromApi(data.category);
  if (data.image !== undefined) updateData.image = data.image;
  if (data.availability !== undefined) updateData.availability = data.availability;
  if (data.preparationTime !== undefined) updateData.preparationTime = data.preparationTime;

  const item = await prisma.menuItem.update({ where: { id }, data: updateData });
  return {
    ...item,
    price: Number(item.price),
    category: getCategoryDisplayName(item.category),
  };
};

export const deleteMenuItem = async (id: string) => {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Menu item not found.', 'MENU_ITEM_NOT_FOUND');
  }
  await prisma.menuItem.delete({ where: { id } });
  return { id };
};
