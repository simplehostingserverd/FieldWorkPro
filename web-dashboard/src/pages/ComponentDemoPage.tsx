// src/pages/ComponentDemoPage.tsx
import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { Form, FormField, Input, Textarea, Select } from '../components/Form';
import { FaUser, FaChartBar, FaCog, FaBell } from 'react-icons/fa';

const ComponentDemoPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Component Demo</h1>
        <p className="mt-2 text-sm text-gray-600">
          Showcase of reusable UI components
        </p>
      </div>

      {/* Buttons */}
      <Card title="Buttons">
        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Card>

      {/* Alerts */}
      <Card title="Alerts">
        {showAlert && (
          <Alert 
            variant="info" 
            title="Information"
            dismissible 
            onDismiss={() => setShowAlert(false)}
          >
            This is an informational alert with a title and dismiss button.
          </Alert>
        )}
        <Alert variant="success" className="mt-4">
          This is a success alert without a title.
        </Alert>
        <Alert variant="warning" title="Warning" className="mt-4">
          This is a warning alert with a title.
        </Alert>
        <Alert variant="error" title="Error" className="mt-4">
          This is an error alert with a title.
        </Alert>
      </Card>

      {/* Status Badges */}
      <Card title="Status Badges">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="completed" />
          <StatusBadge status="in-progress" />
          <StatusBadge status="scheduled" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="paid" />
          <StatusBadge status="pending" />
          <StatusBadge status="overdue" />
          <StatusBadge status="draft" />
        </div>
      </Card>

      {/* Stats Cards */}
      <Card title="Stats Cards">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Users" 
            value="12,361" 
            icon={FaUser} 
            change="+12%" 
            changeType="positive" 
          />
          <StatsCard 
            title="Revenue" 
            value="$24,200" 
            icon={FaChartBar} 
            change="+8.2%" 
            changeType="positive" 
          />
          <StatsCard 
            title="Pending Tasks" 
            value="42" 
            icon={FaCog} 
            change="-3.1%" 
            changeType="negative" 
          />
          <StatsCard 
            title="Notifications" 
            value="8" 
            icon={FaBell} 
            change="0%" 
            changeType="positive" 
          />
        </div>
      </Card>

      {/* Loading Spinners */}
      <Card title="Loading Spinners">
        <div className="flex flex-wrap items-center gap-6">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <LoadingSpinner size="md" color="border-red-600" />
          <LoadingSpinner size="md" color="border-green-600" />
        </div>
      </Card>

      {/* Modal Demo */}
      <Card 
        title="Modal" 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
        }
      >
        <p>Click the button above to open a modal dialog.</p>
      </Card>

      {/* Form Demo */}
      <Card title="Form Components">
        <Form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <FormField label="Name" required>
            <Input placeholder="Enter your name" value="" onChange={() => {}} />
          </FormField>
          
          <FormField label="Email" required error="Please enter a valid email">
            <Input type="email" placeholder="Enter your email" value="" onChange={() => {}} />
          </FormField>
          
          <FormField label="Status">
            <Select value="" onChange={() => {}}>
              <option>Select a status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </FormField>
          
          <FormField label="Description">
            <Textarea placeholder="Enter a description" value="" onChange={() => {}} />
          </FormField>
          
          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </Form>
      </Card>

      {/* Modal Component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Sample Modal"
      >
        <div className="space-y-4">
          <p>This is a sample modal dialog to demonstrate the Modal component.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComponentDemoPage;
