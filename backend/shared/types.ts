// Shared types between frontend and backend

export interface FormField {
  id: string;
  type: 'text' | 'dropdown' | 'table' | 'file';
  question: string;
  required: boolean;
  columnId?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
  options?: string[];
  tableColumns?: TableColumn[];
  conditionalLogic?: ConditionalRule[];
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: string[];
}

export interface ConditionalRule {
  condition: string;
  targetFieldId: string;
  action: 'show' | 'hide' | 'jump';
}

export interface FormColumn {
  id: string;
  name: string;
  width: number; // percentage
  fieldIds: string[];
}

export interface Form {
  id: string;
  name: string;
  fields: FormField[];
  columns: FormColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}