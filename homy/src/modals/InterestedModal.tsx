import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface InterestedModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyName: string;
    propertyId: string;
    onSubmit: (data: InterestedFormData) => void;
}

interface InterestedFormData {
    moveInDate: string;
    message: string;
}

const schema = yup.object().shape({
    moveInDate: yup.string().required('Move-in date is required'),
    message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters')
});

const InterestedModal: React.FC<InterestedModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             propertyName,
                                                             propertyId,
                                                             onSubmit
                                                         }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const displayName = propertyName && propertyName !== 'undefined' ? propertyName : 'this property';
    const defaultMessage = `Hello, I am interested in ${displayName}. I would like to know more about the rental terms and availability. Thank you!`;

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm<InterestedFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            moveInDate: "",
            message: defaultMessage
        }
    });

    const handleFormSubmit = async (data: InterestedFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting interest:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Send Request for this Property</h3>
                    <button
                        type="button"
                        className="close-button"
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="property-info">
                        <p className="property-subtitle">Let the subletter know you&apos;d like to learn more.</p>
                    </div>

                    <form onSubmit={handleSubmit(handleFormSubmit)} className="interest-form">
                        <div className="form-group">
                            <label htmlFor="moveInDate" className="form-label">
                                Desired Move-in Date <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                id="moveInDate"
                                {...register('moveInDate')}
                                className={`form-control ${errors.moveInDate ? 'is-invalid' : ''}`}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.moveInDate && (
                                <div className="invalid-feedback">
                                    {errors.moveInDate.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="form-label">
                                Message <span className="required">*</span>
                            </label>
                            <textarea
                                id="message"
                                {...register('message')}
                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                rows={4}
                                // placeholder={`Hello, I am interested in ${propertyName}. I would like to know more about the rental terms and availability. Thank you!`}
                            />
                            {errors.message && (
                                <div className="invalid-feedback">
                                    {errors.message.message}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"
                                              aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    animation: fadeIn 0.3s ease-out;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideIn 0.3s ease-out;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 1px solid #e9ecef;
                }

                .modal-title {
                    color: #2c3e50;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0;
                }

                .close-button {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: rgba(0, 0, 0, 0.42);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .close-button:hover {
                    background-color: #f8f9fa;
                    color: #495057;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .property-info {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }

                .property-subtitle {
                    color: #6c757d;
                    font-size: 1rem;
                    margin: 0;
                }

                .interest-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    color: #2c3e50;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }

                .required {
                    color: #dc3545;
                }

                .form-control {
                    padding: 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #FF6B47;
                    box-shadow: 0 0 0 0.2rem rgba(255, 107, 71, 0.25);
                }

                .form-control.is-invalid {
                    border-color: #dc3545;
                }

                .invalid-feedback {
                    display: block;
                    width: 100%;
                    margin-top: 0.25rem;
                    font-size: 0.875rem;
                    color: #dc3545;
                }

                textarea.form-control {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }

                .btn-secondary:hover:not(:disabled) {
                    background-color: #5a6268;
                }

                .btn-primary {
                    background-color: #FF6B47;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #e55a3c;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 576px) {
                    .modal-content {
                        width: 95%;
                        margin: 1rem;
                    }

                    .modal-header,
                    .modal-body {
                        padding: 1rem;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default InterestedModal;