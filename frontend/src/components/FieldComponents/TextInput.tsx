import React from 'react';
import { FormField } from '../../types';

interface TextInputProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  preview?: boolean;
}

export default function TextInput({ field, value = '', onChange, error, preview = false }: TextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const validateInput = (inputValue: string): string | undefined => {
    if (field.required && !inputValue.trim()) {
      return 'This field is required';
    }
    
    if (field.validation?.minLength && inputValue.length < field.validation.minLength) {
      return `Minimum length is ${field.validation.minLength} characters`;
    }
    
    if (field.validation?.maxLength && inputValue.length > field.validation.maxLength) {
      return `Maximum length is ${field.validation.maxLength} characters`;
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
      
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error || validationError ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={`Enter ${field.question.toLowerCase()}`}
        disabled={!preview}
      />
      
      {field.validation && (
        <div className="text-xs text-gray-500">
          {field.validation.minLength && `Min: ${field.validation.minLength} chars`}
          {field.validation.minLength && field.validation.maxLength && ' | '}
          {field.validation.maxLength && `Max: ${field.validation.maxLength} chars`}
        </div>
      )}
      
      {(error || validationError) && (
        <p className="text-sm text-red-600">{error || validationError}</p>
      )}
    </div>
  );
}