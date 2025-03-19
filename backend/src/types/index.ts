export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Question {
  id: number;
  text: string;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'yes_no';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Form {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
  created_by: number;
  created_at: string;
}

export interface FormResponse {
  questionId: number;
  answer: string;
}

export interface UserFormAssignment {
  id: number;
  user_id: number;
  form_id: number;
  status: 'pending' | 'completed';
}

export interface FormSubmission {
  id: number;
  user_id: number;
  form_id: number;
  answers: FormResponse[];
  submitted_at: string;
} 