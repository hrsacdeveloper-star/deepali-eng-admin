import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, Upload, File as FileIcon, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfParser';

export default function ChatbotDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('chatbot_documents').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to fetch documents');
    else setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!fileInput) {
      toast.error('Please select a PDF file first');
      return;
    }
    
    if (fileInput.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }

    if (fileInput.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds 20MB limit');
      return;
    }

    setUploading(true);
    try {
      // 1. Extract text
      toast.info('Extracting text from PDF...');
      const extractedText = await extractTextFromPDF(fileInput);
      
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('No readable text found in the PDF. Scanned images are not supported.');
      }

      // 2. Upload PDF to Storage
      toast.info('Uploading file...');
      const fileExt = fileInput.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chatbot-docs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, fileInput);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      // 3. Save to DB
      toast.info('Saving to knowledge base...');
      // Split large text into smaller chunks to avoid too large rows and improve search accuracy
      // Simple chunking by double newlines or max length
      const chunks = extractedText.split('\n\n').filter(c => c.trim().length > 20);
      
      const insertData = chunks.map((chunk, i) => ({
        title: `${fileInput.name.replace('.pdf', '')} - Part ${i + 1}`,
        pdf_url: publicUrl,
        content: chunk.trim()
      }));

      // Insert in batches if too large
      for (let i = 0; i < insertData.length; i += 50) {
        const batch = insertData.slice(i, i + 50);
        const { error: dbError } = await supabase.from('chatbot_documents').insert(batch);
        if (dbError) throw dbError;
      }

      toast.success('Document processed and added successfully');
      setFileInput(null);
      // Reset file input element
      const inputEl = document.getElementById('pdf-upload') as HTMLInputElement;
      if (inputEl) inputEl.value = '';
      
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document text chunk?')) return;
    try {
      const { error } = await supabase.from('chatbot_documents').delete().eq('id', id);
      if (error) throw error;
      toast.success('Document text deleted');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">PDF Documents</h2>
          <p className="text-muted-foreground">Upload PDFs to train the Chatbot. Text is extracted automatically.</p>
        </div>
      </div>

      <div className="p-4 border rounded-md bg-card flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium mb-1 block">Select PDF File (Max 20MB)</label>
          <Input 
            id="pdf-upload"
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFileInput(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>
        <Button onClick={handleUpload} disabled={!fileInput || uploading} className="whitespace-nowrap">
          {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Upload className="w-4 h-4 mr-2" /> Upload & Extract</>}
        </Button>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date Added</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Extracted Text Content</TableHead>
              <TableHead className="whitespace-nowrap text-center">Source PDF</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : documents.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No documents found</TableCell></TableRow>
            ) : (
              documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="whitespace-nowrap">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={doc.title}>{doc.title}</TableCell>
                  <TableCell className="max-w-[400px] truncate" title={doc.content}>{doc.content}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" asChild title="View PDF">
                      <a href={doc.pdf_url} target="_blank" rel="noreferrer"><FileIcon className="w-4 h-4 text-blue-500" /></a>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
