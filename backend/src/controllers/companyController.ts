import { Request, Response } from 'express';
import Company from '../models/Company.js';

export const getCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company({
        name: 'Grovyn Engineering & Development Systems',
        address: '123 Engineering Way',
        city: 'Tech District',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        contactEmail: 'finance@grovyn.io',
        contactPhone: '+91-1234567890',
        website: 'www.grovyn.io',
      });
      await company.save();
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company(req.body);
    } else {
      Object.assign(company, req.body);
    }
    await company.save();
    res.json(company);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
