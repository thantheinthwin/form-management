'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { formsApi } from '@/lib/api/forms';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['text', 'multiple_choice', 'checkbox', 'yes_no']),
  options: z.array(z.string().min(1, 'Option text cannot be empty'))
    .optional()
    .superRefine((options, ctx) => {
      // Get the parent object's type from the path
      const parentObject = ctx.path[ctx.path.length - 2];
      const type = parentObject && typeof parentObject === 'object' ? (parentObject as any).type : null;
      
      if (type === 'multiple_choice' || type === 'checkbox') {
        if (!options || options.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least two options are required",
          });
          return false;
        }

        // Check if any option is empty
        const hasEmptyOption = options.some(opt => opt.trim() === '');
        if (hasEmptyOption) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "All options must have value.",
          });
          return false;
        }
      }
      return true;
    }),
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const addQuestion = () => {
    append({
      text: '',
      type: 'text',
      options: [],
      required: true,
      order: fields.length,
    });
  };

  const removeQuestion = (index: number) => {
    remove(index);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    // Check if there's any empty option already
    const hasEmptyOption = currentOptions.some(opt => !opt || opt.trim() === '');
    if (hasEmptyOption) {
      toast.error('Please fill in existing options before adding new ones');
      return;
    }
    form.setValue(`questions.${questionIndex}.options`, [...currentOptions, '']);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`) || [];
    const questionType = form.getValues(`questions.${questionIndex}.type`);
    
    // Prevent removing if it would leave less than 2 options for multiple_choice or checkbox
    if ((questionType === 'multiple_choice' || questionType === 'checkbox') && currentOptions.length <= 2) {
      toast.error('At least two options are required');
      return;
    }
    
    const newOptions = currentOptions.filter((_: string, idx: number) => idx !== optionIndex);
    form.setValue(`questions.${questionIndex}.options`, newOptions);
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

            {fields.map((field, index) => (
              <Card key={field.id}>
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
                                <SelectItem value="yes_no">Yes/No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(form.watch(`questions.${index}.type`) === 'multiple_choice' ||
                        form.watch(`questions.${index}.type`) === 'checkbox') && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <FormLabel>Options (minimum 2 required, all must have text)</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                          {(form.watch(`questions.${index}.options`) || []).map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`questions.${index}.options.${optionIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input 
                                        placeholder={`Option ${optionIndex + 1} (required)`} 
                                        {...field} 
                                        value={field.value || ''}
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => removeOption(index, optionIndex)}
                                disabled={
                                  (form.watch(`questions.${index}.type`) === 'multiple_choice' ||
                                   form.watch(`questions.${index}.type`) === 'checkbox') &&
                                  (form.watch(`questions.${index}.options`) || []).length <= 2
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(form.watch(`questions.${index}.options`) || []).length < 2 && (
                            <p className="text-sm text-red-500">At least two options are required</p>
                          )}
                          {(form.watch(`questions.${index}.options`) || []).some(opt => !opt || opt.trim() === '') && (
                            <p className="text-sm text-red-500">All options must have text</p>
                          )}
                        </div>
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