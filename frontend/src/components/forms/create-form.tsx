'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formsApi } from '@/lib/api/forms';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['text', 'multiple_choice', 'checkbox']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
  order: z.number(),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateForm() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [],
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'text',
        options: [],
        required: true,
        order: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    newQuestions.forEach((q, i) => (q.order = i));
    setQuestions(newQuestions);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await formsApi.createForm(data);
      toast.success('Form created successfully');
      router.push('/forms');
    } catch (error) {
      toast.error('Failed to create form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Form</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Form Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter form title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter form description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`questions.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter question" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="multiple_choice">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(question.type === 'multiple_choice' ||
                        question.type === 'checkbox') && (
                        <FormField
                          control={form.control}
                          name={`questions.${index}.options`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Options</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter options (comma-separated)"
                                  value={field.value?.join(', ') || ''}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        .split(',')
                                        .map((opt) => opt.trim())
                                        .filter(Boolean)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Form...' : 'Create Form'}
          </Button>
        </form>
      </Form>
    </div>
  );
} 