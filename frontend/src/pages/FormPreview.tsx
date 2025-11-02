import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useForm } from '../contexts/FormContext';
import { formApi } from '../services/api';
import FormRenderer from '../components/FormRenderer';

export default function FormPreview() {
  const { id } = useParams();
  const { state, dispatch } = useForm();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const form = await formApi.getForm(formId);
      dispatch({ type: 'SET_CURRENT_FORM', payload: form });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const validateForm = (): boolean => {
    if (!state.currentForm) return false;

    const newErrors: Record<string, string> = {};

    state.currentForm.fields.forEach(field => {
      const value = formData[field.id];

      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[field.id] = 'This field is required';
        return;
      }

      if (field.type === 'text' && value) {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.id] = `Minimum length is ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.id] = `Maximum length is ${field.validation.maxLength} characters`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) return;

    setIsSubmitting(true);
    try {
      await formApi.submitForm(id, formData);
      setSubmitted(true);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }

    // TODO: Handle conditional logic (to be implemented later)
  };

  const getVisibleFields = () => {
    if (!state.currentForm) return [];

    // For now, show all fields. In a full implementation, you'd handle conditional logic here
    return state.currentForm.fields;
  };

  const renderFormColumns = () => {
    if (!state.currentForm) return null;

    const visibleFields = getVisibleFields();

    if (state.currentForm.columns.length <= 1) {
      // Single column layout
      return (
        <div className="space-y-6">
          {visibleFields.map(field => (
            <FormRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              error={errors[field.id]}
              preview={true}
            />
          ))}
        </div>
      );
    }

    // Multi-column layout
    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: state.currentForm.columns.map(col => `${col.width}fr`).join(' ') }}>
        {state.currentForm.columns.map(column => (
          <div key={column.id} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              {column.name}
            </h3>
            {column.fieldIds.map(fieldId => {
              const field = visibleFields.find(f => f.id === fieldId);
              if (!field) return null;

              return (
                <FormRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  preview={true}
                />
              );
            })}
          </div>
        ))}

        {/* Fields not assigned to any column */}
        <div className="space-y-6">
          {visibleFields
            .filter(field => !state.currentForm!.columns.some(col => col.fieldIds.includes(field.id)))
            .map(field => (
              <FormRenderer
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={errors[field.id]}
                preview={true}
              />
            ))}
        </div>
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.currentForm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Form not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Back to Forms
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-green-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your submission. We'll get back to you soon.</p>
          <div className="space-x-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({});
                setErrors({});
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/builder/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builder
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{state.currentForm.name}</h1>
        <p className="text-gray-600 mt-2">Preview and test your form</p>
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8">
        {renderFormColumns()}

        <div className="mt-8 pt-6 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Form
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}