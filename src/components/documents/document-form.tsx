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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Document } from '@/types/document';
import { DocumentTemplate } from '@/types/document-template';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { authenticatedFetcher } from '@/lib/fetch-utils';

const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  templateId: z.string().min(1, 'Template is required'),
  objectVariables: z.record(z.union([z.string(), z.number(), z.boolean()])),
  contactVariables: z.record(z.union([z.string(), z.number(), z.boolean()])),
  lineItemVariables: z.array(z.record(z.union([z.string(), z.number(), z.boolean()]))),
});

type FormValues = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  document?: Document;
  mode: 'create' | 'edit';
  onSubmit: (values: FormValues) => Promise<void>;
}

export function DocumentForm({ document, mode, onSubmit }: DocumentFormProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: document || {
      name: '',
      templateId: '',
      objectVariables: {},
      contactVariables: {},
      lineItemVariables: [],
    },
  });

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await authenticatedFetcher<DocumentTemplate[]>('/api/document-templates');
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
        setError('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const selectedTemplate = templates.find(t => t._id === form.watch('templateId'));

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
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
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id!}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTemplate && (
          <>
            {/* Object Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Object Fields</h3>
              {selectedTemplate.objectFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={`objectVariables.${field.name}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.name}</FormLabel>
                      <FormControl>
                        <Input
                          {...formField}
                          value={String(formField.value || '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Contact Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Fields</h3>
              {selectedTemplate.contactFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={`contactVariables.${field.name}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.name}</FormLabel>
                      <FormControl>
                        <Input
                          {...formField}
                          value={String(formField.value || '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Line Item Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              {form.watch('lineItemVariables').map((_, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Line Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentItems = form.getValues('lineItemVariables');
                        form.setValue(
                          'lineItemVariables',
                          currentItems.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  {selectedTemplate.lineItemFields.map((field) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={`lineItemVariables.${index}.${field.name}`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.name}</FormLabel>
                          <FormControl>
                            <Input
                              {...formField}
                              value={String(formField.value || '')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentItems = form.getValues('lineItemVariables');
                  form.setValue('lineItemVariables', [
                    ...currentItems,
                    {},
                  ]);
                }}
              >
                Add Line Item
              </Button>
            </div>
          </>
        )}

        <Button type="submit">
          {mode === 'create' ? 'Create Document' : 'Update Document'}
        </Button>
      </form>
    </Form>
  );
} 