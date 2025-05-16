"use client";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DocumentTemplate } from '@/types/document-template';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/fetch-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnections, useIntegrationApp } from '@integration-app/react';
import { useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'textarea']),
  required: z.boolean(),
  options: z.array(z.string()),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]),
  validation: z.enum(['none', 'email', 'phone', 'date', 'number', 'url']),
  placeholder: z.string().optional(),
  description: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  connectionId: z.string().optional(),
  objectFields: z.array(fieldSchema),
  contactFields: z.array(fieldSchema),
  lineItemFields: z.array(fieldSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentTemplateFormProps {
  template?: DocumentTemplate;
  mode: 'create' | 'edit';
}

export function DocumentTemplateForm({ template, mode }: DocumentTemplateFormProps) {
  const router = useRouter();
  const { items: connections, loading: isLoadingConnections } = useConnections();
  const integrationAppClient = useIntegrationApp();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: template ? {
      name: template.name || '',
      description: template.description || '',
      connectionId: template.connectionId || '',
      objectFields: (template.objectFields || []).map(field => ({
        name: field.name || '',
        type: field.type || 'string',
      })),
      contactFields: (template.contactFields || []).map(field => ({
        name: field.name || '',
        type: field.type || 'string',
      })),
      lineItemFields: (template.lineItemFields || []).map(field => ({
        name: field.name || '',
        type: field.type || 'string',
      })),
    } : {
      name: '',
      description: '',
      connectionId: '',
      objectFields: [],
      contactFields: [],
      lineItemFields: [],
    },
  });

  // Debounce form values for auto-saving
  const debouncedValues = useDebounce(form.watch(), 1000);

  // Auto-save effect
  useEffect(() => {
    const saveChanges = async () => {
      if (!template?._id) return; // Don't auto-save for new templates
      
      try {
        const response = await fetch(`/api/document-templates/${template._id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debouncedValues),
        });

        if (!response.ok) {
          throw new Error('Failed to save changes');
        }
      } catch (error) {
        console.error('Error auto-saving template:', error);
      }
    };

    saveChanges();
  }, [debouncedValues, template?._id]);

  const addField = async (fieldType: 'objectFields' | 'contactFields' | 'lineItemFields') => {
    const currentFields = form.getValues(fieldType);
    const newField = {
      name: '',
      type: 'text' as const,
      required: false,
      options: [] as string[],
      defaultValue: '',
      validation: 'none' as const,
    };

    form.setValue(fieldType, [...currentFields, newField]);

    // If this is a new template, create it first
    if (!template?._id) {
      try {
        const response = await fetch('/api/document-templates', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form.getValues(),
            [fieldType]: [...currentFields, newField],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create template');
        }

        const newTemplate = await response.json();
        router.push(`/document-templates/${newTemplate._id}/edit`);
      } catch (error) {
        console.error('Error creating template:', error);
        alert('Failed to create template');
      }
    }
  };

  const removeField = (fieldType: 'objectFields' | 'contactFields' | 'lineItemFields', index: number) => {
    const currentFields = form.getValues(fieldType);
    form.setValue(
      fieldType,
      currentFields.filter((_, i) => i !== index)
    );
  };

  async function onSubmit(values: FormValues) {
    try {
      const url = mode === 'create' 
        ? '/api/document-templates'
        : `/api/document-templates/${template?._id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Ensure all fields are properly formatted
      const submissionData = {
        ...values,
        objectFields: values.objectFields.map(field => ({
          ...field,
          type: field.type || 'string',
        })),
        contactFields: values.contactFields.map(field => ({
          ...field,
          type: field.type || 'string',
        })),
        lineItemFields: values.lineItemFields.map(field => ({
          ...field,
          type: field.type || 'string',
        })),
      };

      console.log('Form values before submission:', values);
      console.log('Submission data:', submissionData);

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Failed to ${mode} document template`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      router.push('/document-templates');
    } catch (error) {
      console.error(`Error ${mode}ing document template:`, error);
      alert(`Failed to ${mode} document template`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="connectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || 'none'}
                disabled={isLoadingConnections}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a connection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No connection</SelectItem>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        {/* Object Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Object Fields</h3>
            {form.watch('connectionId') !== 'none' && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).dataSource("object", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Select Object
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).fieldMapping("object", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Configure Field Mapping
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {form.watch('objectFields').map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`objectFields.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="Field name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField('objectFields', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('objectFields')}
            className="w-full max-w-[200px] mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Object Field
          </Button>
        </div>

        {/* Contact Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Contact Fields</h3>
          {form.watch('connectionId') !== 'none' && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).dataSource("contact", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Select Object
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).fieldMapping("contact", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Configure Field Mapping
                </Button>
              </div>
            )}</div>
          <div className="space-y-2">
            {form.watch('contactFields').map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`contactFields.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="Field name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField('contactFields', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('contactFields')}
            className="w-full max-w-[200px] mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact Field
          </Button>
        </div>

        {/* Line Item Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Line Item Fields</h3>
          {form.watch('connectionId') !== 'none' && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).dataSource("line-item", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Select Object
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => integrationAppClient.connection(form.watch('connectionId')!).fieldMapping("line-item", {
                    instanceKey: template?._id,
                  }).openConfiguration()}
                >
                  Configure Field Mapping
                </Button>
              </div>
            )}</div>
          <div className="space-y-2">
            {form.watch('lineItemFields').map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`lineItemFields.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input {...field} placeholder="Field name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField('lineItemFields', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('lineItemFields')}
            className="w-full max-w-[200px] mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item Field
          </Button>
        </div>

        <Button type="submit">
          {mode === 'create' ? 'Create Template' : 'Update Template'}
        </Button>
      </form>
    </Form>
  );
} 