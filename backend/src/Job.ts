// Job model interface
export interface Job {
  id: string;
  organizationId: string;
  customerId: string;
  technicianId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Job creation interface
export interface CreateJob {
  customerId: string;
  technicianId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
}

export default Job;
