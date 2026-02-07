import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import { fetchMyAgreements, deleteContract, recallContract } from '../../../redux/slices/contractSlice';

// Format status for display: "PENDING_TENANT_SIGNATURE" → "Pending tenant signature"
const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Get the route for viewing/acting on a contract based on status
const getContractViewRoute = (contract: { status: string; _id: string }) => {
    if (contract.status === 'DRAFT') return `/dashboard/agreements/${contract._id}/edit`;
    return `/dashboard/agreements/${contract._id}/sign`;
};

const AgreementsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { contracts, isLoading, error } = useSelector((state: RootState) => state.contract);
    const { user } = useSelector((state: RootState) => state.auth);

    // State for simple tab switching
    const [activeTab, setActiveTab] = useState<'active' | 'payment_pending' | 'archive'>('active');
    const [recallingId, setRecallingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchMyAgreements());
    }, [dispatch]);

    const handleDelete = async (contractId: string) => {
        if (!window.confirm('Are you sure you want to cancel this agreement? This cannot be undone.')) {
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
    const tenantPaid = (c: any) => c.paymentStatus === 'SUCCEEDED' || c.stripePaymentStatus === 'succeeded';
    const listerPaid = (c: any) => c.listerPaymentStatus === 'SUCCEEDED' || c.listerStripePaymentStatus === 'succeeded';
    const bothPaid = (c: any) => tenantPaid(c) && listerPaid(c);

    const paymentPendingContracts = contracts.filter(c =>
        c.status === 'COMPLETED' && !bothPaid(c)
    );
    const archivedContracts = contracts.filter(c =>
        ['COMPLETED', 'CANCELLED'].includes(c.status) &&
        !(c.status === 'COMPLETED' && !bothPaid(c))
    );

    const displayedContracts =
        activeTab === 'active' ? activeContracts
            : activeTab === 'payment_pending' ? paymentPendingContracts
            : archivedContracts;

    // Helper for the primary action (Edit, Countersign, status badges, etc.)
    const getAction = (contract: any) => {
        const isLister = contract.lister?._id === user?._id;
        const isTenant = contract.tenant?._id === user?._id;

        if (contract.status === 'COMPLETED') {
            const tenantPaid = contract.paymentStatus === 'SUCCEEDED' || contract.stripePaymentStatus === 'succeeded';
            const listerPaid = contract.listerPaymentStatus === 'SUCCEEDED' || contract.listerStripePaymentStatus === 'succeeded';
            const needsToPay = (isTenant && !tenantPaid) || (isLister && !listerPaid);
            return (
                <div className="agreement-action-buttons">
                    <a href={contract.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-one btn-sm text-nowrap">
                        Download PDF
                    </a>
                    {(isTenant || isLister) && (
                        <Link to={`/dashboard/agreements/${contract._id}/sign`} className={`btn btn-sm text-nowrap ${needsToPay ? 'btn-one' : 'btn-two'}`}>
                            {needsToPay ? 'Pay now' : 'View agreement'}
                        </Link>
                    )}
                </div>
            );
        }

        if (isLister) {
            return (
                <>
                    {contract.status === 'DRAFT' && (
                        <Link to={`/dashboard/agreements/${contract._id}/edit`} className="btn-two btn-sm">
                            Edit
                        </Link>
                    )}
                    {contract.status === 'PENDING_LISTER_SIGNATURE' && (
                        <Link to={`/dashboard/agreements/${contract._id}/sign`} className="btn-two btn-sm">
                            Countersign
                        </Link>
                    )}
                    {contract.status === 'PENDING_TENANT_SIGNATURE' && (
                        <button
                            type="button"
                            className="btn-two btn-sm"
                            disabled={recallingId === contract._id}
                            onClick={async (e) => {
                                e.stopPropagation();
                                setRecallingId(contract._id);
                                try {
                                    await dispatch(recallContract(contract._id)).unwrap();
                                    toast.success('Contract recalled. You can now edit.');
                                    navigate(`/dashboard/agreements/${contract._id}/edit`);
                                } catch (err) {
                                    toast.error(typeof err === 'string' ? err : (err as { message?: string })?.message || 'Failed to recall');
                                } finally {
                                    setRecallingId(null);
                                }
                            }}
                        >
                            {recallingId === contract._id ? 'Recalling…' : 'Edit'}
                        </button>
                    )}
                </>
            );
        }

        if (isTenant) {
            if (contract.status === 'DRAFT') {
                return <span className="badge badge-neutral">Sublessor is drafting...</span>;
            }
            if (contract.status === 'PENDING_TENANT_SIGNATURE') {
                return (
                    <Link to={`/dashboard/agreements/${contract._id}/sign`} className="btn-two btn-sm">
                        Review & Sign
                    </Link>
                );
            }
            if (contract.status === 'PENDING_LISTER_SIGNATURE') {
                return <span className="badge badge-waiting">Waiting for Sublessor</span>;
            }
        }

        return null;
    };

    // Helper for Cancel/Delete button: lister can cancel any non-completed; tenant can decline when pending their signature
    const getCancelAction = (contract: any) => {
        const isLister = contract.lister?._id === user?._id;
        const isTenant = contract.tenant?._id === user?._id;
        if (contract.status === 'COMPLETED') return null;
        // Lister: can cancel DRAFT, PENDING_TENANT_SIGNATURE, PENDING_LISTER_SIGNATURE
        if (isLister) {
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(contract._id); }}
                    className="btn btn-sm btn-cancel"
                    title={contract.status === 'DRAFT' ? 'Delete draft' : 'Cancel agreement'}
                >
                    {contract.status === 'DRAFT' ? 'Delete' : 'Cancel'}
                </button>
            );
        }
        // Tenant: can decline when pending their signature
        if (isTenant && contract.status === 'PENDING_TENANT_SIGNATURE') {
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(contract._id); }}
                    className="btn btn-sm btn-cancel"
                    title="Decline agreement"
                >
                    Decline
                </button>
            );
        }
        return null;
    };

    if (isLoading) return <div className="p-5 text-center">Loading agreements...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="agreements-section">
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
                        className={`btn ${activeTab === 'payment_pending' ? 'text-decoration-underline fw-bold' : ''}`}
                        onClick={() => setActiveTab('payment_pending')}
                    >
                        Payment Pending ({paymentPendingContracts.length})
                    </button>
                    <button
                        className={`btn ${activeTab === 'archive' ? 'text-decoration-underline fw-bold' : ''}`}
                        onClick={() => setActiveTab('archive')}
                    >
                        Archive ({archivedContracts.length})
                    </button>
                </div>
            </div>

            {/* List Body - no scroll, table fits container */}
            <div className="p-4 overflow-visible">
                <table className="table table-borderless mb-0 agreements-table">
                    <colgroup>
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th scope="col">Property</th>
                            <th scope="col">Counterparty</th>
                            <th scope="col">Status</th>
                            <th scope="col">Last Update</th>
                            <th scope="col">Action</th>
                            <th scope="col">Cancel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedContracts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted">
                                    No {activeTab === 'active' ? 'active' : activeTab === 'payment_pending' ? 'payment pending' : 'archived'} agreements found.
                                </td>
                            </tr>
                        ) : (
                            displayedContracts.map((contract) => (
                                <tr
                                    key={contract._id}
                                    className="agreement-row"
                                    onClick={() => navigate(getContractViewRoute(contract))}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(getContractViewRoute(contract));
                                        }
                                    }}
                                >
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={contract.property?.images?.[0] || "/assets/images/icon_01.svg"}
                                                alt="property"
                                                className="lazy-img rounded-circle me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                            <span>
                                                {contract.property?.overview?.title ||
                                                    `${contract.property?.listingDetails?.bedrooms || ''} Bed ${contract.property?.overview?.category || 'Property'}`.trim()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {contract.lister._id === user?._id
                                            ? `Sublessee: ${contract.tenant?.name}`
                                            : `Sublessor: ${contract.lister?.name}`}
                                    </td>
                                    <td>
                                        <div className={`agreement-status-badge ${contract.status === 'COMPLETED' ? 'completed' : contract.status === 'CANCELLED' ? 'cancelled' : 'pending'}`}>
                                            {formatStatus(contract.status)}
                                        </div>
                                    </td>
                                    <td>{new Date(contract.updatedAt).toLocaleDateString()}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        {getAction(contract)}
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        {getCancelAction(contract)}
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