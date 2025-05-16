"use client";

import { DocumentForm } from '@/components/documents/document-form';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/fetch-utils';
import { z } from 'zod';

const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  templateId: z.string().min(1, 'Template is required'),
  variables: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

type FormValues = z.infer<typeof documentSchema>;

export default function NewDocumentPage() {
  const router = useRouter();

  async function handleSubmit(values: FormValues) {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create document');
      }

      router.push('/documents');
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Failed to create document');
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Document</h1>
      <DocumentForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
} 