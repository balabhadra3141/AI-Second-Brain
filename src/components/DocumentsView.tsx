'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import { useDocuments, Document } from '@/hooks/useDocuments';
import DocumentViewerModal from './DocumentViewerModal';

export default function DocumentsView() {
  const { documents, isLoading, loadDocuments, deleteDocument } = useDocuments();
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="flex-1 min-w-0 bg-surface-base h-full flex flex-col p-6 rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-bold text-foreground">Uploaded Documents</h2>
        <span className="text-[12px] font-semibold text-ink-muted bg-surface-raised px-3 py-1 rounded-full border border-border-subtle">
          {documents.length} Files
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 size={24} className="animate-spin text-ink-faint mb-3" />
          <p className="text-[13px] font-medium text-ink-muted">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center border border-border-subtle shadow-sm mb-4">
            <FileText size={24} className="text-ink-faint" />
          </div>
          <h3 className="text-[14px] font-semibold text-foreground mb-1">No documents yet</h3>
          <p className="text-[12.5px] text-ink-muted max-w-sm">
            Upload PDFs or images using the OCR scanner or command palette, and they will appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {documents.map((doc, idx) => {
              const isPdf = doc.mime_type === 'application/pdf';
              const isImage = doc.mime_type?.startsWith('image/');
              
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-surface-raised rounded-xl border border-border-subtle overflow-hidden hover:border-knowledge-accent/50 hover:shadow-md transition-all cursor-pointer flex flex-col"
                  onClick={() => setViewingDoc(doc)}
                >
                  <div className="h-28 bg-black/5 dark:bg-white/5 flex items-center justify-center relative overflow-hidden">
                    {isImage && doc.fileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="text-ink-faint group-hover:text-knowledge-accent transition-colors">
                        {isPdf ? <FileText size={32} /> : <File size={32} />}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
                        {doc.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this document? (Associated thoughts will not be deleted)')) {
                            deleteDocument(doc.id, doc.file_path);
                          }
                        }}
                        className="flex-shrink-0 text-ink-faint hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {doc.summary && (
                      <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-3 mt-auto">
                        {doc.summary}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      <DocumentViewerModal 
        isOpen={!!viewingDoc} 
        onClose={() => setViewingDoc(null)} 
        document={viewingDoc} 
      />
    </div>
  );
}
