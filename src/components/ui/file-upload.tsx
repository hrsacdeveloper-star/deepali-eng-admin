import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  bucket?: string;
  folder?: string;
}

export function FileUpload({ 
  value, 
  onChange, 
  accept = 'image/*', 
  maxSizeMB = 1,
  bucket = 'uploads',
  folder = 'media'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isImage = accept.includes('image');

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1080;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const tryCompress = (quality: number) => {
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas to Blob failed'));
            if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.1) {
              const fileName = file.name.replace(/\.[^/.]+$/, "") + '.webp';
              resolve(new File([blob], fileName, { type: 'image/webp' }));
            } else {
              tryCompress(quality - 0.1);
            }
          }, 'image/webp', quality);
        };
        
        tryCompress(0.8);
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = URL.createObjectURL(file);
    });
  };

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    let file = e.target.files[0];
    const originalSize = file.size;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    try {
      setUploading(true);
      setProgress(10);

      // Auto-compress image if it exceeds size
      if (isImage && file.size > maxSizeBytes && file.type.startsWith('image/')) {
        toast.info('File too large, compressing...');
        file = await compressImage(file);
        setProgress(30);
        toast.success(`Compressed from ${(originalSize/1024/1024).toFixed(2)}MB to ${(file.size/1024/1024).toFixed(2)}MB`);
      } else if (file.size > maxSizeBytes) {
        toast.error(`File must be smaller than ${maxSizeMB}MB`);
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const safeName = sanitizeFileName(file.name.replace(`.${fileExt}`, ''));
      const fileName = `${folder}/${Date.now()}_${safeName}.${fileExt}`;

      setProgress(50);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false });

      if (error) throw error;
      
      setProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Upload successful');
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = '';
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept={accept}
          className="hidden"
          ref={inputRef}
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center">Uploading... {progress}%</span>
          ) : (
            <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload File</span>
          )}
        </Button>
        {value && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onChange('')}
            className="text-destructive hover:text-destructive/90"
          >
            <X className="h-4 w-4" /> Remove
          </Button>
        )}
      </div>

      {uploading && <Progress value={progress} className="h-2 w-full" />}

      {value && (
        <div className="mt-2 rounded-md border p-2 w-max max-w-full">
          {isImage && (value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.webp') || value.endsWith('.gif')) ? (
            <div className="relative aspect-video w-48 overflow-hidden rounded-sm border bg-muted">
              <img src={value} alt="Preview" className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <a href={value} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[200px]">
                {value.split('/').pop()}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
