import { Response } from 'express';
import { AuthRequest } from '../utils/auth.js';
import { generateInvoiceDraft } from '../services/aiInvoiceService.js';
import AuditLog from '../models/AuditLog.js';

export const generateAIDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, clientId } = req.body;
    const userId = req.user?._id;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!clientId) {
      res.status(400).json({ error: 'Client ID is required' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { draft, rawResponse } = await generateInvoiceDraft({
      prompt: prompt.trim(),
      clientId,
      userId: userId.toString(),
    });

    try {
      await AuditLog.create({
        entityType: 'Invoice',
        entityId: userId, 
        action: 'ai_draft' as any, 
        userId,
        changes: {
          prompt: prompt.substring(0, 200), 
          confidence: draft.confidence,
          invoiceType: draft.invoiceType,
          itemsCount: draft.items.length,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    res.json({
      success: true,
      draft: {
        ...draft,
        invoiceType: draft.invoiceType,
        invoiceDate: draft.serviceDate,
        dueDate: draft.dueDate,
        serviceOptedDate: draft.serviceDate,
        projectName: draft.projectName,
        items: draft.items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          discountType: 'percentage' as const,
          taxRate: item.taxRate,
          hsnSac: item.hsnSac || '',
          amount: item.quantity * item.unitPrice,
        })),
        taxDetails: {
          taxProtocol: draft.taxDetails?.taxProtocol || 'GST',
          placeOfSupply: draft.taxDetails?.placeOfSupply,
          isExportOfServices: draft.taxDetails?.taxProtocol === 'EXPORT',
        },
        discountPercentage: draft.discountPercentage,
        notes: draft.notes,
        timeline: draft.timeline,
        deliverables: draft.deliverables,
        paymentTerms: draft.paymentTerms,
        confidence: draft.confidence,
      },
    });
  } catch (error: any) {
    console.error('Error generating AI draft:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    
    if (error.message.includes('API key')) {
      res.status(500).json({ 
        error: 'AI service configuration error. Please contact administrator.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
      return;
    }
    
    if (error.message.includes('validation') || error.message.includes('parse')) {
      res.status(400).json({ 
        error: 'AI response was invalid. Please try rephrasing your prompt.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to generate invoice draft',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
