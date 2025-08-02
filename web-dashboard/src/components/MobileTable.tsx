// src/components/MobileTable.tsx
import React from 'react';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import Button from './Button';
import StatusBadge from './StatusBadge';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
  mobile?: boolean; // Show on mobile
  desktop?: boolean; // Show on desktop
}

interface MobileTableProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<any>;
}

const MobileTable: React.FC<MobileTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
}) => {
  const mobileColumns = columns.filter(col => col.mobile !== false);
  const desktopColumns = columns.filter(col => col.desktop !== false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center justify-center">
          {EmptyIcon && <EmptyIcon className="h-12 w-12 text-gray-300 mb-4" />}
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {data.map((item, index) => (
          <div key={item.id || index} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="space-y-3">
              {mobileColumns.map((column) => {
                const value = item[column.key];
                if (!value && value !== 0) return null;

                return (
                  <div key={column.key} className="flex justify-between items-start">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 mb-1">
                        {column.label}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {column.render ? column.render(value, item) : value}
                      </dd>
                    </div>
                  </div>
                );
              })}
              
              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      icon={FaEdit}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(item)}
                      icon={FaTrash}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {desktopColumns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {desktopColumns.map((column) => {
                  const value = item[column.key];
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(value, item) : value || '-'}
                    </td>
                  );
                })}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                          icon={FaEdit}
                        >
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete(item)}
                          icon={FaTrash}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MobileTable;
