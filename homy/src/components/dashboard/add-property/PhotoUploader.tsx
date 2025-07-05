import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PhotoUploaderProps {
    onFilesChange: (files: File[]) => void;
    currentFiles: File[];
    disabled: boolean; 
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onFilesChange, currentFiles, disabled }) => {

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (disabled) return; // Prevent adding files when disabled
        const newFiles = [...currentFiles, ...acceptedFiles].slice(0, 10);
        onFilesChange(newFiles);
    }, [currentFiles, onFilesChange, disabled]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        maxSize: 5 * 1024 * 1024,
        disabled: disabled, // Pass disabled state to dropzone
    });

    const removeFile = (file: File) => (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dropzone from opening
        if (disabled) return;
        const newFiles = currentFiles.filter(f => f !== file);
        onFilesChange(newFiles);
    };

    const previews = currentFiles.map(file => (
        <div key={file.name} className="col-auto position-relative mt-2">
            <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="lazy-img"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                // Revoke object URL on unmount to prevent memory leaks
                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
            />
            {!disabled && (
                <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-1"
                    style={{ transform: 'translate(30%, -30%)', zIndex: 10 }}
                    aria-label="Remove file"
                    onClick={removeFile(file)}
                ></button>
            )}
        </div>
    ));

    return (
        <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Photo Attachment</h4>
            <div {...getRootProps({ className: `dash-input-wrapper mb-20 ${disabled ? 'disabled-dropzone' : ''}` })}
                style={{
                    border: `2px dashed ${isDragActive ? '#f16040' : '#ccc'}`,
                    padding: '20px',
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    transition: 'border-color 0.3s ease'
                }}>
                <input {...getInputProps()} />
                <p>{isDragActive ? "Drop the files here ..." : "Drag 'n' drop some files here, or click to select files"}</p>
                <em>(10 files are the maximum, 5MB per file)</em>
            </div>
            <div className="row gx-2">
                {previews}
            </div>
        </div>
    );
};

export default PhotoUploader;