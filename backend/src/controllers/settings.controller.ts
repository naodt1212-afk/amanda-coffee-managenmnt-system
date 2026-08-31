import { Request, Response, NextFunction } from 'express';
import { getSettings, updateSettings } from '../services/settings.service';
import { successResponse } from '../utils/apiResponse';

export const getSettingsHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getSettings();
    return successResponse(res, 200, 'Settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettingsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      shopName,
      address,
      tablesCount,
      taxPercent,
      servicePercent,
      autoPrintReceipt,
    } = req.body;
    const settings = await updateSettings({
      shopName,
      address,
      tablesCount,
      taxPercent,
      servicePercent,
      autoPrintReceipt,
    });
    return successResponse(res, 200, 'Café settings updated successfully', settings);
  } catch (error) {
    next(error);
  }
};
