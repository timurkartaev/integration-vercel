"use client";

import { DocumentForm } from '@/components/documents/document-form';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authenticatedFetcher } from '@/lib/fetch-utils';
import { use } from 'react';
import { getAuthHeaders } from '@/lib/fetch-utils';
import { useRouter } from 'next/navigation';
import { FormValues, documentSchema } from './schema';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDocumentPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDocument() {
      try {
        const data = await authenticatedFetcher<Document>(`/api/documents/${id}`);
        setDocument(data);
      } catch (error) {
        console.error('Error loading document:', error);
        setError(error instanceof Error ? error.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    }

    loadDocument();
  }, [id]);

  async function handleSubmit(values: FormValues) {
    try {
      // Validate the values against the schema
      const validatedValues = documentSchema.parse(values);

      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedValues),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update document');
      }

      router.push('/documents');
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document');
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Document</h2>
          <p className="mb-4">{error}</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/documents">Back to Documents</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Document not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Document</h1>
      <DocumentForm document={document} mode="edit" onSubmit={handleSubmit} />
    </div>
  );
} 