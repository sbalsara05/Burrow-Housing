import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="container">
                        <div className="remove-account-popup text-center modal-content">
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" disabled={isLoading}></button>
                            <img src="/assets/images/dashboard/icon/icon_22.svg" alt="Warning" className="lazy-img m-auto" />
                            <h2>{title}</h2>
                            <p>{message}</p>
                            <div className="button-group d-inline-flex justify-content-center align-items-center pt-15">
                                <button
                                    className="confirm-btn fw-500 tran3s me-3"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    style={{ padding: '0 20px', whiteSpace: 'nowrap', width: 'auto' }} 
                                >
                                    {isLoading ? 'Deleting...' : 'Yes, Confirm'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-close fw-500 ms-3"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    aria-label="Close"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* The backdrop is now a sibling to the modal container, not a child */}
            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default DeleteConfirmationModal;