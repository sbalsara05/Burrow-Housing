import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchMyAgreements, deleteContract } from '../../../redux/slices/contractSlice';

const AgreementsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { contracts, isLoading, error } = useSelector((state: RootState) => state.contract);
    const { user } = useSelector((state: RootState) => state.auth);

    // State for simple tab switching
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        dispatch(fetchMyAgreements());
    }, [dispatch]);

    const handleDelete = async (contractId: string) => {
        if (!window.confirm('Are you sure you want to delete this contract? This cannot be undone.')) {
            return;
        }

        try {
            await dispatch(deleteContract(contractId)).unwrap();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // Filter logic
    const activeContracts = contracts.filter(c =>
        ['DRAFT', 'PENDING_TENANT_SIGNATURE', 'PENDING_LISTER_SIGNATURE'].includes(c.status)
    );
    const completedContracts = contracts.filter(c =>
        ['COMPLETED', 'CANCELLED'].includes(c.status)
    );

    const displayedContracts = activeTab === 'active' ? activeContracts : completedContracts;

    // Helper to determine the Action Button text/link
    const getAction = (contract: any) => {
        const isLister = contract.lister?._id === user?._id;
        const isTenant = contract.tenant?._id === user?._id;

        // Completed contracts - Download PDF only
        if (contract.status === 'COMPLETED') {
            return (
                <a href={contract.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="btn-one btn-sm">
                    Download PDF
                </a>
            );
        }

        // Lister actions
        if (isLister) {
            return (
                <div className="d-flex gap-2">
                    {/* Edit button - only for DRAFT */}
                    {contract.status === 'DRAFT' && (
                        <Link to={`/dashboard/agreements/${contract._id}/edit`} className="btn-two text-uppercase btn-sm">
                            Edit
                        </Link>
                    )}

                    {/* Countersign button - only for PENDING_LISTER_SIGNATURE */}
                    {contract.status === 'PENDING_LISTER_SIGNATURE' && (
                        <Link to={`/dashboard/agreements/${contract._id}/sign`} className="btn-two text-uppercase btn-sm">
                            Countersign
                        </Link>
                    )}

                    {/* Status badges for pending states */}
                    {contract.status === 'PENDING_TENANT_SIGNATURE' && (
                        <span className="badge bg-warning text-dark me-2">Waiting for Tenant</span>
                    )}

                    {/* Delete/Cancel button - always available for lister (except COMPLETED) */}
                    <button
                        onClick={() => handleDelete(contract._id)}
                        className="btn btn-sm btn-outline-danger"
                        title={contract.status === 'DRAFT' ? 'Delete draft' : 'Cancel and recall contract'}
                    >
                        {contract.status === 'DRAFT' ? 'Delete' : 'Cancel'}
                    </button>
                </div>
            );
        }

        // Tenant actions
        if (isTenant) {
            if (contract.status === 'DRAFT') {
                return <span className="badge bg-secondary">Landlord is drafting...</span>;
            }

            if (contract.status === 'PENDING_TENANT_SIGNATURE') {
                return (
                    <Link to={`/dashboard/agreements/${contract._id}/sign`} className="btn-two text-uppercase btn-sm">
                        Review & Sign
                    </Link>
                );
            }

            if (contract.status === 'PENDING_LISTER_SIGNATURE') {
                return <span className="badge bg-info text-dark">Waiting for Landlord</span>;
            }
        }

        return null;
    };

    if (isLoading) return <div className="p-5 text-center">Loading agreements...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="bg-white card-box p-0 border-20">
            {/* Header / Tabs */}
            <div className="d-flex justify-content-between align-items-center pt-4 pb-2 px-4 border-bottom">
                <h4 className="dash-title-three">Agreements</h4>
                <div className="d-flex gap-3">
                    <button
                        className={`btn ${activeTab === 'active' ? 'text-decoration-underline fw-bold' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active ({activeContracts.length})
                    </button>
                    <button
                        className={`btn ${activeTab === 'completed' ? 'text-decoration-underline fw-bold' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Archive ({completedContracts.length})
                    </button>
                </div>
            </div>

            {/* List Body */}
            <div className="table-responsive p-4">
                <table className="table table-borderless mb-0">
                    <thead>
                        <tr className="style-one">
                            <th scope="col">Property</th>
                            <th scope="col">Counterparty</th>
                            <th scope="col">Status</th>
                            <th scope="col">Last Update</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedContracts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-5 text-muted">
                                    No {activeTab} agreements found.
                                </td>
                            </tr>
                        ) : (
                            displayedContracts.map((contract) => (
                                <tr key={contract._id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={contract.property.images[0] || "/assets/images/icon_01.svg"}
                                                alt="property"
                                                className="lazy-img rounded-circle me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <span>{contract.property.overview?.title || "Untitled Property"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {contract.lister._id === user?._id
                                            ? `Tenant: ${contract.tenant?.name}`
                                            : `Landlord: ${contract.lister?.name}`}
                                    </td>
                                    <td>
                                        <div className={`property-status-badge ${contract.status === 'COMPLETED' ? 'active' : 'pending'
                                            }`}>
                                            {contract.status.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td>{new Date(contract.updatedAt).toLocaleDateString()}</td>
                                    <td>
                                        {getAction(contract)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgreementsBody;