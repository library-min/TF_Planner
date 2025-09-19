import React, { useState, useRef } from 'react';
import { Upload, X, Download, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FileAttachmentProps {
  files?: AttachedFile[];
  onFilesChange?: (files: AttachedFile[]) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  files = [],
  onFilesChange,
  maxFileSize = 10,
  maxFiles = 5,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip'],
  className = ''
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📁';
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !onFilesChange) return;

    const newFiles: AttachedFile[] = [];
    const uploading: string[] = [];

    Array.from(selectedFiles).forEach((file, index) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" exceeds maximum size (${maxFileSize}MB).`);
        return;
      }

      // Check max files limit
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const fileId = `file-${Date.now()}-${index}`;
      const newFile: AttachedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };

      newFiles.push(newFile);
      uploading.push(fileId);
    });

    setUploadingFiles(uploading);
    onFilesChange([...files, ...newFiles]);

    // Simulate upload delay
    setTimeout(() => {
      setUploadingFiles([]);
    }, 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (fileId: string) => {
    if (!onFilesChange) return;
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const handleDownloadFile = (file: AttachedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-600 mb-1">
          {t('fileAttachment.dragDrop')}
        </p>
        <p className="text-xs text-gray-500">
          {t('fileAttachment.maxSize')} {maxFileSize}MB, {maxFiles} {t('fileAttachment.maxFiles')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {t('fileAttachment.supportedFormats')}: {acceptedFileTypes.join(', ')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('fileAttachment.attachedFiles')} ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{getFileIcon(file.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {uploadingFiles.includes(file.id) && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600">{t('fileAttachment.uploading')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-3">
                  {file.type.startsWith('image/') && (
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title={t('fileAttachment.preview')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title={t('fileAttachment.download')}
                    disabled={uploadingFiles.includes(file.id)}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title={t('fileAttachment.remove')}
                    disabled={uploadingFiles.includes(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Statistics */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500 pt-2 border-t">
          {t('fileAttachment.totalFiles')} {files.length} {t('fileAttachment.totalSize')}, {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;