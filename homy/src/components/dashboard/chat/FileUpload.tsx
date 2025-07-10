import React, { useRef, useState } from 'react';

interface FileUploadProps {
    onFileUpload: (file: File, type: 'image' | 'file') => void;
    onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file, type);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const isImage = file.type.startsWith('image/');
            onFileUpload(file, isImage ? 'image' : 'file');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const triggerImageInput = () => {
        imageInputRef.current?.click();
    };

    return (
        <div className="file-upload-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Share Files</h6>
                <button className="btn btn-link p-0" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            {/* Quick Actions */}
            <div className="row g-3 mb-3">
                <div className="col-6">
                    <button
                        className="btn btn-outline-primary w-100 d-flex flex-column align-items-center p-3"
                        onClick={triggerImageInput}
                    >
                        <i className="bi bi-image fs-3 mb-2"></i>
                        <span>Photos</span>
                    </button>
                </div>
                <div className="col-6">
                    <button
                        className="btn btn-outline-primary w-100 d-flex flex-column align-items-center p-3"
                        onClick={triggerFileInput}
                    >
                        <i className="bi bi-file-earmark fs-3 mb-2"></i>
                        <span>Documents</span>
                    </button>
                </div>
            </div>

            {/* Drag & Drop Area */}
            <div
                className={`drop-zone border-2 border-dashed rounded p-4 text-center ${dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <i className="bi bi-cloud-upload fs-2 text-muted mb-2 d-block"></i>
                <p className="mb-2">Drag & drop files here</p>
                <p className="text-muted small mb-0">or click to browse</p>
            </div>

            {/* File Size Limit */}
            <div className="text-center mt-2">
                <small className="text-muted">
                    Maximum file size: 10MB
                </small>
            </div>

            {/* Hidden File Inputs */}
            <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                onChange={(e) => handleFileSelect(e, 'file')}
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            />
            <input
                ref={imageInputRef}
                type="file"
                className="d-none"
                onChange={(e) => handleFileSelect(e, 'image')}
                accept="image/*"
            />

            {/* File Types Info */}
            <div className="mt-3">
                <small className="text-muted">
                    <strong>Supported formats:</strong>
                    <br />
                    Images: JPG, PNG, GIF, WebP
                    <br />
                    Documents: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP, RAR
                </small>
            </div>
        </div>
    );
};

export default FileUpload;