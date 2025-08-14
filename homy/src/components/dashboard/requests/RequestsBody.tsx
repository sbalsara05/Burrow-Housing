import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '../../../redux/slices/store'
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

  if (!isAuthenticated) {
    return <div className="dashboard-body text-center">Please log in to view received requests.</div>
  }

  if (isLoading && requests.length === 0) {
    return <div className="dashboard-body"><p>Loading received requests...</p></div>
  }

  if (!isLoading && requests.length === 0) {
    return <div className="dashboard-body text-center text-muted">No received requests yet.</div>
  }

  const handleDecline = (id: string) => {}
  const handleApprove = (id: string) => {}
  const getStatusBadgeClass = (status?: string) =>
    status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'secondary'

  return (
    <div className="row">
      {requests.map((req: any) => (
        <div className="col-lg-4 col-md-6 d-flex mb-4" key={req._id}>
          <div className="bg-white card-box border-20 p-4 h-100 w-100 d-flex flex-column">
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
                <button onClick={() => navigate('/dashboard/chat')} className="btn btn-primary w-100">
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
  )
}

export default RequestsBody