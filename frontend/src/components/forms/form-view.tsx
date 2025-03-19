'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDownIcon } from 'lucide-react';

type Question = {
  id: number;
  text: string;
  type: 'text' | 'multiple_choice' | 'checkbox' | 'yes_no';
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
  
  questions.forEach((question, index) => {
    const stringSchema = question.required ? z.string().min(1, 'This field is required') : z.string().optional();
    const booleanSchema = question.required ? z.boolean() : z.boolean().optional();
    
    if (question.type === 'yes_no') {
      shape[`question_${index}`] = booleanSchema;
    } else if (question.type === 'multiple_choice') {
      shape[`question_${index}`] = stringSchema;
    } else if (question.type === 'checkbox') {
      shape[`question_${index}`] = z.array(z.string()).min(question.required ? 1 : 0);
    } else {
      shape[`question_${index}`] = stringSchema;
    }
  });

  return z.object(shape);
};

interface FormViewProps {
  formData: FormData;
  onSubmit: (data: any) => void;
  userRole: 'user' | 'admin';
  isCompleted?: boolean;
  defaultValues?: Record<string, any>;
}

export function FormView({ formData, onSubmit, userRole, isCompleted = false, defaultValues }: FormViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = createDynamicSchema(formData.questions);
  const isAdmin = userRole === 'admin';
  const isDisabled = isAdmin || isCompleted;
  
  // Merge the generated default values with any provided values
  const initialValues = {
    ...formData.questions.reduce((acc, question, index) => {
      if (question.type === 'checkbox') {
        acc[`question_${index}`] = [];
      } else if (question.type === 'yes_no') {
        acc[`question_${index}`] = false;
      } else {
        acc[`question_${index}`] = '';
      }
      return acc;
    }, {} as Record<string, any>),
    ...(defaultValues || {})
  };
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
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
        <CardHeader className='grid gap-4'>
          {isAdmin && (
            <p className="text-sm bg-amber-100 p-2 rounded text-amber-800">
              Admin view: All fields are disabled
            </p>
          )}
          {isCompleted && !isAdmin && (
            <p className="text-sm bg-green-100 p-2 rounded text-green-800">
              You have already submitted this form. Your responses are displayed below.
            </p>
          )}
          <CardTitle>{formData.title}</CardTitle>
          {formData.description && (
            <p className="text-sm text-muted-foreground">
              {formData.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {formData.questions.map((question, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`question_${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {question.text}
                        {question.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="w-full">
                        {question.type === 'text' && (
                          <Textarea {...field} disabled={isDisabled} />
                        )}
                        {question.type === 'multiple_choice' && (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={isDisabled}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {question.type === 'yes_no' && (
                          <div className="flex gap-4">
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={field.value?.toString()}
                              disabled={isDisabled}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`yes-${index}`} />
                                <FormLabel htmlFor={`yes-${index}`} className="cursor-pointer">Yes</FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`no-${index}`} />
                                <FormLabel htmlFor={`no-${index}`} className="cursor-pointer">No</FormLabel>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                        {question.type === 'checkbox' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between font-normal" disabled={isDisabled}>
                                {field.value?.length > 0 
                                  ? `Selected: ${field.value.join(', ')}` 
                                  : "Select options"}
                                  
                                <ChevronDownIcon className="size-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full" align="start">
                              {question.options?.map((option) => (
                                <DropdownMenuCheckboxItem
                                  key={option}
                                  checked={field.value?.includes(option)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    const newValue = checked
                                      ? [...currentValue, option]
                                      : currentValue.filter((v: string) => v !== option);
                                    field.onChange(newValue);
                                  }}
                                  // disabled={isAdmin}
                                >
                                  {option}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isDisabled}
              >
                {isSubmitting ? 'Submitting...' : isAdmin ? 'View Only' : isCompleted ? 'Already Submitted' : 'Submit Form'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 