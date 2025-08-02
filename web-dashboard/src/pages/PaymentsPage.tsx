// src/pages/PaymentsPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCreditCard } from 'react-icons/fa';
import apiService from '../services/apiService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setIsFormModalOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setIsFormModalOpen(true);
  };

  const handleDeletePayment = (payment: any) => {
    setDeletingPayment(payment);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, formData);
        setSuccess('Payment updated successfully');
      } else {
        await apiService.createPayment(formData);
        setSuccess('Payment created successfully');
      }

      setIsFormModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      setError('Failed to save payment. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;

    try {
      setFormLoading(true);
      setError(null);

      await apiService.deletePayment(deletingPayment.id);
      setSuccess('Payment deleted successfully');
      setIsDeleteModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Failed to delete payment. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment =>
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Payment form fields
  const paymentFields = [
    { name: 'customerId', label: 'Customer', type: 'text' as const, required: true },
    { name: 'invoiceId', label: 'Invoice', type: 'text' as const, required: true },
    { name: 'amount', label: 'Amount', type: 'number' as const, required: true },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'cash', label: 'Cash' },
        { value: 'check', label: 'Check' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'ach', label: 'ACH' },
        { value: 'other', label: 'Other' }
      ]
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' as const, required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
      ]
    },
    { name: 'transactionId', label: 'Transaction ID', type: 'text' as const },
    { name: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage customer payments
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Search */}
      <Card>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Payments Table */}
      <Card
        title="Payment List"
        actions={
          <Button onClick={handleAddPayment} icon={FaPlus}>
            Add Payment
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPayment(payment)}
                          icon={FaEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeletePayment(payment)}
                          icon={FaTrash}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-4">
                        <FaCreditCard className="h-8 w-8 text-gray-300 mb-2" />
                        <p>No payments found</p>
                        {searchTerm && (
                          <p className="text-xs text-gray-400 mt-1">
                            Try adjusting your search criteria
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={editingPayment ? 'Edit Payment' : 'Add Payment'}
        fields={paymentFields}
        initialData={editingPayment || {}}
        loading={formLoading}
        submitText={editingPayment ? 'Update Payment' : 'Create Payment'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment of ${deletingPayment ? formatCurrency(deletingPayment.amount) : ''}? This action cannot be undone.`}
        confirmText="Delete Payment"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
};

export default PaymentsPage;
