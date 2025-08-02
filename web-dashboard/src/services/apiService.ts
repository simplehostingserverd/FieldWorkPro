// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import authService from './authService';
import config from '../config/environment';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: 10000,
    });

    // Add a request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor to handle auth errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Customer API methods
  async getCustomers() {
    return this.request<any[]>({
      method: 'GET',
      url: '/customers',
    });
  }

  async getCustomer(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/customers/${id}`,
    });
  }

  async createCustomer(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/customers',
      data,
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/customers/${id}`,
      data,
    });
  }

  async deleteCustomer(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/customers/${id}`,
    });
  }

  // Job API methods
  async getJobs() {
    return this.request<any[]>({
      method: 'GET',
      url: '/jobs',
    });
  }

  async getJob(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/jobs/${id}`,
    });
  }

  async createJob(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/jobs',
      data,
    });
  }

  async updateJob(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/jobs/${id}`,
      data,
    });
  }

  async deleteJob(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/jobs/${id}`,
    });
  }

  // Invoice API methods
  async getInvoices() {
    return this.request<any[]>({
      method: 'GET',
      url: '/invoices',
    });
  }

  async getInvoice(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/invoices/${id}`,
    });
  }

  async createInvoice(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/invoices',
      data,
    });
  }

  async updateInvoice(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/invoices/${id}`,
      data,
    });
  }

  async deleteInvoice(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/invoices/${id}`,
    });
  }

  // Payment API methods
  async getPayments() {
    return this.request<any[]>({
      method: 'GET',
      url: '/payments',
    });
  }

  async getPayment(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/payments/${id}`,
    });
  }

  async createPayment(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/payments',
      data,
    });
  }

  async updatePayment(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/payments/${id}`,
      data,
    });
  }

  async deletePayment(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/payments/${id}`,
    });
  }

  // Inventory API methods
  async getInventory() {
    return this.request<any[]>({
      method: 'GET',
      url: '/inventory',
    });
  }

  async getInventoryItem(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/inventory/${id}`,
    });
  }

  async createInventoryItem(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/inventory',
      data,
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/inventory/${id}`,
      data,
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/inventory/${id}`,
    });
  }

  // Equipment API methods
  async getEquipment() {
    return this.request<any[]>({
      method: 'GET',
      url: '/equipment',
    });
  }

  async getEquipmentItem(id: string) {
    return this.request<any>({
      method: 'GET',
      url: `/equipment/${id}`,
    });
  }

  async createEquipmentItem(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/equipment',
      data,
    });
  }

  async updateEquipmentItem(id: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/equipment/${id}`,
      data,
    });
  }

  async deleteEquipmentItem(id: string) {
    return this.request<void>({
      method: 'DELETE',
      url: `/equipment/${id}`,
    });
  }
}

export default new ApiService();
