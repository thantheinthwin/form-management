import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}

export interface FormResponse {
  questionId: number;
  answer: string;
}

export const formsApi = {
  // Forms
  getForms: () => api.get<Form[]>('/forms').then((res) => res.data),
  
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