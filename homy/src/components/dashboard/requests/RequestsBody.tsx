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

const RequestsBody = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const requests = useSelector(selectReceivedInterests) || []
  const isLoading = useSelector(selectInterestsLoading)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchReceivedInterests())
    }
  }, [dispatch, isAuthenticated])

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

  if (isLoading && requests.length === 0) {
    return <div className="dashboard-body"><p>Loading received requests...</p></div>
  }

  const hasNoRequests = requests.length === 0 && !isLoading

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Received Requests" />
        <h2 className="main-title d-block d-lg-none">Received Requests</h2>
        
        {hasNoRequests ? (
          <div className="bg-white card-box border-20 text-center p-5">
            <h4>No received requests yet.</h4>
            <p className="text-muted">You'll see interest requests here when users are interested in your properties.</p>
          </div>
        ) : (
          <>
            {/* Interest Requests Section */}
            {requests.length > 0 && (
              <div>
                <h4 className="dash-title-two mb-4">Interest Requests</h4>
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