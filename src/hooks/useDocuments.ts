import { useState, useCallback } from 'react';

export interface Document {
  id: string;
  title: string;
  file_path: string;
  status: string;
  summary: string;
  fileUrl?: string;
  mime_type?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_documents' })
      });
      const data = await res.json();
      if (data.ok && data.items) {
        // Map items and add a fileUrl and basic mime_type parsing based on extension
        const mapped = data.items.map((doc: any) => ({
          ...doc,
          // Assuming we create a local API route to stream the file if needed, 
          // or we can use the raw file path if Lemma exposes a public URL.
          // For the sake of the Viewer, we will create a proxy route /api/files?path=...
          fileUrl: `/api/files?path=${encodeURIComponent(doc.file_path)}`,
          mime_type: doc.file_path.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png'
        }));
        setDocuments(mapped);
      }
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string, file_path: string) => {
    // Optimistic UI update
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    try {
      await fetch('/api/lemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_document', id, file_path })
      });
    } catch (e) {
      console.error('Failed to delete document:', e);
      // Revert optimistic update on failure
      loadDocuments();
    }
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    loadDocuments,
    deleteDocument
  };
}
