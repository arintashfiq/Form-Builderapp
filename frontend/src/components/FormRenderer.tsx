import React from 'react';
import { FormField } from '../types';
import TextInput from './FieldComponents/TextInput';
import DropdownField from './FieldComponents/DropdownField';
import TableField from './FieldComponents/TableField';
import FileUpload from './FieldComponents/FileUpload';

interface FormRendererProps {
  field: FormField;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  preview?: boolean;
}

export default function FormRenderer({ field, value, onChange, error, preview = false }: FormRendererProps) {
  switch (field.type) {
    case 'text':
      return (
        <TextInput
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          preview={preview}
        />
      );
    
    case 'dropdown':
      return (
        <DropdownField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          preview={preview}
        />
      );
    
    case 'table':
      return (
        <TableField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          preview={preview}
        />
      );
    
    case 'file':
      return (
        <FileUpload
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          preview={preview}
        />
      );
    
    default:
      return <div>Unknown field type: {field.type}</div>;
  }
}