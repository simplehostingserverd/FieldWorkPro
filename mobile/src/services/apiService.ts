import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_BASE_URL || 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store token
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return { token, user };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    // Store token
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return { token, user };
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    }
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh');
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    
    return { token, user };
  }

  // Equipment endpoints
  async getEquipment() {
    const response = await this.api.get('/equipment');
    return response.data;
  }

  async getEquipmentItem(id: string) {
    const response = await this.api.get(`/equipment/${id}`);
    return response.data;
  }

  async createEquipmentItem(data: any) {
    const response = await this.api.post('/equipment', data);
    return response.data;
  }

  async updateEquipmentItem(id: string, data: any) {
    const response = await this.api.put(`/equipment/${id}`, data);
    return response.data;
  }

  async deleteEquipmentItem(id: string) {
    await this.api.delete(`/equipment/${id}`);
  }

  // Customer endpoints
  async getCustomers() {
    const response = await this.api.get('/customers');
    return response.data;
  }

  async getCustomer(id: string) {
    const response = await this.api.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: any) {
    const response = await this.api.post('/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: any) {
    const response = await this.api.put(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string) {
    await this.api.delete(`/customers/${id}`);
  }

  // Job endpoints
  async getJobs() {
    const response = await this.api.get('/jobs');
    return response.data;
  }

  async getJob(id: string) {
    const response = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(data: any) {
    const response = await this.api.post('/jobs', data);
    return response.data;
  }

  async updateJob(id: string, data: any) {
    const response = await this.api.put(`/jobs/${id}`, data);
    return response.data;
  }

  async deleteJob(id: string) {
    await this.api.delete(`/jobs/${id}`);
  }

  // Invoice endpoints
  async getInvoices() {
    const response = await this.api.get('/invoices');
    return response.data;
  }

  async getInvoice(id: string) {
    const response = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: any) {
    const response = await this.api.post('/invoices', data);
    return response.data;
  }

  async updateInvoice(id: string, data: any) {
    const response = await this.api.put(`/invoices/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id: string) {
    await this.api.delete(`/invoices/${id}`);
  }

  // Payment endpoints
  async getPayments() {
    const response = await this.api.get('/payments');
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.api.post('/payments', data);
    return response.data;
  }

  // Dashboard/Stats endpoints
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  // Utility methods
  async checkConnection() {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  setBaseURL(url: string) {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }
}

export const apiService = new ApiService();
export default apiService;
