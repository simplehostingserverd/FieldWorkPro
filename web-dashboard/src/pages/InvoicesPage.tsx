// src/pages/InvoicesPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFileInvoice } from 'react-icons/fa';
import apiService from '../services/apiService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleDeleteInvoice = (invoice: any) => {
    setDeletingInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingInvoice) {
        await apiService.updateInvoice(editingInvoice.id, formData);
        setSuccess('Invoice updated successfully');
      } else {
        await apiService.createInvoice(formData);
        setSuccess('Invoice created successfully');
      }

      setIsFormModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Failed to save invoice. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;

    try {
      setFormLoading(true);
      setError(null);

      await apiService.deleteInvoice(deletingInvoice.id);
      setSuccess('Invoice deleted successfully');
      setIsDeleteModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice. Please try again.');
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

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Invoice form fields
  const invoiceFields = [
    { name: 'invoiceNumber', label: 'Invoice Number', type: 'text' as const, required: true },
    { name: 'customerId', label: 'Customer', type: 'text' as const, required: true },
    { name: 'issueDate', label: 'Issue Date', type: 'date' as const, required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
    { name: 'subtotal', label: 'Subtotal', type: 'number' as const, required: true },
    { name: 'tax', label: 'Tax', type: 'number' as const, required: true },
    { name: 'total', label: 'Total', type: 'number' as const, required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    { name: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage customer invoices
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
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Invoices Table */}
      <Card
        title="Invoice List"
        actions={
          <Button onClick={handleAddInvoice} icon={FaPlus}>
            Add Invoice
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
                    Invoice
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                          icon={FaEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice)}
                          icon={FaTrash}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center py-4">
                        <FaFileInvoice className="h-8 w-8 text-gray-300 mb-2" />
                        <p>No invoices found</p>
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
        title={editingInvoice ? 'Edit Invoice' : 'Add Invoice'}
        fields={invoiceFields}
        initialData={editingInvoice || {}}
        loading={formLoading}
        submitText={editingInvoice ? 'Update Invoice' : 'Create Invoice'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${deletingInvoice?.invoiceNumber}"? This action cannot be undone.`}
        confirmText="Delete Invoice"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
};

export default InvoicesPage;
