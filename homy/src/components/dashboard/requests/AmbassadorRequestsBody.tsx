import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { selectIsAuthenticated } from '../../../redux/slices/authSlice';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import Fancybox from '../../../components/common/Fancybox';
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';

interface AmbassadorRequest {
  _id: string;
  propertyId?: {
    _id: string;
    overview?: {
      title?: string;
    };
    images?: string[];
  };
  requesterId?: {
    name?: string;
    email?: string;
  };
  propertyTitle?: string;
  preferredDates: string;
  inspectionPoints?: Array<{
    text: string;
    details?: string;
  }>;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled' | 'assigned';
  review?: {
    text: string;
    images: string[];
    submittedAt: string;
  };
}

const AmbassadorRequestsBody = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isCollapsed = useSidebarCollapse();
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
      const response = await axios.get('/api/ambassador-requests/received');
      // Only show requests that have been responded to (not pending)
      const responded = response.data.filter((req: AmbassadorRequest) => req.status !== 'pending');
      setAmbassadorRequests(responded);
    } catch (error: any) {
      console.error('Error fetching ambassador requests:', error);
      toast.error('Failed to load ambassador requests');
    } finally {
      setLoadingAmbassador(false);
    }
  };

  const handleUpdateAmbassadorStatus = async (requestId: string, status: 'approved' | 'declined') => {
    try {
      await axios.put(`/api/ambassador-requests/${requestId}/status`, { status });
      toast.success(`Request ${status} successfully.`);
      fetchAmbassadorRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'approved':
        return 'info';
      case 'declined':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  const hasNoRequests = ambassadorRequests.length === 0 && !loadingAmbassador;

  return (
    <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="position-relative">
        <DashboardHeaderTwo title="Ambassador Responses" />
        <h2 className="main-title d-block d-lg-none">Ambassador Responses</h2>
        
        {loadingAmbassador ? (
          <div className="bg-white card-box border-20 text-center p-5">
            <p>Loading ambassador requests...</p>
          </div>
        ) : hasNoRequests ? (
          <div className="bg-white card-box border-20 text-center p-5">
            <h4>No ambassador responses yet.</h4>
            <p className="text-muted">You'll see ambassador viewing requests here when users request an ambassador for your properties.</p>
          </div>
        ) : (
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
                          className="btn flex-fill"
                          style={{
                            border: '1px solid #dc3545',
                            color: '#dc3545',
                            backgroundColor: 'transparent',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc3545';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#dc3545';
                          }}
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleUpdateAmbassadorStatus(req._id, 'approved')} 
                          className="btn flex-fill"
                          style={{
                            border: '1px solid #198754',
                            color: '#fff',
                            backgroundColor: '#198754',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#157347';
                            e.currentTarget.style.borderColor = '#157347';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#198754';
                            e.currentTarget.style.borderColor = '#198754';
                          }}
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
        )}
      </div>
    </div>
  );
};

export default AmbassadorRequestsBody;

