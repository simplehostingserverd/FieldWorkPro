// src/pages/CustomersPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import apiService from '../services/apiService';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    setDeletingCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingCustomer) {
        await apiService.updateCustomer(editingCustomer.id, formData);
        setSuccess('Customer updated successfully');
      } else {
        await apiService.createCustomer(formData);
        setSuccess('Customer created successfully');
      }

      setIsFormModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      setError('Failed to save customer. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setFormLoading(true);
      setError(null);

      await apiService.deleteCustomer(deletingCustomer.id);
      setSuccess('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.first_name} ${customer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  // Customer form fields
  const customerFields = [
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text' as const,
      required: true,
    },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'tel' as const, required: true },
    {
      name: 'address',
      label: 'Address',
      type: 'text' as const,
      required: true,
    },
    { name: 'city', label: 'City', type: 'text' as const, required: true },
    { name: 'state', label: 'State', type: 'text' as const, required: true },
    {
      name: 'zip_code',
      label: 'ZIP Code',
      type: 'text' as const,
      required: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your customer database
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
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
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Customers Table */}
      <Card
        title="Customer List"
        actions={
          <Button onClick={handleAddCustomer} icon={FaPlus}>
            Add Customer
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Added
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.city}, {customer.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                          icon={FaEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer)}
                          icon={FaTrash}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <FaUsers className="h-8 w-8 text-gray-300 mb-2" />
                        <p>No customers found</p>
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
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        fields={customerFields}
        initialData={editingCustomer || {}}
        loading={formLoading}
        submitText={editingCustomer ? 'Update Customer' : 'Create Customer'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deletingCustomer?.first_name} ${deletingCustomer?.last_name}? This action cannot be undone.`}
        confirmText="Delete Customer"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
};

export default CustomersPage;
