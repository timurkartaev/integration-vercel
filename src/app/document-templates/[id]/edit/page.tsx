"use client";

import { DocumentTemplateForm } from '@/components/document-templates/document-template-form';
import { DocumentTemplate } from '@/types/document-template';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authenticatedFetcher } from '@/lib/fetch-utils';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDocumentTemplatePage({ params }: PageProps) {
  const { id } = use(params);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const data = await authenticatedFetcher<DocumentTemplate>(`/api/document-templates/${id}`);
        setTemplate(data);
      } catch (error) {
        console.error('Error loading template:', error);
        setError(error instanceof Error ? error.message : 'Failed to load template');
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplate();
  }, [id]);

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
          <h2 className="text-lg font-semibold mb-2">Error Loading Template</h2>
          <p className="mb-4">{error}</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/document-templates">Back to Templates</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/document-templates/new">Create New Template</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Template not found</div>
      </div>
    );
  }

  return <DocumentTemplateForm template={template} mode="edit" />;
} 