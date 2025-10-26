import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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

const MyRequestsBody = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const requests = useSelector(selectSentInterests);
    const isLoading = useSelector(selectInterestsLoading);
    const error = useSelector(selectInterestsError);

    useEffect(() => {
        dispatch(fetchSentInterests());
    }, [dispatch]);

    const handleWithdraw = async (id: string) => {
        if (!window.confirm("Are you sure you want to withdraw this request?")) return;
        try {
            await dispatch(withdrawInterest(id)).unwrap();
            toast.info("Request withdrawn.");
        } catch (err) {
            toast.error(err as string);
        }
    };

    if (isLoading && requests.length === 0) {
        return <div className="dashboard-body"><p>Loading your requests...</p></div>;
    }

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="My Sent Requests" />
                <h2 className="main-title d-block d-lg-none">My Sent Requests</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {requests.length === 0 && !isLoading && (
                    <div className="bg-white card-box border-20 text-center p-5">
                        <h4>You haven't sent any requests yet.</h4>
                        <p>Browse listings and click "I'm Interested" to get started.</p>
                        <Link to="/all_listings" className="btn-two">Find a Property</Link>
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