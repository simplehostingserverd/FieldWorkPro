// Invoice controller
import { Request, Response } from 'express';
import { 
  getInvoicesByOrganization, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice 
} from '../services/invoice.service';
import { CreateInvoice } from '../types/invoice.types';

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const invoices = await getInvoicesByOrganization(organizationId);
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoices', error: error.message });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const invoice = await getInvoiceById(invoiceId, organizationId);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoice', error: error.message });
  }
};

export const createNewInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceData: CreateInvoice = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const invoice = await createInvoice({
      ...invoiceData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

export const updateExistingInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const invoiceData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const invoice = await updateInvoice(invoiceId, invoiceData, organizationId);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error: error.message });
  }
};

export const deleteExistingInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deleteInvoice(invoiceId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};

export default {
  getAllInvoices,
  getInvoice,
  createNewInvoice,
  updateExistingInvoice,
  deleteExistingInvoice
};
