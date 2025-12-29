import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { selectIsAuthenticated } from '../../../redux/slices/authSlice';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import Fancybox from '../../../components/common/Fancybox';

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

const MyAmbassadorRequestsBody = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [ambassadorRequests, setAmbassadorRequests] = useState<AmbassadorRequest[]>([]);
    const [loadingAmbassador, setLoadingAmbassador] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAmbassadorRequests();
        }
    }, [isAuthenticated]);

    const fetchAmbassadorRequests = async () => {
        try {
            setLoadingAmbassador(true);
            const response = await axios.get('/api/ambassador-requests/sent');
            setAmbassadorRequests(response.data);
        } catch (error: any) {
            console.error('Error fetching ambassador requests:', error);
            toast.error('Failed to load ambassador requests');
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

    if (loadingAmbassador && ambassadorRequests.length === 0) {
        return <div className="dashboard-body"><p>Loading your ambassador requests...</p></div>;
    }

    const hasNoRequests = ambassadorRequests.length === 0 && !loadingAmbassador;

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="My Ambassador Requests" />
                <h2 className="main-title d-block d-lg-none">My Ambassador Requests</h2>

                {hasNoRequests && (
                    <div className="bg-white card-box border-20 text-center p-5">
                        <h4>You haven't sent any ambassador requests yet.</h4>
                        <p className="text-muted">Browse listings and click "Request Ambassador" to request an ambassador viewing for a property.</p>
                        <Link to="/all_listings" className="btn-two">Find a Property</Link>
                    </div>
                )}

                {ambassadorRequests.length > 0 && (
                    <div className="row g-4 justify-content-start">
                        {ambassadorRequests.map((req: AmbassadorRequest) => (
                            <div key={req._id} className="col-lg-4 col-md-6">
                                <div className="bg-white card-box border-20 p-4 h-100 d-flex flex-column">
                                    <div className="text-center mb-3">
                                        <img
                                            src={req.propertyId?.images?.[0] || '/assets/images/listing/img_placeholder.jpg'}
                                            alt="property"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '180px', objectFit: 'cover', width: '100%' }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <h5 className="mb-1">
                                            <Link to={`/listing_details/${req.propertyId?._id}`} className="text-decoration-underline">
                                                {req.propertyTitle || req.propertyId?.overview?.title || 'Property'}
                                            </Link>
                                        </h5>
                                        <p className="text-muted small mb-0">Lister: {req.listerId?.name || 'Unknown'}</p>
                                    </div>

                                    <div className="mb-3">
                                        <p className="mb-1 small text-muted"><strong>Status:</strong></p>
                                        <span className={`badge bg-${
                                            req.status === 'approved' ? 'success' :
                                            req.status === 'declined' ? 'danger' :
                                            req.status === 'cancelled' ? 'secondary' :
                                            req.status === 'completed' ? 'success' : 'warning'
                                        } text-capitalize`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <p className="mb-1 small text-muted"><strong>Preferred Dates:</strong></p>
                                        <p className="mb-0">{req.preferredDates}</p>
                                    </div>

                                    <div className="mb-3">
                                        <p className="mb-1 small text-muted"><strong>Sent on:</strong></p>
                                        <p className="mb-0">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    {/* Review Section */}
                                    {req.review && req.status === 'completed' && (
                                        <div className="mb-3 pb-3 border-bottom">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '16px', color: '#28a745' }}></i>
                                                <h6 className="mb-0 fw-semibold" style={{ color: '#333', fontSize: '0.95rem' }}>
                                                    Ambassador Review
                                                </h6>
                                            </div>
                                            <div className="rounded-3 p-3" style={{ 
                                                backgroundColor: '#fff5f0', 
                                                border: '1px solid #ffe5d9',
                                                boxShadow: '0 2px 6px rgba(255, 107, 53, 0.08)'
                                            }}>
                                                <p className="mb-2 small" style={{ 
                                                    whiteSpace: 'pre-wrap', 
                                                    color: '#333',
                                                    lineHeight: '1.5',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {req.review.text}
                                                </p>
                                                {req.review.images && req.review.images.length > 0 && (
                                                    <Fancybox
                                                        options={{
                                                            Carousel: {
                                                                infinite: true,
                                                            },
                                                        }}
                                                    >
                                                        <div className="row g-2 mt-2">
                                                            {req.review.images.map((imageUrl, idx) => (
                                                                <div key={idx} className="col-6">
                                                                    <a
                                                                        href={imageUrl}
                                                                        data-fancybox={`review-gallery-${req._id}`}
                                                                        data-caption={`Review image ${idx + 1}`}
                                                                        style={{ cursor: 'pointer', display: 'block' }}
                                                                    >
                                                                        <div className="rounded overflow-hidden" style={{
                                                                            aspectRatio: '1',
                                                                            overflow: 'hidden',
                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                            transition: 'transform 0.2s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                                                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                                        >
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
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Fancybox>
                                                )}
                                                <div className="d-flex align-items-center mt-2 pt-2 border-top" style={{ borderColor: '#ffe5d9' }}>
                                                    <i className="bi bi-clock me-1" style={{ color: '#666', fontSize: '0.75rem' }}></i>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {new Date(req.review.submittedAt).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-3">
                                        {req.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelAmbassadorRequest(req._id)}
                                                className="btn btn-outline-danger w-100"
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
            </div>
        </div>
    );
};

export default MyAmbassadorRequestsBody;

