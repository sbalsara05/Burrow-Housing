import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchContractById, signContract } from '../../../redux/slices/contractSlice';
import SignaturePad from '../../common/SignaturePad';

const ContractViewer = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentContract, isLoading, error, successMessage } = useSelector((state: RootState) => state.contract);
    const { user } = useSelector((state: RootState) => state.auth);

    const [showSignatureModal, setShowSignatureModal] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchContractById(id));
        }
    }, [dispatch, id]);

    if (isLoading) return <div className="p-5 text-center">Loading Agreement...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!currentContract) return null;

    // 1. Inject Variables into HTML
    const filledHtml = currentContract.templateHtml.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return currentContract.variables[key] || `<span class="text-danger">[Missing: ${key}]</span>`;
    });

    // 2. Determine if User needs to sign
    const isTenant = currentContract.tenant._id === user?._id;
    const isLister = currentContract.lister._id === user?._id;

    const needsTenantSign = isTenant && currentContract.status === 'PENDING_TENANT_SIGNATURE';
    const needsListerSign = isLister && currentContract.status === 'PENDING_LISTER_SIGNATURE';
    const canSign = needsTenantSign || needsListerSign;

    const handleSignatureSave = (signatureData: string) => {
        if (id) {
            dispatch(signContract({ id, signatureData }));
            setShowSignatureModal(false);
        }
    };

    return (
        <div className="row">
            <div className="col-lg-10 m-auto">
                <div className="bg-white card-box border-20 p-5">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h2 className="dash-title-three">Sublease Agreement</h2>
                        <span className={`badge ${currentContract.status === 'COMPLETED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {currentContract.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {successMessage && <div className="alert alert-success">{successMessage}</div>}

                    {/* Document Body */}
                    <div
                        className="contract-content mb-5 p-4 border rounded"
                        style={{ backgroundColor: '#fdfdfd', minHeight: '400px' }}
                        dangerouslySetInnerHTML={{ __html: filledHtml }}
                    />

                    {/* Liability Waiver (Hardcoded) */}
                    <div className="alert alert-secondary fs-sm mb-5">
                        <strong>Liability Waiver:</strong> By signing this agreement, both parties acknowledge that
                        Burrow Housing is strictly a listing platform. Burrow Housing bears no responsibility for
                        property damage, rent disputes, or lease violations. This contract is solely between the
                        Landlord and the Tenant.
                    </div>

                    {/* Signatures Section */}
                    <div className="row mb-5">
                        <div className="col-md-6">
                            <p className="fw-bold">Tenant Signature:</p>
                            {currentContract.tenantSignature?.url ? (
                                <div className="border p-2 d-inline-block">
                                    <img src={currentContract.tenantSignature.url} alt="Tenant Signature" height="60" />
                                    <div className="text-muted fs-xs mt-1">
                                        Signed: {new Date(currentContract.updatedAt).toLocaleDateString()} {/* Fallback if signedAt not available */}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted fst-italic p-3 border border-dashed rounded bg-light">
                                    Waiting for signature...
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <p className="fw-bold">Landlord Signature:</p>
                            {currentContract.listerSignature?.url ? (
                                <div className="border p-2 d-inline-block">
                                    <img src={currentContract.listerSignature.url} alt="Landlord Signature" height="60" />
                                </div>
                            ) : (
                                <div className="text-muted fst-italic p-3 border border-dashed rounded bg-light">
                                    Waiting for signature...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end">
                        {canSign && !showSignatureModal && (
                            <button
                                className="btn-one"
                                onClick={() => setShowSignatureModal(true)}
                            >
                                Sign Agreement
                            </button>
                        )}
                    </div>

                    {/* Signature Modal Overlay */}
                    {showSignatureModal && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Sign Document</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowSignatureModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="small text-danger mb-3">
                                            By drawing your signature below, you agree to the terms listed in the contract
                                            and the Burrow Housing Liability Waiver.
                                        </p>
                                        <SignaturePad
                                            onSave={handleSignatureSave}
                                            onCancel={() => setShowSignatureModal(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ContractViewer;