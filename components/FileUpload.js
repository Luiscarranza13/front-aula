'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video, Music, Archive, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadFile, uploadMultipleFiles, getUploadUrl } from '@/lib/api';

const fileIcons = {
  image: Image,
  pdf: FileText,
  document: FileText,
  video: Video,
  audio: Music,
  archive: Archive,
  default: File,
};

const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('document') || mimetype.includes('word') || mimetype.includes('excel') || mimetype.includes('powerpoint')) return 'document';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return 'archive';
  return 'default';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileUpload({
  onUploadComplete,
  multiple = false,
  accept = '*',
  maxSize = 50 * 1024 * 1024, // 50MB
  className = '',
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `El archivo ${file.name} excede el tamaño máximo de ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles) => {
    setError(null);
    const validFiles = [];
    
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        progress: 0,
      });
    }

    if (multiple) {
      setFiles((prev) => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  }, [multiple, maxSize]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [handleFiles]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const filesToUpload = files.filter((f) => f.status === 'pending');
      
      if (multiple && filesToUpload.length > 1) {
        const result = await uploadMultipleFiles(filesToUpload.map((f) => f.file));
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: 'completed',
            uploadedFile: result.files.find((uf) => uf.originalName === f.file.name),
          }))
        );
        if (onUploadComplete) {
          onUploadComplete(result.files);
        }
      } else {
        for (const fileItem of filesToUpload) {
          const result = await uploadFile(fileItem.file);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: 'completed', uploadedFile: result.file }
                : f
            )
          );
          if (onUploadComplete) {
            onUploadComplete([result.file]);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setFiles((prev) =>
        prev.map((f) => (f.status === 'pending' ? { ...f, status: 'error' } : f))
      );
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Upload className={`h-8 w-8 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-lg font-medium">
              {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              o{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                selecciona desde tu dispositivo
              </button>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Máximo {formatFileSize(maxSize)} por archivo
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => {
            const fileType = getFileType(fileItem.file.type);
            const Icon = fileIcons[fileType];

            return (
              <div
                key={fileItem.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${
                  fileItem.status === 'completed' ? 'bg-green-100 dark:bg-green-950' :
                  fileItem.status === 'error' ? 'bg-red-100 dark:bg-red-950' :
                  'bg-gray-200 dark:bg-gray-700'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    fileItem.status === 'completed' ? 'text-green-600' :
                    fileItem.status === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                    {fileItem.status === 'completed' && (
                      <span className="text-green-600 ml-2">✓ Subido</span>
                    )}
                  </p>
                </div>
                {fileItem.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeFile(fileItem.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={uploadFiles}
            disabled={uploading || files.every((f) => f.status === 'completed')}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir {files.filter((f) => f.status === 'pending').length} archivo(s)
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente simplificado para uso inline
export function SimpleFileInput({ onFileSelect, accept = '*', className = '' }) {
  const inputRef = useRef(null);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Seleccionar archivo
      </Button>
    </div>
  );
}
