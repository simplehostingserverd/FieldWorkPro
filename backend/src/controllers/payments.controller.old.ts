// Payment controller
import { Request, Response } from 'express';
import { 
  getPaymentsByOrganization, 
  getPaymentById, 
  createPayment, 
  updatePayment, 
  deletePayment 
} from '../services/payment.service';
import { CreatePayment } from '../types/payment.types';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const payments = await getPaymentsByOrganization(organizationId);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payments', error: error.message });
  }
};

export const getPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const payment = await getPaymentById(paymentId, organizationId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payment', error: error.message });
  }
};

export const createNewPayment = async (req: Request, res: Response) => {
  try {
    const paymentData: CreatePayment = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const payment = await createPayment({
      ...paymentData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

export const updateExistingPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const paymentData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const payment = await updatePayment(paymentId, paymentData, organizationId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

export const deleteExistingPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deletePayment(paymentId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

export default {
  getAllPayments,
  getPayment,
  createNewPayment,
  updateExistingPayment,
  deleteExistingPayment
};
