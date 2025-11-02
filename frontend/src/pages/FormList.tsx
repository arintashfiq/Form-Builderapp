import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useForm } from '../contexts/FormContext';
import { formApi } from '../services/api';

export default function FormList() {
  const { state, dispatch } = useForm();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const forms = await formApi.getForms();
      dispatch({ type: 'SET_FORMS', payload: forms });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      await formApi.deleteForm(id);
      await loadForms();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Campaign Forms</h1>
        <Link
          to="/builder"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Form
        </Link>
      </div>

      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      {state.forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No forms created yet</p>
            <p className="text-sm">Create your first marketing campaign form to get started</p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} • 
                {form.columns.length} column{form.columns.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Created: {new Date(form.createdAt).toLocaleDateString()}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link
                  to={`/preview/${form.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Link>
                <Link
                  to={`/builder/${form.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/submissions/${form.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Submissions
                </Link>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}