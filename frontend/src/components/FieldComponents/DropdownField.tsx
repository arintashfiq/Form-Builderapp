import React from 'react';
import { FormField } from '../../types';

interface DropdownFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  preview?: boolean;
}

export default function DropdownField({ field, value = '', onChange, error, preview = false }: DropdownFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  const validateInput = (inputValue: string): string | undefined => {
    if (field.required && !inputValue) {
      return 'This field is required';
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
      
      <select
        value={value}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error || validationError ? 'border-red-500' : 'border-gray-300'
        }`}
        disabled={!preview}
      >
        <option value="">Select an option</option>
        {field.options?.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      
      {(error || validationError) && (
        <p className="text-sm text-red-600">{error || validationError}</p>
      )}
    </div>
  );
}