import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PhotoUploaderProps {
    onFilesChange: (files: File[]) => void;
    currentFiles: File[]; // Newly added files waiting for upload
    existingImageUrls?: string[]; // URLs of images already uploaded
    onExistingUrlsChange?: (urls: string[]) => void; // Function to update the parent's list of existing URLs
    isEditMode?: boolean;
    disabled: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
    onFilesChange,
    currentFiles,
    existingImageUrls = [],
    onExistingUrlsChange,
    isEditMode = false,
    disabled
}) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (disabled) return;
        // Append new files to the existing list of new files
        const updatedFiles = [...currentFiles, ...acceptedFiles];
        onFilesChange(updatedFiles);
    }, [currentFiles, onFilesChange, disabled]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        disabled,
    });

    // Handler to remove a newly added file (before upload)
    const removeNewFile = (fileToRemove: File) => {
        const updatedFiles = currentFiles.filter(f => f !== fileToRemove);
        onFilesChange(updatedFiles);
    };

    // Handler to remove an existing image (by URL)
    const removeExistingImage = (urlToRemove: string) => {
        if (onExistingUrlsChange) {
            onExistingUrlsChange(existingImageUrls.filter(url => url !== urlToRemove));
        }
    };

    // Previews for existing images (in edit mode)
    const existingPreviews = existingImageUrls.map(url => (
        <div key={url} className="col-auto position-relative mt-2">
            <img src={url} alt="Existing" className="lazy-img" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
            {!disabled && (
                <button type="button" className="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-1" style={{ transform: 'translate(30%, -30%)', zIndex: 10 }} onClick={() => removeExistingImage(url)}></button>
            )}
        </div>
    ));

    // Previews for newly added files
    const newFilePreviews = currentFiles.map(file => (
        <div key={file.name} className="col-auto position-relative mt-2">
            <img src={URL.createObjectURL(file)} alt={file.name} className="lazy-img" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
            {!disabled && (
                <button type="button" className="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-1" style={{ transform: 'translate(30%, -30%)', zIndex: 10 }} onClick={() => removeNewFile(file)}></button>
            )}
        </div>
    ));

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Photo Attachment</h4>
            <div {...getRootProps({ className: `dash-input-wrapper mb-20 ${disabled ? 'disabled-dropzone' : ''}` })} style={{ border: `2px dashed ${isDragActive ? '#f16040' : '#ccc'}`, padding: '20px', textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'border-color 0.3s ease' }}>
                <input {...getInputProps()} />
                <p>{isDragActive ? "Drop the files here ..." : "Drag 'n' drop, or click to select files"}</p>
            </div>
            {/* Combine both existing and new previews */}
            <div className="row gx-2">
                {existingPreviews}
                {newFilePreviews}
            </div>
        </div>
    );
};

export default PhotoUploader;