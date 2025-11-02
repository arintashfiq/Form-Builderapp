import axios from 'axios';
import { Form, FormSubmission, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const formApi = {
  // Get all forms
  getForms: async (): Promise<Form[]> => {
    const response = await api.get<ApiResponse<Form[]>>('/forms');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch forms');
    }
    return response.data.data || [];
  },

  // Get form by ID
  getForm: async (id: string): Promise<Form> => {
    const response = await api.get<ApiResponse<Form>>(`/forms/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch form');
    }
    return response.data.data!;
  },

  // Create form
  createForm: async (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const response = await api.post<ApiResponse<{ id: string }>>('/forms', form);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create form');
    }
    return response.data.data!.id;
  },

  // Update form
  updateForm: async (id: string, form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/forms/${id}`, form);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update form');
    }
  },

  // Delete form
  deleteForm: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/forms/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete form');
    }
  },

  // Submit form
  submitForm: async (id: string, data: Record<string, any>): Promise<string> => {
    const response = await api.post<ApiResponse<{ id: string }>>(`/forms/${id}/submit`, data);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to submit form');
    }
    return response.data.data!.id;
  },

  // Get form submissions
  getSubmissions: async (id: string): Promise<FormSubmission[]> => {
    const response = await api.get<ApiResponse<FormSubmission[]>>(`/forms/${id}/submissions`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch submissions');
    }
    return response.data.data || [];
  },

  // Upload file
  uploadFile: async (file: File): Promise<{ filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<{ filename: string; path: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to upload file');
    }
    
    return response.data.data!;
  },
};