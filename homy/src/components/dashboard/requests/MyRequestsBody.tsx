import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { Link, useNavigate } from 'react-router-dom';

// Try importing without AppDispatch first to isolate the issue
import {
    fetchSentInterests,
    withdrawInterest,
    selectSentInterests,
    selectInterestsLoading,
    selectInterestsError,
    type Interest
} from '../../../redux/slices/interestsSlice';

// Import types separately
import type { AppDispatch } from '../../../redux/store'; // Changed path

interface AmbassadorRequest {
    _id: string;
    propertyId: {
        _id: string;
        overview?: { title: string };
        images?: string[];
        addressAndLocation?: { address: string };
    };
    listerId: {
        _id: string;
        name: string;
    };
    status: string;
    preferredDates: string;
    propertyTitle?: string;
    createdAt: string;
    review?: {
        text: string;
        images: string[];
        submittedAt: string;
    };
}

const MyRequestsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const requests = useSelector(selectSentInterests);
    const isLoading = useSelector(selectInterestsLoading);
    const error = useSelector(selectInterestsError);
    const [ambassadorRequests, setAmbassadorRequests] = useState<AmbassadorRequest[]>([]);
    const [loadingAmbassador, setLoadingAmbassador] = useState(true);

    useEffect(() => {
        dispatch(fetchSentInterests());
        fetchAmbassadorRequests();
    }, [dispatch]);

    const fetchAmbassadorRequests = async () => {
        try {
            setLoadingAmbassador(true);
            const response = await axios.get('/api/ambassador-requests/sent');
            setAmbassadorRequests(response.data);
        } catch (error: any) {
            console.error('Error fetching ambassador requests:', error);
        } finally {
            setLoadingAmbassador(false);
        }
    };

    const handleCancelAmbassadorRequest = async (requestId: string) => {
        if (!window.confirm("Are you sure you want to cancel this ambassador request?")) return;
        try {
            await axios.delete(`/api/ambassador-requests/${requestId}`);
            toast.info("Ambassador request cancelled.");
            fetchAmbassadorRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel request');
        }
    };

    const handleWithdraw = async (id: string) => {
        if (!window.confirm("Are you sure you want to withdraw this request?")) return;
        try {
            await dispatch(withdrawInterest(id)).unwrap();
            toast.info("Request withdrawn.");
        } catch (err) {
            toast.error(err as string);
        }
    };

    if (isLoading && requests.length === 0 && loadingAmbassador) {
        return <div className="dashboard-body"><p>Loading your requests...</p></div>;
    }

    const totalRequests = requests.length + ambassadorRequests.length;
    const hasNoRequests = totalRequests === 0 && !isLoading && !loadingAmbassador;

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="My Sent Requests" />
                <h2 className="main-title d-block d-lg-none">My Sent Requests</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {hasNoRequests && (
                    <div className="bg-white card-box border-20 text-center p-5">
                        <h4>You haven't sent any requests yet.</h4>
                        <p>Browse listings and click "I'm Interested" or "Request Ambassador" to get started.</p>
                        <Link to="/all_listings" className="btn-two">Find a Property</Link>
                    </div>
                )}

                {/* Ambassador Requests Section */}
                {ambassadorRequests.length > 0 && (
                    <div className="mb-4">
                        <h4 className="mb-3">Ambassador Requests</h4>
                        {ambassadorRequests.map((req: AmbassadorRequest) => (
                            <div key={req._id} className="bg-white card-box border-20 p-4 mb-4">
                                <div className="row">
                                    <div className="col-md-2">
                                        <img
                                            src={req.propertyId?.images?.[0] || '/assets/images/listing/img_placeholder.jpg'}
                                            alt="property"
                                            className="img-fluid rounded"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <h5>
                                            Ambassador Request for:
                                            <Link to={`/listing_details/${req.propertyId?._id}`} className="text-decoration-underline">
                                                {req.propertyTitle || req.propertyId?.overview?.title || 'Property'}
                                            </Link>
                                        </h5>
                                        <p>
                                            <strong>Status:</strong>
                                            <span className={`fw-500 text-capitalize text-${
                                                req.status === 'approved' ? 'success' :
                                                req.status === 'declined' ? 'danger' :
                                                req.status === 'cancelled' ? 'secondary' :
                                                req.status === 'completed' ? 'success' : 'warning'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </p>
                                        <p className="mb-1">
                                            <strong>Preferred Dates:</strong> {req.preferredDates}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Sent on:</strong> {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                        
                                        {/* Review Section */}
                                        {req.review && req.status === 'completed' && (
                                            <div className="mt-4 pt-4 border-top">
                                                <div className="d-flex align-items-center mb-3">
                                                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '18px', color: '#28a745' }}></i>
                                                    <h6 className="mb-0 fw-semibold" style={{ color: '#333', fontSize: '1rem' }}>
                                                        Ambassador Review
                                                    </h6>
                                                </div>
                                                <div className="rounded-3 p-4" style={{ 
                                                    backgroundColor: '#fff5f0', 
                                                    border: '1px solid #ffe5d9',
                                                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.08)'
                                                }}>
                                                    <p className="mb-3" style={{ 
                                                        whiteSpace: 'pre-wrap', 
                                                        color: '#333',
                                                        lineHeight: '1.6',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        {req.review.text}
                                                    </p>
                                                    {req.review.images && req.review.images.length > 0 && (
                                                        <div className="row g-3 mt-3">
                                                            {req.review.images.map((imageUrl, idx) => (
                                                                <div key={idx} className="col-md-4">
                                                                    <div className="rounded overflow-hidden" style={{
                                                                        aspectRatio: '1',
                                                                        overflow: 'hidden',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                    }}>
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={`Review image ${idx + 1}`}
                                                                            className="img-fluid"
                                                                            style={{ 
                                                                                objectFit: 'cover', 
                                                                                width: '100%',
                                                                                height: '100%'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="d-flex align-items-center mt-3 pt-3 border-top" style={{ borderColor: '#ffe5d9' }}>
                                                        <i className="bi bi-clock me-2" style={{ color: '#666', fontSize: '0.85rem' }}></i>
                                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            Submitted {new Date(req.review.submittedAt).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-4 d-flex align-items-center justify-content-md-end">
                                        {req.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelAmbassadorRequest(req._id)}
                                                className="btn btn-outline-danger"
                                                disabled={loadingAmbassador}
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Interest Requests Section */}
                {requests.length > 0 && (
                    <div>
                        <h4 className="mb-3">Interest Requests</h4>
                    </div>
                )}

                {requests.map((req: Interest) => (
                    <div key={req._id} className="bg-white card-box border-20 p-4 mb-4">
                        <div className="row">
                            <div className="col-md-2">
                                <img
                                    src={req.propertyId?.images?.[0] || '/assets/images/listing/img_placeholder.jpg'}
                                    alt="property"
                                    className="img-fluid rounded"
                                />
                            </div>
                            <div className="col-md-6">
                                <h5>
                                    Request for:
                                    <Link to={`/listing_details/${req.propertyId?._id}`} className="text-decoration-underline">
                                        {req.propertyId?.overview?.title || 'Property'}
                                    </Link>
                                </h5>
                                <p>
                                    <strong>Status:</strong>
                                    <span className={`fw-500 text-capitalize text-${
                                        req.status === 'approved' ? 'success' :
                                        req.status === 'declined' ? 'danger' :
                                        req.status === 'withdrawn' ? 'secondary' : 'warning'
                                    }`}>
                                        {req.status}
                                    </span>
                                </p>
                                <p className="mb-0">
                                    <strong>Sent on:</strong> {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="col-md-4 d-flex align-items-center justify-content-md-end">
                                {req.status === 'pending' && (
                                    <button
                                        onClick={() => handleWithdraw(req._id)}
                                        className="btn btn-outline-danger"
                                        disabled={isLoading}
                                    >
                                        Withdraw Request
                                    </button>
                                )}
                                {req.status === 'approved' && (
                                    <button
                                        onClick={() => navigate('/dashboard/chat')}
                                        className="btn btn-primary"
                                    >
                                        Go to Chat
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyRequestsBody;