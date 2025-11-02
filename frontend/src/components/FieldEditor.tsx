import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormField, TableColumn } from '../types';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

export default function FieldEditor({ field, onUpdate, onClose }: FieldEditorProps) {
  const [question, setQuestion] = useState(field.question);
  const [required, setRequired] = useState(field.required);
  const [minLength, setMinLength] = useState(field.validation?.minLength || '');
  const [maxLength, setMaxLength] = useState(field.validation?.maxLength || '');
  const [options, setOptions] = useState(field.options || []);
  const [tableColumns, setTableColumns] = useState(field.tableColumns || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    const updates: Partial<FormField> = {
      question,
      required,
      validation: field.type === 'text' ? {
        ...(minLength && { minLength: parseInt(minLength.toString()) }),
        ...(maxLength && { maxLength: parseInt(maxLength.toString()) }),
      } : undefined,
      ...(field.type === 'dropdown' && { options }),
      ...(field.type === 'table' && { tableColumns }),
    };
    onUpdate(updates);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    // Reset all fields to original values
    setQuestion(field.question);
    setRequired(field.required);
    setMinLength(field.validation?.minLength || '');
    setMaxLength(field.validation?.maxLength || '');
    setOptions(field.options || []);
    setTableColumns(field.tableColumns || []);
    setHasUnsavedChanges(false);
  };

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
    markAsChanged();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    markAsChanged();
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_: string, i: number) => i !== index));
    markAsChanged();
  };

  const addTableColumn = () => {
    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      name: `Column ${tableColumns.length + 1}`,
      type: 'text',
    };
    setTableColumns([...tableColumns, newColumn]);
    markAsChanged();
  };

  const updateTableColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = [...tableColumns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setTableColumns(newColumns);
    markAsChanged();
  };

  const removeTableColumn = (index: number) => {
    setTableColumns(tableColumns.filter((_: TableColumn, i: number) => i !== index));
    markAsChanged();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Edit Field</h3>
          {hasUnsavedChanges && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              Unsaved
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              markAsChanged();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={required}
            onChange={(e) => {
              setRequired(e.target.checked);
              markAsChanged();
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 text-sm text-gray-700">
            Required field
          </label>
        </div>

        {field.type === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={minLength}
                onChange={(e) => {
                  setMinLength(e.target.value);
                  markAsChanged();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={maxLength}
                onChange={(e) => {
                  setMaxLength(e.target.value);
                  markAsChanged();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        )}

        {field.type === 'dropdown' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <button
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {field.type === 'table' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Table Columns
              </label>
              <button
                onClick={addTableColumn}
                className="text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tableColumns.map((column: TableColumn, index: number) => (
                <div key={column.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateTableColumn(index, { name: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeTableColumn(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={column.type}
                    onChange={(e) => updateTableColumn(index, { type: e.target.value as 'text' | 'dropdown' })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                  {column.type === 'dropdown' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Options (comma separated, e.g., Yes, No, Maybe)"
                        value={column.options?.join(', ') || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Split by comma and trim, but keep empty strings during typing
                          const options = value.split(',').map((opt: string) => opt.trim());
                          updateTableColumn(index, { options });
                        }}
                        onBlur={(e) => {
                          // On blur, clean up empty options
                          const value = e.target.value;
                          const options = value.split(',').map((opt: string) => opt.trim()).filter(Boolean);
                          if (options.length > 0) {
                            updateTableColumn(index, { options });
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate options with commas
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Changes Section */}
      {hasUnsavedChanges && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}