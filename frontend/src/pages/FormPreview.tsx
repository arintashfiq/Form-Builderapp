import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useForm } from '../contexts/FormContext';
import { Form } from '../types';
import { formApi } from '../services/api';
import FormRenderer from '../components/FormRenderer';
import SectionNavigation from '../components/SectionNavigation';

export default function FormPreview() {
  const { id } = useParams();
  const { state, dispatch } = useForm();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [allowedSections, setAllowedSections] = useState<Set<string>>(new Set());
  const [sectionPath, setSectionPath] = useState<string[]>([]);


  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const cleanupConditionalLogic = (form: Form): Form => {
    const sectionIds = form.sections?.map(s => s.id) || [];
    
    const cleanedFields = form.fields.map(field => {
      if (field.type === 'dropdown' && field.conditionalLogic && field.options) {
        // Remove conditional rules that reference non-existent options or sections
        const validConditions = field.conditionalLogic.conditions.filter(condition => {
          const hasValidOption = field.options!.includes(condition.answer);
          const hasValidTarget = condition.targetSectionId === 'end' || sectionIds.includes(condition.targetSectionId);
          return hasValidOption && hasValidTarget;
        });
        
        // Only keep conditionalLogic if there are valid conditions
        const conditionalLogic = validConditions.length > 0 
          ? { conditions: validConditions }
          : undefined;
          
        console.log(`🧹 Cleaned conditional logic for field "${field.question}":`, {
          originalConditions: field.conditionalLogic.conditions.length,
          validConditions: validConditions.length,
          removedInvalid: field.conditionalLogic.conditions.length - validConditions.length
        });
          
        return { ...field, conditionalLogic };
      }
      return field;
    });
    
    return { ...form, fields: cleanedFields };
  };

  const loadForm = async (formId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const form = await formApi.getForm(formId);
      
      // Clean up invalid conditional logic rules
      const cleanedForm = cleanupConditionalLogic(form);
      
      dispatch({ type: 'SET_CURRENT_FORM', payload: cleanedForm });
      
      // Initialize allowed sections - first section is always allowed
      if (cleanedForm.sections && cleanedForm.sections.length > 0) {
        const firstSection = cleanedForm.sections.sort((a, b) => a.order - b.order)[0];
        setAllowedSections(new Set([firstSection.id]));
        setSectionPath([firstSection.id]);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const validateForm = (): boolean => {
    if (!state.currentForm) return false;

    const newErrors: Record<string, string> = {};

    // Only validate fields in sections that the user has visited (allowedSections)
    const fieldsToValidate = state.currentForm.fields.filter(field => {
      // If field has no sectionId, validate it (backward compatibility)
      if (!field.sectionId) return true;
      
      // Only validate fields in sections the user has visited
      return allowedSections.has(field.sectionId);
    });

    console.log('🔍 Form validation:', {
      totalFields: state.currentForm.fields.length,
      fieldsToValidate: fieldsToValidate.length,
      allowedSections: Array.from(allowedSections),
      skippedFields: state.currentForm.fields.length - fieldsToValidate.length,
      fieldsToValidateDetails: fieldsToValidate.map(f => ({ 
        id: f.id, 
        question: f.question, 
        sectionId: f.sectionId, 
        required: f.required 
      })),
      skippedFieldsDetails: state.currentForm.fields
        .filter(f => f.sectionId && !allowedSections.has(f.sectionId))
        .map(f => ({ 
          id: f.id, 
          question: f.question, 
          sectionId: f.sectionId, 
          required: f.required 
        }))
    });

    fieldsToValidate.forEach(field => {
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
  };

  const handleConditionalTrigger = (targetSectionId: string) => {
    console.log('🎯 Conditional trigger called:', {
      targetSectionId,
      currentSectionIndex,
      availableSections: state.currentForm?.sections?.map(s => ({ id: s.id, title: s.title })) || [],
      currentAllowedSections: Array.from(allowedSections),
      currentPath: sectionPath
    });
    
    if (targetSectionId === 'end') {
      console.log('🏁 Submitting form due to conditional logic');
      handleSubmit(new Event('submit') as any);
    } else {
      const targetIndex = state.currentForm?.sections?.findIndex(s => s.id === targetSectionId);
      console.log('🔍 Looking for section:', { targetSectionId, targetIndex });
      
      if (targetIndex !== undefined && targetIndex !== -1) {
        console.log('✅ Navigating to section via conditional logic:', targetIndex);
        
        // Add target section to allowed sections
        const newAllowedSections = new Set(allowedSections);
        newAllowedSections.add(targetSectionId);
        setAllowedSections(newAllowedSections);
        
        // Update the section path
        const newPath = [...sectionPath, targetSectionId];
        setSectionPath(newPath);
        
        console.log('🔀 Updated branching state:', {
          newAllowedSections: Array.from(newAllowedSections),
          newPath
        });
        
        setCurrentSectionIndex(targetIndex);
      } else {
        console.log('❌ Target section not found:', targetSectionId);
      }
    }
  };

  const getNextAllowedSection = (currentIndex: number): number | null => {
    if (!state.currentForm?.sections) return null;
    
    const sortedSections = state.currentForm.sections.sort((a, b) => a.order - b.order);
    
    // Look for the next section that is in our allowed sections
    for (let i = currentIndex + 1; i < sortedSections.length; i++) {
      const section = sortedSections[i];
      if (allowedSections.has(section.id)) {
        console.log('📍 Found next allowed section:', {
          sectionIndex: i,
          sectionId: section.id,
          sectionTitle: section.title
        });
        return i;
      }
    }
    
    console.log('🏁 No more allowed sections, should submit');
    return null; // No more allowed sections, should submit
  };

  const handleNextSection = () => {
    if (!canProceedToNext() || !state.currentForm?.sections) return;
    
    const sortedSections = state.currentForm.sections.sort((a, b) => a.order - b.order);
    const currentSection = sortedSections[currentSectionIndex];
    
    console.log('🔄 handleNextSection called:', {
      currentSectionIndex,
      currentSectionTitle: currentSection.title,
      allowNext: currentSection.allowNext,
      nextSectionId: currentSection.nextSectionId
    });
    
    // Check if current section allows next navigation
    if (currentSection.allowNext === false) {
      console.log('🚫 Next navigation disabled for this section');
      return;
    }
    
    let nextIndex: number | null = null;
    let navigationReason = '';
    
    // Priority 1: Check if current section has a specific next section configured
    if (currentSection.nextSectionId) {
      if (currentSection.nextSectionId === 'end') {
        console.log('🏁 Section configured to submit form');
        handleSubmit(new Event('submit') as any);
        return;
      } else {
        // Find the configured next section
        nextIndex = sortedSections.findIndex(s => s.id === currentSection.nextSectionId);
        if (nextIndex !== -1) {
          navigationReason = 'configured nextSectionId';
          console.log('🎯 Using configured next section:', {
            sectionIndex: nextIndex,
            sectionId: currentSection.nextSectionId,
            sectionTitle: sortedSections[nextIndex].title,
            reason: navigationReason
          });
        } else {
          console.log('❌ Configured next section not found:', currentSection.nextSectionId);
        }
      }
    }
    
    // Priority 2: If no valid custom next section, check conditional logic
    if (nextIndex === null || nextIndex === -1) {
      nextIndex = getNextAllowedSection(currentSectionIndex);
      if (nextIndex !== null) {
        navigationReason = 'conditional logic';
        console.log('🔀 Using conditional logic navigation:', {
          sectionIndex: nextIndex,
          sectionTitle: sortedSections[nextIndex].title,
          reason: navigationReason
        });
      }
    }
    
    // Priority 3: If no conditional path, use sequential navigation
    if (nextIndex === null) {
      const sequentialNextIndex = currentSectionIndex + 1;
      if (sequentialNextIndex < sortedSections.length) {
        nextIndex = sequentialNextIndex;
        navigationReason = 'sequential';
        console.log('➡️ Using sequential navigation:', {
          sectionIndex: nextIndex,
          sectionId: sortedSections[nextIndex].id,
          sectionTitle: sortedSections[nextIndex].title,
          reason: navigationReason
        });
      }
    }
    
    // Execute the navigation
    if (nextIndex !== null && nextIndex !== -1 && nextIndex < sortedSections.length) {
      const nextSection = sortedSections[nextIndex];
      
      // Add next section to allowed sections
      const newAllowedSections = new Set(allowedSections);
      newAllowedSections.add(nextSection.id);
      setAllowedSections(newAllowedSections);
      
      // Update path
      const newPath = [...sectionPath, nextSection.id];
      setSectionPath(newPath);
      
      console.log('✅ Successfully navigating to section:', {
        fromIndex: currentSectionIndex,
        toIndex: nextIndex,
        toSectionTitle: nextSection.title,
        navigationReason,
        newPath: newPath.map(id => sortedSections.find(s => s.id === id)?.title).join(' → ')
      });
      
      setCurrentSectionIndex(nextIndex);
    } else {
      console.log('🏁 No valid next section found, submitting form');
      handleSubmit(new Event('submit') as any);
    }
  };

  const isAtEndOfAllowedPath = (): boolean => {
    if (!state.currentForm?.sections) return true;
    
    // Check if there are any more allowed sections after the current one
    const nextAllowedIndex = getNextAllowedSection(currentSectionIndex);
    return nextAllowedIndex === null;
  };

  const canSubmitFromCurrentSection = (): boolean => {
    if (!state.currentForm?.sections) return true;
    
    const sortedSections = state.currentForm.sections.sort((a, b) => a.order - b.order);
    const currentSection = sortedSections[currentSectionIndex];
    
    // Check if current section allows submission (default to true for backward compatibility)
    return currentSection.allowSubmit !== false;
  };

  const getVisibleFields = () => {
    if (!state.currentForm) return [];

    // Check if form has sections
    const hasSections = state.currentForm.sections && state.currentForm.sections.length > 0;
    
    if (!hasSections) {
      // No sections: show all fields
      return state.currentForm.fields;
    }

    // Has sections: show current section's fields
    const currentSection = state.currentForm.sections[currentSectionIndex];
    if (!currentSection) {
      return state.currentForm.fields; // Fallback to all fields
    }

    // Get fields for current section
    let sectionFields = state.currentForm.fields.filter(f => f.sectionId === currentSection.id);
    
    // Fallback: if no fields match sectionId, show fields without sectionId in first section
    if (sectionFields.length === 0 && currentSectionIndex === 0) {
      sectionFields = state.currentForm.fields.filter(f => !f.sectionId);
    }

    return sectionFields;
  };

  const canProceedToNext = (): boolean => {
    if (!state.currentForm) return false;

    // Check if current section allows next navigation
    if (state.currentForm.sections && state.currentForm.sections.length > 0) {
      const sortedSections = state.currentForm.sections.sort((a, b) => a.order - b.order);
      const currentSection = sortedSections[currentSectionIndex];
      
      if (currentSection.allowNext === false) {
        return false;
      }
    }

    const visibleFields = getVisibleFields();
    
    // Check if all required fields are filled
    const hasUnfilledRequired = visibleFields.some(field => {
      if (!field.required) return false;
      const value = formData[field.id];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (hasUnfilledRequired) {
      return false;
    }

    // Check if there are dropdown fields with conditional logic that haven't been answered
    const conditionalDropdowns = visibleFields.filter(field => 
      field.type === 'dropdown' && 
      field.conditionalLogic && 
      field.conditionalLogic.conditions.length > 0
    );

    // If there are conditional dropdowns, user must select an option (no manual next)
    const hasUnansweredConditional = conditionalDropdowns.some(field => {
      const value = formData[field.id];
      return !value; // Must have a value selected
    });

    return !hasUnansweredConditional;
  };

  const renderFormColumns = () => {
    if (!state.currentForm) return null;

    const visibleFields = getVisibleFields();
    const hasSections = state.currentForm.sections && state.currentForm.sections.length > 0;
    const currentSection = hasSections ? state.currentForm.sections[currentSectionIndex] : null;

    const sectionHeader = hasSections && currentSection ? (
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{currentSection.title}</h2>
        {currentSection.description && (
          <p className="text-gray-600 mt-2">{currentSection.description}</p>
        )}
      </div>
    ) : null;

    if (state.currentForm.columns.length <= 1) {
      // Single column layout
      return (
        <div className="space-y-6">
          {sectionHeader}
          {visibleFields.map(field => (
            <FormRenderer
              key={field.id}
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              error={errors[field.id]}
              preview={true}
              onConditionalTrigger={handleConditionalTrigger}
            />
          ))}
        </div>
      );
    }

    // Multi-column layout
    return (
      <div className="space-y-6">
        {sectionHeader}
        <div className={`grid gap-6 ${
          state.currentForm.columns.length === 1 
            ? 'grid-cols-1' 
            : state.currentForm.columns.length === 2 
            ? 'grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
        {state.currentForm.columns.map(column => (
          <div key={column.id} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              {column.name}
            </h3>
            {visibleFields
              .filter(field => field.columnId === column.id)
              .map(field => (
                <FormRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  preview={true}
                  onConditionalTrigger={handleConditionalTrigger}
                />
              ))}
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
                onConditionalTrigger={handleConditionalTrigger}
              />
            ))}
        </div>
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



      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          {renderFormColumns()}
        </form>

        {/* Section Navigation */}
        {state.currentForm.sections && state.currentForm.sections.length > 1 && (
          <SectionNavigation
            currentSection={currentSectionIndex}
            totalSections={state.currentForm.sections.length}
            canGoNext={canProceedToNext()}
            onNext={handleNextSection}
            sectionTitles={state.currentForm.sections
              .sort((a, b) => a.order - b.order)
              .map(section => section.title)}
          />
        )}

        {/* Submit button for single section or end of allowed path */}
        {(!state.currentForm.sections ||
          state.currentForm.sections.length <= 1 ||
          (isAtEndOfAllowedPath() && canSubmitFromCurrentSection())) && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
      </div>
    </div>
  );
}