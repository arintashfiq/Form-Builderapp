import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Save, Eye, Plus, Settings, Trash2 } from 'lucide-react';
import { useForm } from '../contexts/FormContext';
import { formApi } from '../services/api';
import { FormField, FormColumn, Form } from '../types';
import FormRenderer from '../components/FormRenderer';
import DragDropField from '../components/DragDropField';
import FieldEditor from '../components/FieldEditor';
import ColumnEditor from '../components/ColumnEditor';
import DropZoneColumn from '../components/DropZoneColumn';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const [formName, setFormName] = useState('');
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<FormColumn | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      // Loading existing form
      if (!state.currentForm || state.currentForm.id !== id) {
        loadForm(id);
      }
    } else {
      // Creating new form - only if we don't already have a temporary form
      if (!state.currentForm || state.currentForm.id !== '') {
        const tempForm: Form = {
          id: '', // Empty ID indicates it's not saved yet
          name: 'New Form',
          fields: [],
          columns: [{ id: uuidv4(), name: 'Main Column', width: 100, fieldIds: [] }],
          sections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dispatch({ type: 'SET_CURRENT_FORM', payload: tempForm });
        setFormName(tempForm.name);
      }
    }
  }, [id]);

  // Sync form name with current form when it changes
  useEffect(() => {
    if (state.currentForm && state.currentForm.name && !formName) {
      setFormName(state.currentForm.name);
    }
  }, [state.currentForm, formName]);

  const loadForm = async (formId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const form = await formApi.getForm(formId);
      dispatch({ type: 'SET_CURRENT_FORM', payload: form });
      setFormName(form.name);
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

    const formData = {
      name: finalFormName,
      fields: state.currentForm.fields,
      columns: state.currentForm.columns,
      sections: state.currentForm.sections || [],
    };

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
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      question: `New ${type} field`,
      required: false,
      ...(type === 'dropdown' && { options: ['Option 1', 'Option 2'] }),
      ...(type === 'table' && {
        tableColumns: [
          { id: uuidv4(), name: 'Column 1', type: 'text' },
          { id: uuidv4(), name: 'Column 2', type: 'dropdown', options: ['Yes', 'No'] },
        ],
      }),
    };
    dispatch({ type: 'ADD_FIELD', payload: newField });
  };

  const addColumn = () => {
    const newColumn: FormColumn = {
      id: uuidv4(),
      name: 'New Column',
      width: 50,
      fieldIds: [],
    };
    dispatch({ type: 'ADD_COLUMN', payload: newColumn });
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Field Types */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-4">Field Types</h3>
          <div className="space-y-2">
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
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onBlur={(e) => {
                  // Ensure form name is never empty
                  if (!e.target.value.trim()) {
                    setFormName(state.currentForm?.name || 'Untitled Form');
                  }
                }}
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
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6" ref={drop}>
            {state.currentForm.fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No fields added yet. Click on field types to add them.</p>
                <p className="text-xs mt-2">Drag fields to columns in the sidebar to organize your form layout.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Show fields organized by columns */}
                {state.currentForm.columns.map((column: FormColumn) => {
                  const fieldsInColumn = state.currentForm?.fields.filter(field => field.columnId === column.id) || [];
                  if (fieldsInColumn.length === 0) return null;

                  return (
                    <div key={column.id} className="border-2 border-dashed border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                        📋 {column.name} ({column.width}%)
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

                {/* Show unassigned fields */}
                {(() => {
                  const unassignedFields = state.currentForm?.fields.filter(field => !field.columnId) || [];
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
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Field/Column Editor */}
      <div className="lg:col-span-1">
        {selectedField && (
          <FieldEditor
            field={selectedField}
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
      </div>

      {state.error && (
        <div className="lg:col-span-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}
    </div>
  );
}