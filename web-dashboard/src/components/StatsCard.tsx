// src/components/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  change: string;
  changeType: 'positive' | 'negative';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-lg p-3 ${
            changeType === 'positive' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Icon className={`h-6 w-6 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        <div className={`mt-3 flex items-center text-sm ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="truncate">{change} from last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
