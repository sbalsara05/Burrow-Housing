import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo'
import type { AppDispatch } from '../../../redux/slices/store'
import Fancybox from '../../../components/common/Fancybox'
import {
  fetchReceivedInterests,
  selectReceivedInterests,
  selectInterestsLoading,
} from '../../../redux/slices/interestsSlice'
import { selectIsAuthenticated } from '../../../redux/slices/authSlice'

interface AmbassadorRequest {
  _id: string
  propertyId: {
    _id: string
    overview?: { title: string }
    images?: string[]
  }
  requesterId: {
    _id: string
    name: string
    email: string
  }
  status: string
  preferredDates: string
  propertyTitle?: string
  inspectionPoints?: Array<{ text: string; details?: string }>
  contactInfo?: string
  createdAt: string
  review?: {
    text: string
    images: string[]
    submittedAt: string
  }
}

const RequestsBody = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const requests = useSelector(selectReceivedInterests) || []
  const isLoading = useSelector(selectInterestsLoading)
  const [ambassadorRequests, setAmbassadorRequests] = useState<AmbassadorRequest[]>([])
  const [loadingAmbassador, setLoadingAmbassador] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchReceivedInterests())
      fetchAmbassadorRequests()
    }
  }, [dispatch, isAuthenticated])

  const fetchAmbassadorRequests = async () => {
    try {
      setLoadingAmbassador(true)
      const response = await axios.get('/api/ambassador-requests/received')
      setAmbassadorRequests(response.data)
    } catch (error: any) {
      console.error('Error fetching ambassador requests:', error)
    } finally {
      setLoadingAmbassador(false)
    }
  }

  const handleUpdateAmbassadorStatus = async (requestId: string, status: 'approved' | 'declined') => {
    try {
      await axios.put(`/api/ambassador-requests/${requestId}/status`, { status })
      toast.success(`Request ${status} successfully.`)
      fetchAmbassadorRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update request')
    }
  }

  const handleDecline = async (id: string) => {
    try {
      await axios.put(`/api/interests/${id}/decline`)
      toast.success('Request declined successfully.')
      dispatch(fetchReceivedInterests()) // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to decline request')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await axios.put(`/api/interests/${id}/approve`)
      toast.success('Request approved! Chat channel created.')
      dispatch(fetchReceivedInterests()) // Refresh the list
      // Navigate to chat page
      navigate('/dashboard/chat')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request')
    }
  }
  const getStatusBadgeClass = (status?: string) =>
    status === 'approved' ? 'success' : 
    status === 'completed' ? 'success' : 
    status === 'pending' ? 'warning' : 'secondary'

  if (!isAuthenticated) {
    return <div className="dashboard-body text-center">Please log in to view received requests.</div>
  }

  if ((isLoading || loadingAmbassador) && requests.length === 0 && ambassadorRequests.length === 0) {
    return <div className="dashboard-body"><p>Loading received requests...</p></div>
  }

  const totalRequests = requests.length + ambassadorRequests.length
  const hasNoRequests = totalRequests === 0 && !isLoading && !loadingAmbassador

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Received Requests" />
        <h2 className="main-title d-block d-lg-none">Received Requests</h2>
        
        {hasNoRequests ? (
          <div className="bg-white card-box border-20 text-center p-5">
            <h4>No received requests yet.</h4>
            <p className="text-muted">You'll see requests here when users are interested in your properties.</p>
          </div>
        ) : (
          <>
            {/* Ambassador Requests Section */}
            {ambassadorRequests.length > 0 && (
              <div className="mb-5">
                <h4 className="dash-title-two mb-4">Ambassador Requests</h4>
                <div className="row g-4 justify-content-start">
                  {ambassadorRequests.map((req: AmbassadorRequest) => (
                    <div className="col-lg-4 col-md-6" key={req._id}>
                      <div className="bg-white card-box border-20 p-4 h-100 d-flex flex-column">
                        <div className="text-center mb-3">
                          <img
                            src={req.propertyId?.images?.[0] || "/assets/images/listing/img_placeholder.jpg"}
                            alt="property"
                            className="img-fluid rounded"
                            style={{ maxHeight: '180px', objectFit: 'cover', width: '100%' }}
                          />
                        </div>

                        <div className="text-center mb-3">
                          <h5 className="mb-1">{req.requesterId?.name || 'Requester'}</h5>
                          <p className="text-muted small mb-0">{req.requesterId?.email || ''}</p>
                        </div>

                        <div className="mb-3">
                          <p className="mb-1 small text-muted"><strong>Property:</strong></p>
                          <h6 className="color-dark mb-0">
                            <Link
                              to={`/listing_details/${req.propertyId?._id}`}
                              className="text-decoration-underline"
                            >
                              {req.propertyTitle || req.propertyId?.overview?.title || 'Property'}
                            </Link>
                          </h6>
                        </div>

                        <div className="mb-3">
                          <p className="mb-1 small text-muted"><strong>Preferred Dates:</strong></p>
                          <p className="mb-0">{req.preferredDates}</p>
                        </div>

                        {req.inspectionPoints && req.inspectionPoints.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-1 small text-muted"><strong>Inspection Points:</strong></p>
                            <ul className="small mb-0 ps-3">
                              {req.inspectionPoints.slice(0, 3).map((point, idx) => (
                                <li key={idx} className="mb-1">{point.text}</li>
                              ))}
                              {req.inspectionPoints.length > 3 && (
                                <li className="text-muted">+{req.inspectionPoints.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}

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
                          {req.status === 'pending' ? (
                            <div className="d-flex gap-2">
                              <button 
                                onClick={() => handleUpdateAmbassadorStatus(req._id, 'declined')} 
                                className="btn btn-outline-danger flex-fill"
                              >
                                Decline
                              </button>
                              <button 
                                onClick={() => handleUpdateAmbassadorStatus(req._id, 'approved')} 
                                className="btn btn-success flex-fill"
                              >
                                Approve
                              </button>
                            </div>
                          ) : (
                            <div className={`alert alert-${getStatusBadgeClass(req.status)} text-center mb-0`}>
                              Status: <span className="text-capitalize">{req.status || 'unknown'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interest Requests Section */}
            {requests.length > 0 && (
              <div>
                {ambassadorRequests.length > 0 && <h4 className="dash-title-two mb-4 mt-5">Interest Requests</h4>}
                {ambassadorRequests.length === 0 && <h4 className="dash-title-two mb-4">Interest Requests</h4>}
                <div className="row g-4 justify-content-start">
                  {requests.map((req: any) => (
                    <div className="col-lg-4 col-md-6" key={req._id}>
                      <div className="bg-white card-box border-20 p-4 h-100 d-flex flex-column">
                        <div className="text-center">
                          <img
                            src={req.renterId?.image || "/assets/images/dashboard/no-profile-pic.png"}
                            alt={req.renterId?.username || 'Renter'}
                            className="rounded-circle mx-auto d-block"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <h5 className="mt-3 mb-1">{req.renterId?.username || 'Renter Name'}</h5>
                          <p className="text-muted small">
                            {req.renterId?.school_attending || 'University not specified'}<br />
                            {req.renterId?.majors_minors || 'Major not specified'}
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="mb-1"><strong>Interested In:</strong></p>
                          <h6 className="color-dark">
                            <Link
                              to={`/listing_details_01/${req.propertyId?._id ?? ''}`}
                              className="text-decoration-underline"
                            >
                              {req.propertyId?.overview?.title || 'Property'}
                            </Link>
                          </h6>
                        </div>

                        <div className="mt-3">
                          <p className="mb-1"><strong>Move-in Date:</strong></p>
                          <h6 className="color-dark">
                            {req.moveInDate ? new Date(req.moveInDate).toLocaleDateString() : 'Not provided'}
                          </h6>
                        </div>

                        <div className="mt-auto pt-4">
                          {req.status === 'pending' ? (
                            <div className="d-flex gap-2">
                              <button onClick={() => handleDecline(req._id)} className="btn btn-outline-danger flex-fill">
                                Decline
                              </button>
                              <button onClick={() => handleApprove(req._id)} className="btn btn-success flex-fill">
                                Approve
                              </button>
                            </div>
                          ) : req.status === 'approved' ? (
                            <button 
                              onClick={() => {
                                const channelId = `interest-${req._id}`;
                                navigate(`/dashboard/chat?channel=${channelId}`);
                              }} 
                              className="btn btn-primary w-100"
                            >
                              Go to Chat
                            </button>
                          ) : (
                            <div className={`alert alert-${getStatusBadgeClass(req.status)} text-center`}>
                              Status: {req.status || 'unknown'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RequestsBody