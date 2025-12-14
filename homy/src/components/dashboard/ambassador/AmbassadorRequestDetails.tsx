import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';

interface InspectionPoint {
	text: string;
	details?: string;
}

interface RequestDetails {
	_id: string;
	propertyId: {
		_id: string;
		overview?: {
			title: string;
		};
		addressAndLocation?: {
			address: string;
		};
		images?: string[];
	};
	requesterId: {
		_id: string;
		name: string;
		email: string;
	};
	listerId: {
		_id: string;
		name: string;
	};
	inspectionPoints: InspectionPoint[];
	preferredDates: string;
	contactInfo: string;
	propertyTitle?: string;
	status: string;
	scheduledDate?: string;
	createdAt: string;
}

const AmbassadorRequestDetails: React.FC = () => {
	const { requestId } = useParams<{ requestId: string }>();
	const navigate = useNavigate();
	const [request, setRequest] = useState<RequestDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (requestId) {
			fetchRequestDetails();
		}
	}, [requestId]);

	const fetchRequestDetails = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`/api/ambassador/dashboard/request/${requestId}`);
			setRequest(response.data.request);
		} catch (err: any) {
			console.error('Error fetching request details:', err);
			setError(err.response?.data?.message || 'Failed to load request details');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="dashboard-body">
				<div className="position-relative">
					<DashboardHeaderTwo title="Request Details" />
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
						<div className="spinner-border" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !request) {
		return (
			<div className="dashboard-body">
				<div className="position-relative">
					<DashboardHeaderTwo title="Request Details" />
					<div className="bg-white card-box border-20 p-5 text-center">
						<p className="text-danger">{error || 'Request not found'}</p>
						<button onClick={() => navigate('/dashboard/ambassador')} className="btn btn-primary">
							Back to Dashboard
						</button>
					</div>
				</div>
			</div>
		);
	}

	const address = request.propertyId?.addressAndLocation?.address || 
		request.propertyTitle || 
		'Address not available';

	return (
		<div className="dashboard-body">
			<div className="position-relative">
				<DashboardHeaderTwo title="Inspection Details" />
				<h2 className="main-title d-block d-lg-none">Inspection Details</h2>

				<div className="bg-white border-20 mt-30">
					<div className="plr pt-30 pb-30">
						{/* Property Info */}
						<div className="mb-4">
							<h4 className="dash-title-two mb-3">Property Information</h4>
							<div className="row">
								{request.propertyId?.images?.[0] && (
									<div className="col-md-4 mb-3">
										<img
											src={request.propertyId.images[0]}
											alt="Property"
											className="img-fluid rounded"
											style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
										/>
									</div>
								)}
								<div className={request.propertyId?.images?.[0] ? "col-md-8" : "col-12"}>
									<p className="mb-2">
										<strong>Property:</strong>{' '}
										{request.propertyTitle || request.propertyId?.overview?.title || 'Property'}
									</p>
									<p className="mb-2">
										<strong>Address:</strong> {address}
									</p>
									<p className="mb-2">
										<strong>Requester:</strong> {request.requesterId?.name || 'Unknown'}
									</p>
									<p className="mb-2">
										<strong>Contact:</strong> {request.contactInfo}
									</p>
									<p className="mb-2">
										<strong>Preferred Dates:</strong> {request.preferredDates}
									</p>
									{request.scheduledDate && (
										<p className="mb-0">
											<strong>Scheduled Date:</strong>{' '}
											{new Date(request.scheduledDate).toLocaleString()}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Inspection Points */}
						<div className="mt-5">
							<h4 className="dash-title-two mb-3">Inspection Points</h4>
							{request.inspectionPoints && request.inspectionPoints.length > 0 ? (
								<div className="inspection-points-list">
									{request.inspectionPoints.map((point, index) => (
										<div key={index} className="bg-light border-20 p-4 mb-3">
											<div className="d-flex align-items-start">
												<div className="me-3">
													<div
														className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
														style={{ width: '30px', height: '30px', minWidth: '30px' }}
													>
														{index + 1}
													</div>
												</div>
												<div className="flex-grow-1">
													<h5 className="mb-2">{point.text}</h5>
													{point.details && (
														<p className="text-muted mb-0">{point.details}</p>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted">No inspection points specified.</p>
							)}
						</div>

						{/* Back Button */}
						<div className="mt-4">
							<button
								onClick={() => navigate('/dashboard/ambassador')}
								className="btn btn-outline-secondary"
							>
								Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AmbassadorRequestDetails;
