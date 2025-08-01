// src/components/Header.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 shadow-sm">
      <div className="flex items-center">
        <div className="md:hidden flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-base">FP</span>
          </div>
          <span className="text-xl font-bold text-gray-800">FieldPro</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-500 capitalize tracking-wide">
              {user?.role}
            </div>
          </div>
          <div className="relative">
            <FaUserCircle className="h-8 w-8 text-gray-400 hover:text-gray-600 transition-colors" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
        </div>
        
        <div className="relative group">
          <button
            onClick={onLogout}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-100"
          >
            <FaSignOutAlt className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
