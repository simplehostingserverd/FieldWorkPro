// User model interface
export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// User creation interface (for new users)
export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'technician';
  password: string;
}

// User authentication interface
export interface UserAuth {
  email: string;
  password: string;
}

export default User;
