// Shared types between frontend and backend

export interface FormField {
  id: string;
  type: 'text' | 'dropdown' | 'table' | 'file';
  question: string;
  required: boolean;
  columnId?: string;
  sectionId?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
  options?: string[];
  tableColumns?: TableColumn[];
  conditionalLogic?: ConditionalLogic;
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'dropdown';
  options?: string[];
}

export interface ConditionalLogic {
  conditions: ConditionalRule[];
}

export interface ConditionalRule {
  answer: string;
  targetSectionId: string; // or "end" for form completion
}

export interface FormColumn {
  id: string;
  name: string;
  width: number; // percentage
  fieldIds: string[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  columns?: FormColumn[]; // Columns are now part of sections
}

export interface Form {
  id: string;
  name: string;
  fields: FormField[];
  columns: FormColumn[];
  sections: FormSection[];
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