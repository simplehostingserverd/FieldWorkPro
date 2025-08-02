// src/pages/EquipmentPage.tsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaToolbox } from 'react-icons/fa';
import apiService from '../services/apiService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import ImprovedFormModal from '../components/ImprovedFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';
import MobileTable from '../components/MobileTable';
import MobileSearch from '../components/MobileSearch';
import { equipmentFormFields } from '../config/formConfigs';

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
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
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment. Please try again.');
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
        await apiService.updateEquipmentItem(editingItem.id, formData);
        setSuccess('Equipment item updated successfully');
      } else {
        await apiService.createEquipmentItem(formData);
        setSuccess('Equipment item created successfully');
      }

      setIsFormModalOpen(false);
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment item:', error);
      setError('Failed to save equipment item. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setFormLoading(true);
      setError(null);

      await apiService.deleteEquipmentItem(deletingItem.id);
      setSuccess('Equipment item deleted successfully');
      setIsDeleteModalOpen(false);
      fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment item:', error);
      setError('Failed to delete equipment item. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
        <p className="mt-2 text-sm text-gray-600">Manage equipment and tools</p>
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
        <MobileSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search equipment..."
          showFilters={true}
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'available', label: 'Available' },
                { value: 'in_use', label: 'In Use' },
                { value: 'maintenance', label: 'Under Maintenance' },
                { value: 'out_of_service', label: 'Out of Service' },
              ],
            },
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: [
                { value: 'drill', label: 'Drill' },
                { value: 'excavator', label: 'Excavator' },
                { value: 'bulldozer', label: 'Bulldozer' },
                { value: 'crane', label: 'Crane' },
                { value: 'compressor', label: 'Compressor' },
                { value: 'generator', label: 'Generator' },
                { value: 'pump', label: 'Pump' },
                { value: 'truck', label: 'Truck' },
                { value: 'trailer', label: 'Trailer' },
                { value: 'other', label: 'Other' },
              ],
            },
          ]}
        />
      </Card>

      {/* Equipment Table */}
      <Card
        title="Equipment List"
        actions={
          <Button onClick={handleAddItem} icon={FaPlus}>
            Add Equipment
          </Button>
        }
      >
        <MobileTable
          data={filteredEquipment}
          loading={loading}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          emptyMessage={
            searchTerm
              ? 'No equipment found matching your search'
              : 'No equipment found'
          }
          emptyIcon={FaToolbox}
          columns={[
            {
              key: 'name',
              label: 'Equipment',
              mobile: true,
              desktop: true,
              render: (value, item) => (
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {value}
                  </div>
                  {item.description && (
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'serial_number',
              label: 'Serial Number',
              mobile: true,
              desktop: true,
            },
            {
              key: 'category',
              label: 'Category',
              mobile: true,
              desktop: true,
            },
            {
              key: 'assigned_to',
              label: 'Assigned To',
              mobile: true,
              desktop: true,
            },
            {
              key: 'status',
              label: 'Status',
              mobile: true,
              desktop: true,
              render: (value) => (
                <StatusBadge status={value?.replace('_', '-')} />
              ),
            },
            {
              key: 'purchase_date',
              label: 'Purchase Date',
              mobile: false,
              desktop: true,
              render: (value) =>
                value ? new Date(value).toLocaleDateString() : '-',
            },
          ]}
        />
      </Card>

      {/* Form Modal */}
      <ImprovedFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={editingItem ? 'Edit Equipment' : 'Add Equipment'}
        fields={equipmentFormFields}
        initialData={editingItem || {}}
        loading={formLoading}
        submitText={editingItem ? 'Update Equipment' : 'Create Equipment'}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete Equipment"
        type="danger"
        loading={formLoading}
      />
    </div>
  );
};

export default EquipmentPage;
