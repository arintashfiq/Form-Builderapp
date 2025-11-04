import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { FormColumn } from '../types';

interface ColumnEditorProps {
  column: FormColumn;
  onUpdate: (updates: Partial<FormColumn>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export default function ColumnEditor({ column, onUpdate, onClose, onDelete }: ColumnEditorProps) {
  const [name, setName] = useState(column.name);

  const handleSave = () => {
    onUpdate({ name });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this column? Fields in this column will be moved to the main area.')) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Column</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Column Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fields in this column
          </label>
          <div className="text-sm text-gray-600">
            {column.fieldIds.length === 0 ? (
              <p>No fields assigned to this column</p>
            ) : (
              <p>{column.fieldIds.length} field(s) assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}