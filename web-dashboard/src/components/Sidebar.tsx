// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaToolbox, 
  FaClipboardList, 
  FaFileInvoice, 
  FaCreditCard, 
  FaBox, 
  FaCogs 
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Customers', href: '/customers', icon: FaUsers },
    { name: 'Jobs', href: '/jobs', icon: FaClipboardList },
    { name: 'Invoices', href: '/invoices', icon: FaFileInvoice },
    { name: 'Payments', href: '/payments', icon: FaCreditCard },
    { name: 'Inventory', href: '/inventory', icon: FaBox },
    { name: 'Equipment', href: '/equipment', icon: FaToolbox },
    { name: 'Component Demo', href: '/demo', icon: FaCogs },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
      <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-blue-700 to-blue-900 min-h-0">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-white to-gray-100 flex items-center justify-center shadow-lg">
              <span className="text-blue-700 font-bold text-lg">FP</span>
            </div>
            <span className="text-xl font-bold text-white">FieldPro</span>
          </div>
        </div>
        <div className="mt-8 flex flex-grow flex-col">
          <nav className="flex-1 space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-xl mx-2 transition-all duration-200`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto px-4 py-4">
            <div className="bg-blue-800 bg-opacity-50 rounded-xl p-4 border border-blue-600">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCogs className="h-5 w-5 text-blue-200" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-blue-200">Settings</p>
                  <p className="text-xs text-blue-300">Manage your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
