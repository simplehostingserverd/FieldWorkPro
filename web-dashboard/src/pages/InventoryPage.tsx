// src/pages/InventoryPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import apiService from '../services/apiService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      setError(null);

      if (editingItem) {
        await apiService.updateInventoryItem(editingItem.id, formData);
        setSuccess('Inventory item updated successfully');
      } else {
        await apiService.createInventoryItem(formData);
        setSuccess('Inventory item created successfully');
      }

      setIsFormModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      setError('Failed to save inventory item. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setFormLoading(true);
      setError(null);

      await apiService.deleteInventoryItem(deletingItem.id);
      setSuccess('Inventory item deleted successfully');
      setIsDeleteModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setError('Failed to delete inventory item. Please try again.');
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

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inventory form fields
  const inventoryFields = [
    { name: 'name', label: 'Item Name', type: 'text' as const, required: true },
    { name: 'sku', label: 'SKU', type: 'text' as const, required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const },
    { name: 'category', label: 'Category', type: 'text' as const },
    {
      name: 'unit_cost',
      label: 'Unit Cost',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'unit_price',
      label: 'Unit Price',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'quantity_in_stock',
      label: 'Quantity in Stock',
      type: 'number' as const,
      required: true,
    },
    { name: 'reorder_level', label: 'Reorder Level', type: 'number' as const },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-2 text-sm text-gray-600">Manage inventory items</p>
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
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card
        title="Inventory Items"
        actions={
          <Button onClick={handleAddItem} icon={FaPlus}>
            Add Item
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cost
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    In Stock
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
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.unit_cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity_in_stock}
                      {item.quantity_in_stock <= item.reorder_level &&
                        item.reorder_level > 0 && (
                          <span className="ml-2 text-xs text-red-600">
                            {' '}
                            LOW STOCK
                          </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          icon={FaEdit}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          icon={FaTrash}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <FaBox className="h-8 w-8 text-gray-300 mb-2" />
                        <p>No inventory items found</p>
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
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        fields={inventoryFields}
        initialData={editingItem || {}}
        loading={formLoading}
        submitText={editingItem ? 'Update Item' : 'Create Item'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete Item"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
};

export default InventoryPage;
