import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { formApi } from '../services/api';
import { Form, FormSubmission } from '../types';

export default function FormSubmissions() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadFormAndSubmissions(id);
    }
  }, [id]);

  const loadFormAndSubmissions = async (formId: string) => {
    setLoading(true);
    try {
      const [formData, submissionsData] = await Promise.all([
        formApi.getForm(formId),
        formApi.getSubmissions(formId)
      ]);
      setForm(formData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (fieldId: string): string => {
    if (!form) return fieldId;
    const field = form.fields.find(f => f.id === fieldId);
    return field ? field.question : fieldId;
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    // Get all unique field IDs from submissions
    const allFieldIds = new Set<string>();
    submissions.forEach(submission => {
      Object.keys(submission.data).forEach(fieldId => allFieldIds.add(fieldId));
    });

    // Create CSV headers
    const headers = ['Submission ID', 'Submitted At', ...Array.from(allFieldIds).map(getFieldLabel)];
    
    // Create CSV rows
    const rows = submissions.map(submission => [
      submission.id,
      new Date(submission.submittedAt).toLocaleString(),
      ...Array.from(allFieldIds).map(fieldId => 
        submission.data[fieldId] ? formatValue(submission.data[fieldId]) : ''
      )
    ]);

    // Convert to CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to Forms
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Form not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to Forms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
            <p className="text-gray-600 mt-2">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/preview/${form.id}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Form
            </Link>
            {submissions.length > 0 && (
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-500 text-lg">No submissions yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Share your form to start collecting responses
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  {form.fields.map(field => (
                    <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.question}
                      <span className="text-gray-400 ml-1">({field.type})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <tr key={submission.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {submission.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    {form.fields.map(field => (
                      <td key={field.id} className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs overflow-hidden">
                          {submission.data[field.id] ? (
                            <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                              {formatValue(submission.data[field.id])}
                            </pre>
                          ) : (
                            <span className="text-gray-400 italic">No response</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}