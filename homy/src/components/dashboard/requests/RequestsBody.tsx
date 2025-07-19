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

                <div className="row">
                    {requests.map((req: Interest) => (
                        <div key={req._id} className="col-12 mb-4">
                            <div className="bg-white card-box border-20 p-4">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h5>Request for: <Link to={`/listing_details_01/${req.propertyId._id}`} className="text-decoration-underline">{req.propertyId.overview.title}</Link></h5>
                                        <p><strong>From:</strong> {req.renterId.username || 'A User'}</p>
                                        <p><strong>Move-in Date:</strong> {new Date(req.moveInDate).toLocaleDateString()}</p>
                                        <blockquote className="fs-18 fst-italic">"{req.message}"</blockquote>
                                    </div>
                                    <div className="col-md-4 d-flex flex-column align-items-md-end justify-content-between">
                                        <span className={`fw-500 text-capitalize badge bg-${req.status === 'approved' ? 'success' :
                                                req.status === 'declined' ? 'danger' :
                                                    req.status === 'withdrawn' ? 'secondary' : 'warning'
                                            }`}>{req.status}</span>

                                        {req.status === 'pending' && (
                                            <div className="d-flex gap-2 mt-3">
                                                <button onClick={() => handleDecline(req._id)} className="btn btn-outline-danger" disabled={isLoading}>Decline</button>
                                                <button onClick={() => handleApprove(req._id)} className="btn btn-success" disabled={isLoading}>Approve</button>
                                            </div>
                                        )}
                                        {req.status === 'approved' && (
                                            <button onClick={() => navigate('/dashboard/chat')} className="btn btn-primary mt-3">Go to Chat</button>
                                        )}
                                    </div>
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