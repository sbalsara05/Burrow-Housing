import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';

import {
    fetchSentInterests,
    withdrawInterest,
    selectSentInterests,
    selectInterestsLoading,
    selectInterestsError,
    type Interest,
} from '../../../redux/slices/interestsSlice';
import type { AppDispatch } from '../../../redux/store';

const MyRequestsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const isCollapsed = useSidebarCollapse();
    const requests = useSelector(selectSentInterests);
    const isLoading = useSelector(selectInterestsLoading);
    const error = useSelector(selectInterestsError);

    useEffect(() => {
        dispatch(fetchSentInterests());
    }, [dispatch]);

    const handleWithdraw = async (id: string) => {
        if (!window.confirm('Are you sure you want to withdraw this request?')) return;
        try {
            await dispatch(withdrawInterest(id)).unwrap();
            toast.info('Request withdrawn.');
        } catch (err) {
            toast.error(err as string);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'approved': return 'my-requests-card__status--approved';
            case 'pending': return 'my-requests-card__status--pending';
            case 'declined': return 'my-requests-card__status--declined';
            case 'withdrawn': return 'my-requests-card__status--withdrawn';
            default: return 'my-requests-card__status--withdrawn';
        }
    };

    if (isLoading && requests.length === 0) {
        return (
            <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <DashboardHeaderTwo title="My Requests" />
                <div className="my-requests-section">
                    <div className="my-requests-empty">
                        <p className="text-muted mb-0">Loading your requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasNoRequests = requests.length === 0 && !isLoading;

    return (
        <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="position-relative">
                <DashboardHeaderTwo title="My Requests" />
                <h2 className="main-title d-block d-lg-none">My Requests</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="my-requests-section">
                    {hasNoRequests && (
                        <div className="my-requests-empty">
                            <h4>You haven&apos;t sent any requests yet.</h4>
                            <p className="text-muted mb-0">
                                Browse listings and click &quot;Send Request&quot; to request a property you&apos;re interested in.
                            </p>
                            <Link to="/all_listings" className="btn-two mt-3">
                                Find a Property
                            </Link>
                        </div>
                    )}

                    {requests.length > 0 && (
                        <div className="mt-2">
                            {requests.map((req: Interest) => (
                                <div key={req._id} className="my-requests-card">
                                    <img
                                        src={req.propertyId?.images?.[0] || '/assets/images/listing/img_placeholder.jpg'}
                                        alt={req.propertyId?.overview?.title || 'Property'}
                                        className="my-requests-card__img"
                                    />
                                    <div className="my-requests-card__body">
                                        <h5 className="my-requests-card__title">
                                            <Link to={`/listing_details/${req.propertyId?._id}`}>
                                                {req.propertyId?.overview?.title || 'Property'}
                                            </Link>
                                        </h5>
                                        <p className="my-requests-card__meta mb-0">
                                            Sent {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                        <span className={`my-requests-card__status ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="my-requests-card__actions">
                                        {req.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => handleWithdraw(req._id)}
                                                className="my-requests-card__btn my-requests-card__btn--outline-danger"
                                                disabled={isLoading}
                                            >
                                                Withdraw Request
                                            </button>
                                        )}
                                        {req.status === 'approved' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/dashboard/chat')}
                                                    className="my-requests-card__btn my-requests-card__btn--primary"
                                                >
                                                    Go to Chat
                                                </button>
                                                <p className="my-requests-card__hint mb-0">
                                                    After you chat, your subletter may send an agreement for you to sign.
                                                    You&apos;ll get a notification when that happens.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRequestsBody;
