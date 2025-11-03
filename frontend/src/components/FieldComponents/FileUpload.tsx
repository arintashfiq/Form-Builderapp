import React, { useRef } from 'react';
import { Upload, X, File } from 'lucide-react';
import { FormField } from '../../types';
import { formApi } from '../../services/api';

interface FileUploadProps {
  field: FormField;
  value?: { filename: string; originalName: string; path: string }[];
  onChange?: (value: { filename: string; originalName: string; path: string }[]) => void;
  error?: string;
  preview?: boolean;
}

export default function FileUpload({ field, value = [], onChange, error, preview = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    try {
      const uploadPromises = files.map(file => formApi.uploadFile(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      const newFiles = uploadedFiles.map(uploaded => ({
        filename: uploaded.filename,
        originalName: uploaded.filename,
        path: uploaded.path
      }));
      
      onChange?.([...value, ...newFiles]);
    } catch (err) {
      console.error('File upload failed:', err);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange?.(newValue);
  };

  const validateInput = (inputValue: { filename: string; originalName: string; path: string }[]): string | undefined => {
    if (field.required && inputValue.length === 0) {
      return 'At least one file is required';
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
      
      {preview && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            <span className="hidden sm:inline">Click to upload files or drag and drop</span>
            <span className="sm:hidden">Tap to upload files</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="hidden sm:inline">Supported: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 10MB)</span>
            <span className="sm:hidden">PDF, DOC, JPG, PNG, TXT (Max 10MB)</span>
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
        disabled={!preview}
      />
      
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
          {value.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{file.originalName}</span>
              </div>
              {preview && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {(error || validationError) && (
        <p className="text-sm text-red-600">{error || validationError}</p>
      )}
    </div>
  );
}