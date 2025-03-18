import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if it's an authentication error from our API
    if (error.response?.status === 401 && error.response?.data?.authError) {
      console.error('Authentication error detected in API response');
      
      // Sign out the user and redirect to login page
      await signOut({ callbackUrl: '/login?error=session_expired' });
      
      // Don't retry the request
      return Promise.reject(error);
    }
    
    // Pass through any other errors
    return Promise.reject(error);
  }
);

// // Add session token to requests
// api.interceptors.request.use(async (config) => {
//   const session = await getSession();
//   if (session?.user) {
//     // Use the JWT token from the session
//     const token = session.token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

export interface CreateFormData {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: 'text' | 'multiple_choice' | 'checkbox' | 'yes_no';
    options?: string[];
    required: boolean;
    order: number;
  }[];
}

export interface Form {
  id: number;
  title: string;
  description?: string;
  createdBy: string;
  totalAssignments: number;
  completedAssignments: number;
  createdAt: string;
  status?: 'pending' | 'completed';
}

export interface FormResponse {
  questionId: number;
  answer: string;
}

export const formsApi = {
  // Forms
  getForms: () => api.get<Form[]>('/forms').then((res) => res.data),
  
  getAssignedForms: () => api.get<Form[]>('/forms/assigned').then((res) => res.data),
  
  getForm: (id: number) => api.get(`/forms/${id}`).then((res) => res.data),
  
  createForm: (data: CreateFormData) =>
    api.post('/forms', data).then((res) => res.data),
  
  deleteForm: (id: number) => api.delete(`/forms/${id}`),

  // Form Assignments
  assignForm: (formId: number, userIds: number[]) =>
    api.post(`/forms/${formId}/assign`, { userIds }).then((res) => res.data),

  // Form Responses
  submitResponse: (formId: number, responses: FormResponse[]) =>
    api.post(`/responses/${formId}/submit`, { responses }).then((res) => res.data),

  getResponses: (formId: number) =>
    api.get(`/responses/${formId}`).then((res) => res.data),
}; 