import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/slices/store';
import { toast } from 'react-toastify';
import {
    fetchReceivedInterests,
    approveInterest,
    declineInterest,
    selectReceivedInterests,
    selectInterestsLoading,
    selectInterestsError,
    Interest
} from '../../../redux/slices/interestsSlice';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { Link, useNavigate } from 'react-router-dom';

const RequestsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const requests = useSelector(selectReceivedInterests);
    const isLoading = useSelector(selectInterestsLoading);
    const error = useSelector(selectInterestsError);

    useEffect(() => {
        dispatch(fetchReceivedInterests());
    }, [dispatch]);

    const handleApprove = async (id: string) => {
        try {
            await dispatch(approveInterest(id)).unwrap();
            toast.success("Request approved and chat created!");
        } catch (err) {
            toast.error(err as string);
        }
    };

    const handleDecline = async (id: string) => {
        try {
            await dispatch(declineInterest(id)).unwrap();
            toast.info("Request has been declined.");
        } catch (err) {
            toast.error(err as string);
        }
    };

    // Helper to get status color
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'declined': return 'bg-danger';
            case 'withdrawn': return 'bg-secondary';
            default: return 'bg-warning text-dark';
        }
    };

    if (isLoading && requests.length === 0) {
        return <div className="dashboard-body"><p>Loading requests...</p></div>;
    }

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Received Requests" />
                <h2 className="main-title d-block d-lg-none">Received Requests</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {requests.length === 0 && !isLoading && (
                    <div className="bg-white card-box border-20 text-center p-5">
                        <h4>No requests received yet.</h4>
                        <p>When a user is interested in one of your properties, their request will appear here.</p>
                    </div>
                )}

                {/* --- CARD LAYOUT --- */}
                <div className="row">
                    {requests.map((req: Interest) => (
                        <div key={req._id} className="col-lg-4 col-md-6 d-flex mb-4">
                            <div className="bg-white card-box border-20 p-4 h-100 w-100 d-flex flex-column">
                                <div className="text-center">
                                    <img
                                        src={req.renterId.image || "/assets/images/dashboard/no-profile-pic.png"}
                                        alt={req.renterId.username || 'Renter'}
                                        className="rounded-circle mx-auto d-block"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                    <h5 className="mt-3 mb-1">{req.renterId.username || 'Renter Name'}</h5>
                                    <p className="text-muted small">
                                        {req.renterId.school_attending || 'University not specified'}<br />
                                        {req.renterId.majors_minors || 'Major not specified'}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="mb-1"><strong>Interested In:</strong></p>
                                    <h6 className="color-dark">
                                        <Link to={`/listing_details_01/${req.propertyId._id}`} className="text-decoration-underline">
                                            {req.propertyId.overview.title}
                                        </Link>
                                    </h6>
                                </div>

                                <div className="mt-3">
                                    <p className="mb-1"><strong>Move-in Date:</strong></p>
                                    <h6 className="color-dark">{new Date(req.moveInDate).toLocaleDateString()}</h6>
                                </div>

                                <div className="mt-3">
                                    <p className="mb-1"><strong>Message:</strong></p>
                                    <blockquote className="fs-16 p-3 bg-light rounded text-muted">
                                        "{req.message}"
                                    </blockquote>
                                </div>

                                {/* --- History (Static as per design) --- */}
                                <div className="row mt-3 gx-2">
                                    <div className="col-6">
                                        <div className="bg-light p-2 rounded text-center">
                                            <div className="text-muted small">Move-in History</div>
                                            <div className="fw-500">No history</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light p-2 rounded text-center">
                                            <div className="text-muted small">Payment History</div>
                                            <div className="fw-500">No history</div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="mt-auto pt-4">
                                    {req.status === 'pending' ? (
                                        <div className="d-flex gap-2">
                                            <button onClick={() => handleDecline(req._id)} className="btn btn-outline-danger flex-fill" disabled={isLoading} style={{ backgroundColor: "#FF6725", border: "1px solid #FF3F25"}}>Decline</button>
                                            <button onClick={() => handleApprove(req._id)} className="btn btn-success flex-fill" disabled={isLoading} style={{ backgroundColor: "#FF6725", border: "1px solid #FF3F25"}}>Approve</button>
                                        </div>
                                    ) : req.status === 'approved' ? (
                                        <button onClick={() => navigate('/dashboard/chat')} className="btn btn-primary w-100" style={{ backgroundColor: "#FF6725", border: "1px solid #FF3F25"}}>Go to Chat</button>
                                    ) : (
                                        <div className={`alert alert-${getStatusBadgeClass(req.status)} text-center`}>
                                            Status: {req.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestsBody;