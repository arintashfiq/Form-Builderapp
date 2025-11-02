import React from 'react';
import { FormField, TableColumn } from '../../types';

interface TableFieldProps {
  field: FormField;
  value?: Record<string, string>[];
  onChange?: (value: Record<string, string>[]) => void;
  error?: string;
  preview?: boolean;
}

export default function TableField({ field, value = [], onChange, error, preview = false }: TableFieldProps) {
  const addRow = () => {
    const newRow: Record<string, string> = {};
    field.tableColumns?.forEach(col => {
      newRow[col.id] = '';
    });
    onChange?.([...value, newRow]);
  };

  const updateCell = (rowIndex: number, columnId: string, cellValue: string) => {
    const newValue = [...value];
    newValue[rowIndex] = { ...newValue[rowIndex], [columnId]: cellValue };
    onChange?.(newValue);
  };

  const removeRow = (rowIndex: number) => {
    const newValue = value.filter((_, index) => index !== rowIndex);
    onChange?.(newValue);
  };

  const validateInput = (inputValue: Record<string, string>[]): string | undefined => {
    if (field.required && inputValue.length === 0) {
      return 'At least one row is required';
    }
    return undefined;
  };

  const validationError = preview ? validateInput(value) : undefined;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.question}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {field.tableColumns?.map((column) => (
                <th key={column.id} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {column.name}
                </th>
              ))}
              {preview && <th className="px-4 py-2 w-16"></th>}
            </tr>
          </thead>
          <tbody>
            {value.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {field.tableColumns?.map((column) => (
                  <td key={column.id} className="px-4 py-2">
                    {column.type === 'text' ? (
                      <input
                        type="text"
                        value={row[column.id] || ''}
                        onChange={(e) => updateCell(rowIndex, column.id, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={!preview}
                      />
                    ) : (
                      <select
                        value={row[column.id] || ''}
                        onChange={(e) => updateCell(rowIndex, column.id, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={!preview}
                      >
                        <option value="">Select</option>
                        {column.options?.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                ))}
                {preview && (
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {preview && (
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Row
        </button>
      )}
      
      {(error || validationError) && (
        <p className="text-sm text-red-600">{error || validationError}</p>
      )}
    </div>
  );
}