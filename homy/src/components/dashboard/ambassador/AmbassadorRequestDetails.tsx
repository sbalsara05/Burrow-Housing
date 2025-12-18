import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuthToken, selectCurrentUser } from '../../../redux/slices/authSlice';
import { AppDispatch } from '../../../redux/slices/store';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { toast } from 'react-toastify';
import Fancybox from '../../../components/common/Fancybox';
import { getPresignedUrlsForUpload } from '../../../redux/slices/propertySlice';

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
	ambassadorId?: {
		_id: string;
		name: string;
	};
	review?: {
		text: string;
		images: string[];
		submittedAt: string;
	};
}

const AmbassadorRequestDetails: React.FC = () => {
	const { requestId } = useParams<{ requestId: string }>();
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const token = useSelector(selectAuthToken);
	const currentUser = useSelector(selectCurrentUser);
	const [request, setRequest] = useState<RequestDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Review submission state
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [reviewText, setReviewText] = useState('');
	const [reviewImages, setReviewImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);

	const handleSubmitReview = async () => {
		if (!reviewText.trim() || !token || !requestId) {
			toast.error('Please provide review text');
			return;
		}

		setIsSubmittingReview(true);

		try {
			// First, upload images if any
			let imageUrls: string[] = [];
			if (reviewImages.length > 0) {
				try {
					// Get presigned URLs for each image
					const fileInfo = reviewImages.map(file => ({
						filename: file.name,
						contentType: file.type
					}));

					const uploadTargets = await dispatch(getPresignedUrlsForUpload({ files: fileInfo })).unwrap();

					// Upload each image to S3
					await Promise.all(
						uploadTargets.map((target: { signedUrl: string, publicUrl: string }, index: number) =>
							fetch(target.signedUrl, {
								method: 'PUT',
								body: reviewImages[index],
								headers: {
									'Content-Type': reviewImages[index].type,
									'x-amz-acl': 'public-read',
								},
							})
						)
					);

					// Collect public URLs
					imageUrls = uploadTargets.map((target: { publicUrl: string }) => target.publicUrl);
				} catch (uploadError: any) {
					console.error('Error uploading images:', uploadError);
					toast.error(uploadError || 'Failed to upload images. Please try again.');
					setIsSubmittingReview(false);
					return;
				}
			}

			// Submit review
			await axios.put(
				`/api/ambassador-requests/${requestId}/review`,
				{
					text: reviewText.trim(),
					images: imageUrls,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			toast.success('Review submitted successfully!');
			
			// Refresh request details
			await fetchRequestDetails();
			
			// Reset form
			setShowReviewForm(false);
			setReviewText('');
			setReviewImages([]);
			setImagePreviews([]);
		} catch (err: any) {
			console.error('Error submitting review:', err);
			toast.error(err.response?.data?.message || 'Failed to submit review');
		} finally {
			setIsSubmittingReview(false);
		}
	};

	useEffect(() => {
		if (requestId) {
			fetchRequestDetails();
		}
	}, [requestId]);

	const fetchRequestDetails = async () => {
		try {
			setLoading(true);
			setError(null);
			console.log('Fetching request details for:', requestId);
			const response = await axios.get(`/api/ambassador/dashboard/request/${requestId}`);
			console.log('Request details response:', response.data);
			if (response.data.request) {
				setRequest(response.data.request);
			} else {
				setError('Request data not found in response');
			}
		} catch (err: any) {
			console.error('Error fetching request details:', err);
			console.error('Error response:', err.response?.data);
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

	// Determine if review form should be shown
	const ambassadorId = typeof request.ambassadorId === 'object' 
		? request.ambassadorId?._id 
		: request.ambassadorId;
	const currentUserId = currentUser?._id;
	
	const isAssignedAmbassador = ambassadorId && currentUserId && 
		ambassadorId.toString() === currentUserId.toString();
	
	// Check if review is actually submitted (has text and submittedAt)
	const hasSubmittedReview = request.review && 
		request.review.text && 
		request.review.text.trim() && 
		request.review.submittedAt;
	
	const canSubmitReview = !hasSubmittedReview && isAssignedAmbassador && 
		(request.status === 'assigned' || request.status === 'approved');

	// Debug logging
	if (request) {
		console.log('Review form check:', {
			ambassadorId,
			currentUserId,
			status: request.status,
			hasReview: !!request.review,
			hasSubmittedReview,
			reviewText: request.review?.text,
			reviewSubmittedAt: request.review?.submittedAt,
			canSubmitReview
		});
	}

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
										<div key={index} className="border-20 p-4 mb-3" style={{ backgroundColor: '#fff5f0', borderColor: '#ff6b35' }}>
											<div className="d-flex align-items-start">
												<div className="me-3">
													<div
														className="rounded-circle text-white d-flex align-items-center justify-content-center fw-medium"
														style={{ 
															width: '30px', 
															height: '30px', 
															minWidth: '30px',
															backgroundColor: '#ff6b35',
															paddingTop: '2px'
														}}
													>
														{index + 1}
													</div>
												</div>
												<div className="flex-grow-1">
													<h5 className="mb-2" style={{ color: '#333' }}>{point.text}</h5>
													{point.details && (
														<p className="mb-0" style={{ color: '#666' }}>{point.details}</p>
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

						{/* Review Section */}
						{hasSubmittedReview ? (
							<div className="mt-5">
								<h4 className="dash-title-two mb-3">Review Submitted</h4>
								<div className="border-20 p-4" style={{ backgroundColor: '#fff5f0', borderColor: '#ff6b35' }}>
									<p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{request.review.text}</p>
									{request.review.images && request.review.images.length > 0 && (
										<Fancybox
											options={{
												Carousel: {
													infinite: true,
												},
											}}
										>
											<div className="row g-3 mb-3">
												{request.review.images.map((imageUrl, idx) => (
													<div key={idx} className="col-md-4">
														<a
															href={imageUrl}
															data-fancybox={`review-gallery-${request._id}`}
															data-caption={`Review image ${idx + 1}`}
															style={{ cursor: 'pointer', display: 'block' }}
														>
															<img
																src={imageUrl}
																alt={`Review image ${idx + 1}`}
																className="img-fluid rounded"
																style={{ 
																	maxHeight: '200px', 
																	objectFit: 'cover', 
																	width: '100%',
																	transition: 'transform 0.2s ease'
																}}
																onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
																onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
															/>
														</a>
													</div>
												))}
											</div>
										</Fancybox>
									)}
									<p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
										Submitted: {request.review.submittedAt ? (() => {
											const date = new Date(request.review.submittedAt);
											return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleString();
										})() : 'Date not available'}
									</p>
								</div>
							</div>
						) : canSubmitReview ? (
							<div className="mt-5">
								<h4 className="dash-title-two mb-3">Submit Review</h4>
								{!showReviewForm ? (
									<button
										onClick={() => setShowReviewForm(true)}
										className="btn-two"
										style={{ backgroundColor: '#ff6b35', border: 'none', color: 'white' }}
									>
										<span>Upload Review</span>
									</button>
								) : (
									<div className="border-20 p-4" style={{ backgroundColor: '#fff5f0', borderColor: '#ff6b35' }}>
										<div className="mb-3">
											<label className="form-label fw-medium">Review Text *</label>
											<textarea
												className="form-control"
												rows={6}
												value={reviewText}
												onChange={(e) => setReviewText(e.target.value)}
												placeholder="Describe your findings from the property inspection..."
												style={{ resize: 'vertical' }}
											/>
										</div>
										
										<div className="mb-3">
											<label className="form-label fw-medium">Upload Images (Optional)</label>
											<input
												type="file"
												className="form-control"
												accept="image/*"
												multiple
												onChange={(e) => {
													const files = Array.from(e.target.files || []);
													setReviewImages(files);
													// Create previews
													files.forEach((file) => {
														const reader = new FileReader();
														reader.onload = (e) => {
															setImagePreviews((prev) => [...prev, e.target?.result as string]);
														};
														reader.readAsDataURL(file);
													});
												}}
											/>
											{imagePreviews.length > 0 && (
												<div className="row g-2 mt-2">
													{imagePreviews.map((preview, idx) => (
														<div key={idx} className="col-md-3">
															<img
																src={preview}
																alt={`Preview ${idx + 1}`}
																className="img-fluid rounded"
																style={{ maxHeight: '100px', objectFit: 'cover', width: '100%' }}
															/>
														</div>
													))}
												</div>
											)}
										</div>
										
										<div className="d-flex gap-2">
											<button
												onClick={handleSubmitReview}
												className="btn-two"
												disabled={!reviewText.trim() || isSubmittingReview}
												style={{
													backgroundColor: (!reviewText.trim() || isSubmittingReview) ? '#d1d5db' : '#ff6b35',
													border: 'none',
													color: 'white',
													cursor: (!reviewText.trim() || isSubmittingReview) ? 'not-allowed' : 'pointer'
												}}
											>
												<span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
											</button>
											<button
												onClick={() => {
													setShowReviewForm(false);
													setReviewText('');
													setReviewImages([]);
													setImagePreviews([]);
												}}
												className="btn btn-outline-secondary"
											>
												Cancel
											</button>
										</div>
									</div>
								)}
							</div>
						) : null}

						{/* Back Button */}
						<div className="mt-4">
							<button
								onClick={() => navigate('/dashboard/ambassador')}
								className="btn-two"
								style={{ backgroundColor: '#ff6b35', border: 'none', color: 'white' }}
							>
								<span>Back to Dashboard</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AmbassadorRequestDetails;
