import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Save, Eye, Plus, Settings, Trash2 } from 'lucide-react';
import { useForm } from '../contexts/FormContext';
import { formApi } from '../services/api';
import { FormField, FormColumn, Form, FormSection } from '../types';
import FormRenderer from '../components/FormRenderer';
import DragDropField from '../components/DragDropField';
import FieldEditor from '../components/FieldEditor';
import ColumnEditor from '../components/ColumnEditor';
import DropZoneColumn from '../components/DropZoneColumn';
import SectionEditor from '../components/SectionEditor';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const [formName, setFormName] = useState('');
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<FormColumn | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [selectedSection, setSelectedSection] = useState<FormSection | null>(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [hasUnsavedSectionChanges, setHasUnsavedSectionChanges] = useState(false);

  useEffect(() => {
    console.log('FormBuilder useEffect - id:', id, 'currentForm:', state.currentForm?.id);
    if (id) {
      // Loading existing form
      if (!state.currentForm || state.currentForm.id !== id) {
        console.log('Loading form because currentForm.id !== id');
        loadForm(id);
      } else {
        console.log('Form already loaded, setting active section');
        // Form is already loaded, just set active section
        if (state.currentForm.sections && state.currentForm.sections.length > 0) {
          setActiveSectionId(state.currentForm.sections[0].id);
        }
      }
    } else {
      // Creating new form - only if we don't already have a temporary form
      if (!state.currentForm || state.currentForm.id !== '') {
        const defaultSectionId = uuidv4();
        const tempForm: Form = {
          id: '', // Empty ID indicates it's not saved yet
          name: 'New Form',
          fields: [],
          columns: [{ id: uuidv4(), name: 'Main Column', width: 100, fieldIds: [] }], // Kept for backward compatibility
          sections: [{
            id: defaultSectionId,
            title: 'Section 1',
            description: '',
            order: 1,
            columns: [{ id: uuidv4(), name: 'Main Column', width: 100, fieldIds: [] }]
          }],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: 'SET_CURRENT_FORM', payload: tempForm });
        setFormName(tempForm.name);
        setActiveSectionId(defaultSectionId);
      }
    }
  }, [id]);

  // Sync form name with current form when it changes (only on initial load)
  useEffect(() => {
    if (state.currentForm && state.currentForm.name && formName === '') {
      setFormName(state.currentForm.name);
    }
  }, [state.currentForm]); // Removed formName from dependencies

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
          
        console.log(`Cleaned conditional logic for field "${field.question}":`, {
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
      console.log('FormBuilder: Loaded form from API:', form);
      console.log('FormBuilder: Form sections:', form.sections);

      // Ensure backward compatibility: if no sections, create default section
      if (!form.sections || form.sections.length === 0) {
        console.log('FormBuilder: No sections found, creating default section');
        const defaultSectionId = uuidv4();
        form.sections = [{
          id: defaultSectionId,
          title: 'Section 1',
          description: '',
          order: 1,
          columns: form.columns || []
        }];

        // Assign all fields to default section
        form.fields = form.fields.map(field => ({
          ...field,
          sectionId: field.sectionId || defaultSectionId
        }));
      }

      console.log('FormBuilder: Final form with sections:', form.sections);
      
      // Clean up invalid conditional logic rules
      const cleanedForm = cleanupConditionalLogic(form);
      
      dispatch({ type: 'SET_CURRENT_FORM', payload: cleanedForm });
      setFormName(cleanedForm.name);

      // Set active section to first section
      if (form.sections && form.sections.length > 0) {
        setActiveSectionId(form.sections[0].id);
        console.log('FormBuilder: Set active section to:', form.sections[0].id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveForm = async () => {
    if (!state.currentForm || isSaving) return;

    setIsSaving(true);

    // Ensure form name is not empty - use fallback if needed
    const finalFormName = formName.trim() || state.currentForm.name || 'Untitled Form';

    // Clean up conditional logic before saving
    const cleanedForm = cleanupConditionalLogic(state.currentForm);
    
    const formData = {
      name: finalFormName,
      fields: cleanedForm.fields,
      columns: cleanedForm.columns,
      sections: cleanedForm.sections || [],
    };

    console.log('Saving form data:', formData);
    console.log('Sections being saved:', formData.sections);

    // Validate form data before sending
    if (!finalFormName) {
      dispatch({ type: 'SET_ERROR', payload: 'Form name is required' });
      setIsSaving(false);
      return;
    }

    try {
      if (id && state.currentForm.id) {
        // Update existing form
        await formApi.updateForm(id, formData);
        // Update local state with the saved name
        setFormName(finalFormName);
        dispatch({ type: 'SET_ERROR', payload: null });
        setHasUnsavedSectionChanges(false);
      } else {
        // Create new form (first time saving)
        const newId = await formApi.createForm(formData);
        // Update the current form with the new ID from the database
        dispatch({
          type: 'SET_CURRENT_FORM',
          payload: { ...state.currentForm, id: newId, name: finalFormName }
        });
        setFormName(finalFormName);
        navigate(`/builder/${newId}`);
        dispatch({ type: 'SET_ERROR', payload: null });
        setHasUnsavedSectionChanges(false);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: FormField['type']) => {
    // Get the active section or first section
    const targetSectionId = activeSectionId || state.currentForm?.sections[0]?.id;

    console.log('Adding field:', {
      type,
      activeSectionId,
      targetSectionId,
      availableSections: state.currentForm?.sections?.map(s => ({ id: s.id, title: s.title })),
      availableColumns: state.currentForm?.columns?.map(c => ({ id: c.id, name: c.name }))
    });

    const newField: FormField = {
      id: uuidv4(),
      type,
      question: `New ${type} field`,
      required: false,
      sectionId: targetSectionId,
      // No columnId - will appear as unassigned
      ...(type === 'dropdown' && { options: ['Option 1', 'Option 2'] }),
      ...(type === 'table' && {
        tableColumns: [
          { id: uuidv4(), name: 'Column 1', type: 'text' },
          { id: uuidv4(), name: 'Column 2', type: 'dropdown', options: ['Yes', 'No'] },
        ],
      }),
    };

    console.log('Created field with sectionId:', newField.sectionId);
    dispatch({ type: 'ADD_FIELD', payload: newField });
  };

  const addColumn = () => {
    const newColumn: FormColumn = {
      id: uuidv4(),
      name: 'New Column',
      width: 100, // Fixed width - not user configurable
      fieldIds: [],
    };
    dispatch({ type: 'ADD_COLUMN', payload: newColumn });
  };

  const addSection = () => {
    if (!state.currentForm) return;

    const newSection: FormSection = {
      id: uuidv4(),
      title: `Section ${(state.currentForm.sections?.length || 0) + 1}`,
      description: '',
      order: (state.currentForm.sections?.length || 0) + 1,
      columns: [{ id: uuidv4(), name: 'Main Column', width: 100, fieldIds: [] }],
      allowSubmit: true, // Default: allow submission
      allowNext: true, // Default: allow next navigation
      nextSectionId: undefined // Default: sequential navigation
    };

    dispatch({
      type: 'SET_CURRENT_FORM',
      payload: {
        ...state.currentForm,
        sections: [...(state.currentForm.sections || []), newSection]
      }
    });

    // Set the new section as active
    setActiveSectionId(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    if (!state.currentForm) return;

    // Don't allow deleting the last section
    if (state.currentForm.sections.length <= 1) {
      alert('Cannot delete the last section');
      return;
    }

    // Remove the section
    const updatedSections = state.currentForm.sections.filter(s => s.id !== sectionId);

    // Remove fields that belong to this section
    const updatedFields = state.currentForm.fields.filter(f => f.sectionId !== sectionId);

    dispatch({
      type: 'SET_CURRENT_FORM',
      payload: {
        ...state.currentForm,
        sections: updatedSections,
        fields: updatedFields
      }
    });

    // Set active section to the first one
    if (activeSectionId === sectionId && updatedSections.length > 0) {
      setActiveSectionId(updatedSections[0].id);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    if (!state.currentForm) return;

    console.log('🔄 FormBuilder updateSection called:', {
      sectionId,
      updates,
      currentSections: state.currentForm.sections.map(s => ({ id: s.id, title: s.title, nextSectionId: s.nextSectionId }))
    });

    const updatedSections = state.currentForm.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    console.log('✅ FormBuilder sections updated:', {
      updatedSections: updatedSections.map(s => ({ id: s.id, title: s.title, nextSectionId: s.nextSectionId }))
    });

    dispatch({
      type: 'SET_CURRENT_FORM',
      payload: {
        ...state.currentForm,
        sections: updatedSections
      }
    });

    // Mark that there are unsaved section changes
    setHasUnsavedSectionChanges(true);
  };

  const startEditingSection = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId);
    setEditingSectionTitle(currentTitle);
  };

  const saveEditingSection = () => {
    if (editingSectionId && editingSectionTitle.trim()) {
      updateSection(editingSectionId, { title: editingSectionTitle.trim() });
    }
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  const cancelEditingSection = () => {
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    if (!state.currentForm) return;
    const fields = [...state.currentForm.fields];
    const draggedField = fields[dragIndex];
    fields.splice(dragIndex, 1);
    fields.splice(hoverIndex, 0, draggedField);

    if (state.currentForm) {
      dispatch({
        type: 'SET_CURRENT_FORM',
        payload: { ...state.currentForm, fields },
      });
    }
  };

  const handleFieldDropToColumn = (fieldId: string, columnId: string) => {
    if (!state.currentForm) return;

    // Update the field to assign it to the column
    const updatedFields = state.currentForm.fields.map(field =>
      field.id === fieldId ? { ...field, columnId } : field
    );

    // Update the column to include this field
    const updatedColumns = state.currentForm.columns.map(column => {
      if (column.id === columnId) {
        // Add field to this column if not already there
        const fieldIds = column.fieldIds.includes(fieldId)
          ? column.fieldIds
          : [...column.fieldIds, fieldId];
        return { ...column, fieldIds };
      } else {
        // Remove field from other columns
        return { ...column, fieldIds: column.fieldIds.filter(id => id !== fieldId) };
      }
    });

    dispatch({
      type: 'SET_CURRENT_FORM',
      payload: {
        ...state.currentForm,
        fields: updatedFields,
        columns: updatedColumns
      },
    });
  };

  const [, drop] = useDrop({
    accept: 'field',
    drop: () => { },
  });

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.currentForm) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      {/* Sidebar - Field Types */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Field Types</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:grid-cols-none">
            <button
              onClick={() => addField('text')}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              📝 Text Input
            </button>
            <button
              onClick={() => addField('dropdown')}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              📋 Dropdown
            </button>
            <button
              onClick={() => addField('table')}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              📊 Table
            </button>
            <button
              onClick={() => addField('file')}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              📎 File Upload
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Columns</h4>
              <button
                onClick={addColumn}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {state.currentForm.columns.map((column: FormColumn) => (
                <DropZoneColumn
                  key={column.id}
                  column={column}
                  fieldsInColumn={column.fieldIds.length}
                  onFieldDrop={handleFieldDropToColumn}
                  onColumnClick={() => {
                    setSelectedColumn(column);
                    setShowColumnEditor(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Builder */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              />
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (id && state.currentForm?.id) {
                      // Form is already saved, go directly to preview
                      navigate(`/preview/${id}`);
                    } else {
                      // Form is not saved yet, save first then preview
                      await saveForm();
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </button>
                <button
                  onClick={saveForm}
                  disabled={isSaving}
                  className={`inline-flex items-center px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasUnsavedSectionChanges 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {hasUnsavedSectionChanges ? 'Save Changes' : 'Save'}
                      {hasUnsavedSectionChanges && (
                        <span className="ml-1 text-xs bg-orange-500 text-white px-1 rounded">!</span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          {state.currentForm && state.currentForm.sections && state.currentForm.sections.length > 0 && (
            <div className="border-b bg-gray-50">
              <div className="flex items-center px-4 py-2 overflow-x-auto">
                {state.currentForm.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className={`flex items-center px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeSectionId === section.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {editingSectionId === section.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingSectionTitle}
                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEditingSection();
                              } else if (e.key === 'Escape') {
                                cancelEditingSection();
                              }
                            }}
                            onBlur={saveEditingSection}
                            autoFocus
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <button
                            onClick={() => setActiveSectionId(section.id)}
                            className="flex items-center"
                          >
                            {section.title}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSection(section);
                              setShowSectionEditor(true);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Section Settings"
                          >
                            <Settings className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {state.currentForm && state.currentForm.sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete section "${section.title}"?`)) {
                              deleteSection(section.id);
                            }
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 inline" />
                        </button>
                      )}
                    </div>
                  ))}
                <button
                  onClick={addSection}
                  className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </button>
              </div>
            </div>
          )}

          <div className="p-6" ref={drop}>
            {(() => {
              // Get fields for the active section
              // If no activeSectionId or fields don't have sectionId, show all fields
              let sectionFields = state.currentForm.fields;

              if (activeSectionId) {
                sectionFields = state.currentForm.fields.filter(
                  field => field.sectionId === activeSectionId
                );

                // Fallback: if filtering results in no fields, show fields without sectionId
                if (sectionFields.length === 0) {
                  sectionFields = state.currentForm.fields.filter(field => !field.sectionId);
                }
              }

              if (sectionFields.length === 0) {
                return (
                  <div className="text-center py-12 text-gray-500">
                    <p>No fields in this section yet. Click on field types to add them.</p>
                    <p className="text-xs mt-2">Drag fields to columns in the sidebar to organize your form layout.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Show fields organized by columns */}
                  {state.currentForm.columns.map((column: FormColumn) => {
                    const fieldsInColumn = sectionFields.filter(field => field.columnId === column.id);
                    if (fieldsInColumn.length === 0) return null;

                    return (
                      <div key={column.id} className="border-2 border-dashed border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                          📋 {column.name}
                          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {fieldsInColumn.length} field{fieldsInColumn.length !== 1 ? 's' : ''}
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {fieldsInColumn.map((field: FormField, index: number) => {
                            const globalIndex = state.currentForm?.fields.findIndex(f => f.id === field.id) || 0;
                            return (
                              <DragDropField
                                key={field.id}
                                field={field}
                                index={globalIndex}
                                onMove={moveField}
                              >
                                <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      {field.type.toUpperCase()}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => setSelectedField(field)}
                                        className="p-1 text-gray-600 hover:text-blue-600"
                                      >
                                        <Settings className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => dispatch({ type: 'DELETE_FIELD', payload: field.id })}
                                        className="p-1 text-gray-600 hover:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <FormRenderer field={field} preview={false} />
                                </div>
                              </DragDropField>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Show unassigned fields in current section */}
                  {(() => {
                    const unassignedFields = sectionFields.filter(field => !field.columnId);
                    if (unassignedFields.length === 0) return null;

                    return (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                          📝 Unassigned Fields
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Drag to columns to organize
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {unassignedFields.map((field: FormField, index: number) => {
                            const globalIndex = state.currentForm?.fields.findIndex(f => f.id === field.id) || 0;
                            return (
                              <DragDropField
                                key={field.id}
                                field={field}
                                index={globalIndex}
                                onMove={moveField}
                              >
                                <div className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      {field.type.toUpperCase()}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => setSelectedField(field)}
                                        className="p-1 text-gray-600 hover:text-blue-600"
                                      >
                                        <Settings className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => dispatch({ type: 'DELETE_FIELD', payload: field.id })}
                                        className="p-1 text-gray-600 hover:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <FormRenderer field={field} preview={false} />
                                </div>
                              </DragDropField>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Field/Column Editor */}
      <div className="lg:col-span-2">
        {selectedField && (
          <FieldEditor
            field={selectedField}
            sections={state.currentForm?.sections || []}
            onUpdate={(updates: Partial<FormField>) => {
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: selectedField.id, field: updates },
              });
              setSelectedField({ ...selectedField, ...updates });
            }}
            onClose={() => setSelectedField(null)}
          />
        )}

        {showColumnEditor && selectedColumn && (
          <ColumnEditor
            column={selectedColumn}
            onUpdate={(updates: Partial<FormColumn>) => {
              dispatch({
                type: 'UPDATE_COLUMN',
                payload: { id: selectedColumn.id, column: updates },
              });
              setSelectedColumn({ ...selectedColumn, ...updates });
            }}
            onClose={() => {
              setShowColumnEditor(false);
              setSelectedColumn(null);
            }}
            onDelete={() => {
              dispatch({ type: 'DELETE_COLUMN', payload: selectedColumn.id });
              setShowColumnEditor(false);
              setSelectedColumn(null);
            }}
          />
        )}

        {showSectionEditor && selectedSection && (
          <SectionEditor
            section={selectedSection}
            sections={state.currentForm?.sections || []}
            onUpdate={(updates: Partial<FormSection>) => {
              updateSection(selectedSection.id, updates);
              setSelectedSection({ ...selectedSection, ...updates });
            }}
            onClose={() => {
              setShowSectionEditor(false);
              setSelectedSection(null);
            }}
          />
        )}
      </div>

      {state.error && (
        <div className="lg:col-span-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}
    </div>
  );
}