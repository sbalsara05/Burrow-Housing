import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchMyAgreements } from '../../../redux/slices/contractSlice';

const AgreementsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { contracts, isLoading, error } = useSelector((state: RootState) => state.contract);
    const { user } = useSelector((state: RootState) => state.auth);

    // State for simple tab switching
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        dispatch(fetchMyAgreements());
    }, [dispatch]);

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
        const isLister = contract.lister._id === user?._id;
        const isTenant = contract.tenant._id === user?._id;

        // 1. Draft Stage
        if (contract.status === 'DRAFT') {
            if (isLister) {
                return (
                    <Link to={`/dashboard/agreements/${contract._id}/edit`} className="btn-two text-uppercase btn-sm">
                        Edit Draft
                    </Link>
                );
            }
            return <span className="badge bg-secondary">Waiting for Landlord</span>;
        }

        // 2. Pending Tenant Signature
        if (contract.status === 'PENDING_TENANT_SIGNATURE') {
            if (isTenant) {
                return (
                    <Link to={`/dashboard/agreements/${contract._id}/sign`} className="btn-two text-uppercase btn-sm">
                        Review & Sign
                    </Link>
                );
            }
            return <span className="badge bg-warning text-dark">Waiting for Tenant</span>;
        }

        // 3. Pending Lister Signature
        if (contract.status === 'PENDING_LISTER_SIGNATURE') {
            if (isLister) {
                return (
                    <Link to={`/dashboard/agreements/${contract._id}/countersign`} className="btn-two text-uppercase btn-sm">
                        Countersign
                    </Link>
                );
            }
            return <span className="badge bg-info text-dark">Processing</span>;
        }

        // 4. Completed
        if (contract.status === 'COMPLETED') {
            return (
                <a href={contract.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="btn-one btn-sm">
                    Download PDF
                </a>
            );
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
                                                src={contract.property.images[0] || "/assets/images/dashboard/img_01.jpg"}
                                                alt="property"
                                                className="lazy-img rounded-circle me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <span>{contract.property.overview?.title || "Untitled Property"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {contract.lister._id === user?._id
                                            ? `Tenant: ${contract.tenant.name}`
                                            : `Landlord: ${contract.lister.name}`}
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