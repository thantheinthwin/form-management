import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Question = {
  id: number;
  text: string;
  type: 'text' | 'multiple_choice' | 'checkbox';
  options?: string[];
  required: boolean;
  order: number;
};

type FormData = {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
};

const createDynamicSchema = (questions: Question[]) => {
  const shape: Record<string, any> = {};
  
  questions.forEach((question) => {
    const baseSchema = question.required ? z.string().min(1, 'This field is required') : z.string().optional();
    
    if (question.type === 'multiple_choice') {
      shape[`question_${question.id}`] = baseSchema;
    } else if (question.type === 'checkbox') {
      shape[`question_${question.id}`] = z.array(z.string()).min(1, 'Select at least one option');
    } else {
      shape[`question_${question.id}`] = baseSchema;
    }
  });

  return z.object(shape);
};

interface FormViewProps {
  formData: FormData;
  onSubmit: (data: any) => void;
}

export function FormView({ formData, onSubmit }: FormViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = createDynamicSchema(formData.questions);
  
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{formData.title}</CardTitle>
          {formData.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {formData.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {formData.questions.map((question) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={`question_${question.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {question.text}
                        {question.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        {question.type === 'text' && (
                          <Textarea {...field} />
                        )}
                        {question.type === 'multiple_choice' && (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            {question.options?.map((option) => (
                              <div
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem value={option} id={option} />
                                <label htmlFor={option}>{option}</label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        {question.type === 'checkbox' && (
                          <div className="space-y-2">
                            {question.options?.map((option) => (
                              <div
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={option}
                                  checked={field.value?.includes(option)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    const newValue = checked
                                      ? [...currentValue, option]
                                      : currentValue.filter((v: string) => v !== option);
                                    field.onChange(newValue);
                                  }}
                                />
                                <label htmlFor={option}>{option}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 