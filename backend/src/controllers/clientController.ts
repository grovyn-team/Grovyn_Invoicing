import { Request, Response } from 'express';
import Client from '../models/Client.js';

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find({ isActive: true }).sort({ name: 1 });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    await Client.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
