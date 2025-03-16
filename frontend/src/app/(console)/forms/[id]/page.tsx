import { FormView } from '@/components/forms/form-view';

// This would normally fetch the form data from your API
const mockFormData = {
  id: 1,
  title: 'Sample Form',
  description: 'This is a sample form description.',
  questions: [
    {
      id: 1,
      text: 'What is your name?',
      type: 'text' as const,
      required: true,
      order: 0,
    },
    {
      id: 2,
      text: 'Which programming languages do you know?',
      type: 'checkbox' as const,
      options: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'],
      required: true,
      order: 1,
    },
    {
      id: 3,
      text: 'What is your preferred development environment?',
      type: 'multiple_choice' as const,
      options: ['VS Code', 'IntelliJ', 'Sublime Text', 'Vim'],
      required: false,
      order: 2,
    },
  ],
};

export default function FormPage() {
  const handleSubmit = async (data: any) => {
    // This would normally send the data to your API
    console.log('Form submitted:', data);
  };

  return (
    <div className="container py-6">
      <FormView formData={mockFormData} onSubmit={handleSubmit} />
    </div>
  );
} 