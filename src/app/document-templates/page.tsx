"use client";

import { Button } from '@/components/ui/button';
import { DocumentTemplate } from '@/types/document-template';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/fetch-utils';
import useSWR from 'swr';
import { useConnections } from '@integration-app/react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Connection {
  id: string;
  name: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};

export default function DocumentTemplatesPage() {
  const router = useRouter();
  const { data: templates = [], error, isLoading, mutate } = useSWR<DocumentTemplate[]>('/api/document-templates', fetcher);
  const { items: connections } = useConnections();

  const connectionsById = connections.reduce((acc: Record<string, Connection>, connection) => {
    acc[connection.id] = connection;
    return acc;
  }, {});

  const handleNewTemplate = async () => {
    try {
      const response = await fetch('/api/document-templates', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Template',
          description: 'A template with default fields for objects, contacts, and line items',
          connectionId: '',
          objectFields: [
            {
              name: 'name',
              type: 'text' as const,
              required: true,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter name',
              description: 'The name of the object'
            },
            {
              name: 'description',
              type: 'textarea' as const,
              required: false,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter description',
              description: 'A detailed description of the object'
            },
            {
              name: 'amount',
              type: 'number' as const,
              required: true,
              options: [],
              defaultValue: '0',
              validation: 'number' as const,
              placeholder: 'Enter amount',
              description: 'The current status of the object'
            }
          ],
          contactFields: [
            {
              name: 'firstName',
              type: 'text' as const,
              required: true,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter first name',
              description: 'Contact\'s first name'
            },
            {
              name: 'lastName',
              type: 'text' as const,
              required: true,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter last name',
              description: 'Contact\'s last name'
            },
            {
              name: 'email',
              type: 'text' as const,
              required: true,
              options: [],
              defaultValue: '',
              validation: 'email' as const,
              placeholder: 'Enter email address',
              description: 'Contact\'s email address'
            },
            {
              name: 'phone',
              type: 'text' as const,
              required: false,
              options: [],
              defaultValue: '',
              validation: 'phone' as const,
              placeholder: 'Enter phone number',
              description: 'Contact\'s phone number'
            }
          ],
          lineItemFields: [
            {
              name: 'itemName',
              type: 'text' as const,
              required: true,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter item name',
              description: 'Name of the line item'
            },
            {
              name: 'quantity',
              type: 'number' as const,
              required: true,
              options: [],
              defaultValue: '1',
              validation: 'number' as const,
              placeholder: 'Enter quantity',
              description: 'Quantity of the item'
            },
            {
              name: 'unitPrice',
              type: 'number' as const,
              required: true,
              options: [],
              defaultValue: '0',
              validation: 'number' as const,
              placeholder: 'Enter unit price',
              description: 'Price per unit'
            },
            {
              name: 'description',
              type: 'textarea' as const,
              required: false,
              options: [],
              defaultValue: '',
              validation: 'none' as const,
              placeholder: 'Enter item description',
              description: 'Description of the line item'
            }
          ],
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
  };

  const handleDeleteTemplate = async (templateId: string | undefined) => {
    if (!templateId) return;
    
    try {
      const response = await fetch(`/api/document-templates/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Refresh the templates list
      mutate();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  if (error) return <div>Failed to load templates</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Document Templates</h1>
        <Button onClick={handleNewTemplate}>
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No templates found. Create your first template to get started.
        </div>
      ) : (
        <div className="grid gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="border rounded-lg p-6 hover:border-primary"
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/document-templates/${template._id}/edit`)}
                >
                  <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
                  <p className="text-muted-foreground mb-4">{template.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      {template.objectFields?.length || 0} Object Fields
                    </span>
                    <span>
                      {template.contactFields?.length || 0} Contact Fields
                    </span>
                    <span>
                      {template.lineItemFields?.length || 0} Line Item Fields
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {template.connectionId && connectionsById[template.connectionId] && (
                    <div className="text-sm text-muted-foreground">
                      Connected to: {connectionsById[template.connectionId].name}
                    </div>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 