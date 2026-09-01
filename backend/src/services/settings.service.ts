import { prisma } from '../config/prisma';

export const getSettings = async () => {
  let settings = await prisma.cafeSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.cafeSettings.create({
      data: { id: 1 },
    });
  }
  return settings;
};

export const updateSettings = async (data: {
  shopName?: string;
  address?: string;
  tablesCount?: number;
  taxPercent?: number;
  servicePercent?: number;
  autoPrintReceipt?: boolean;
}) => {
  await getSettings(); // ensure exists
  const settings = await prisma.cafeSettings.update({
    where: { id: 1 },
    data: {
      shopName: data.shopName,
      address: data.address,
      tablesCount: data.tablesCount,
      taxPercent: data.taxPercent,
      servicePercent: data.servicePercent,
      autoPrintReceipt: data.autoPrintReceipt,
    },
  });
  return settings;
};
