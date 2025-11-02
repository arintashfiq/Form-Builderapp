import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Form, FormField, FormColumn, FormSection } from '../types';

interface FormState {
  currentForm: Form | null;
  forms: Form[];
  loading: boolean;
  error: string | null;
}

type FormAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_FORM'; payload: Form | null }
  | { type: 'SET_FORMS'; payload: Form[] }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { id: string; field: Partial<FormField> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'ADD_COLUMN'; payload: FormColumn }
  | { type: 'UPDATE_COLUMN'; payload: { id: string; column: Partial<FormColumn> } }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'MOVE_FIELD_TO_COLUMN'; payload: { fieldId: string; columnId: string } }
  | { type: 'ADD_SECTION'; payload: FormSection }
  | { type: 'UPDATE_SECTION'; payload: { id: string; section: Partial<FormSection> } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'MOVE_FIELD_TO_SECTION'; payload: { fieldId: string; sectionId: string } }
  | { type: 'REORDER_SECTIONS'; payload: FormSection[] };

const initialState: FormState = {
  currentForm: null,
  forms: [],
  loading: false,
  error: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };

    case 'SET_FORMS':
      return { ...state, forms: action.payload };

    case 'ADD_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: [...state.currentForm.fields, action.payload],
        },
      };

    case 'UPDATE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.id
              ? { ...field, ...action.payload.field }
              : field
          ),
        },
      };

    case 'DELETE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.filter(field => field.id !== action.payload),
          columns: state.currentForm.columns.map(column => ({
            ...column,
            fieldIds: column.fieldIds.filter(id => id !== action.payload),
          })),
        },
      };

    case 'ADD_COLUMN':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          columns: [...state.currentForm.columns, action.payload],
        },
      };

    case 'UPDATE_COLUMN':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          columns: state.currentForm.columns.map(column =>
            column.id === action.payload.id
              ? { ...column, ...action.payload.column }
              : column
          ),
        },
      };

    case 'DELETE_COLUMN':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          columns: state.currentForm.columns.filter(column => column.id !== action.payload),
          fields: state.currentForm.fields.map(field =>
            field.columnId === action.payload
              ? { ...field, columnId: undefined }
              : field
          ),
        },
      };

    case 'MOVE_FIELD_TO_COLUMN':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.fieldId
              ? { ...field, columnId: action.payload.columnId }
              : field
          ),
          columns: state.currentForm.columns.map(column => ({
            ...column,
            fieldIds: column.id === action.payload.columnId
              ? [...column.fieldIds.filter(id => id !== action.payload.fieldId), action.payload.fieldId]
              : column.fieldIds.filter(id => id !== action.payload.fieldId),
          })),
        },
      };
    
    case 'ADD_SECTION':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          sections: [...state.currentForm.sections, action.payload],
        },
      };
    
    case 'UPDATE_SECTION':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          sections: state.currentForm.sections.map(section =>
            section.id === action.payload.id
              ? { ...section, ...action.payload.section }
              : section
          ),
        },
      };
    
    case 'DELETE_SECTION':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          sections: state.currentForm.sections.filter(section => section.id !== action.payload),
          fields: state.currentForm.fields.map(field =>
            field.sectionId === action.payload
              ? { ...field, sectionId: undefined }
              : field
          ),
        },
      };
    
    case 'MOVE_FIELD_TO_SECTION':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.fieldId
              ? { ...field, sectionId: action.payload.sectionId }
              : field
          ),
        },
      };
    
    case 'REORDER_SECTIONS':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          sections: action.payload,
        },
      };

    default:
      return state;
  }
}

const FormContext = createContext<{
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
} | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}