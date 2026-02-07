import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo'
import type { AppDispatch } from '../../../redux/slices/store'
import Fancybox from '../../../components/common/Fancybox'
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse'

import {
    fetchReceivedInterests,
    selectReceivedInterests,
    selectInterestsLoading,
} from '../../../redux/slices/interestsSlice'
import { selectIsAuthenticated } from '../../../redux/slices/authSlice'
import { createDraft } from '../../../redux/slices/contractSlice'

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
    const isCollapsed = useSidebarCollapse()

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
            dispatch(fetchReceivedInterests())
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to decline request')
        }
    }

    const handleApprove = async (id: string) => {
        try {
            const response = await axios.put(`/api/interests/${id}/approve`)
            toast.success('Request approved! Chat channel created.')
            dispatch(fetchReceivedInterests())
            navigate('/dashboard/chat')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve request')
        }
    }

    /**
     * Dispatches action to create a new contract draft and redirects to the editor.
     * Triggered when the user clicks "Draft Contract".
     * If an active contract already exists: open the draft if still DRAFT, otherwise show one toast and go to My Agreements.
     */
    const handleDraftContract = async (propertyId: string, tenantId: string) => {
        try {
            const result = await dispatch(createDraft({ propertyId, tenantId })).unwrap()
            const contract = (result as any).contract ?? result
            const contractId = contract._id
            if (!contractId) {
                toast.error("Failed to open contract")
                return
            }
            if (contract.status !== 'DRAFT') {
                toast.info('This agreement is already sent. You can view it in My Agreements.')
                navigate('/dashboard/my-agreements')
                return
            }
            navigate(`/dashboard/agreements/${contractId}/edit`)
        } catch (error) {
            console.error("Draft creation error:", error)
            toast.error(typeof error === 'string' ? error : (error as { message?: string })?.message || "Failed to initialize contract")
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
        <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
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
                        {/* Ambassador Requests - Coming Soon */}
                        <div className="mb-5">
                            <h4 className="dash-title-two mb-4">Ambassador Requests</h4>
                            <div className="bg-white card-box border-20 p-4 text-center">
                                <p className="text-muted mb-0">Coming soon! We&apos;re working on it. Check back later.</p>
                            </div>
                        </div>

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
                                                            to={`/listing_details/${req.propertyId?._id ?? ''}`}
                                                            className="text-decoration-underline"
                                                        >
                                                            {req.propertyId?.overview?.title ||
                                                                (req.propertyId?.overview?.category && req.propertyId?.overview?.neighborhood
                                                                    ? `${req.propertyId.overview.category} in ${req.propertyId.overview.neighborhood}`
                                                                    : 'View property')}
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
                                                            <button 
                                                                onClick={() => handleDecline(req._id)} 
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
                                                                onClick={() => handleApprove(req._id)} 
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
                                                    ) : req.status === 'approved' ? (
                                                        <div className="d-flex flex-column gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const channelId = `interest-${req._id}`;
                                                                    navigate(`/dashboard/chat?channel=${channelId}`);
                                                                }}
                                                                className="btn-two w-100"
                                                                style={{ 
                                                                    textAlign: 'center',
                                                                    display: 'block',
                                                                    padding: '12px 20px'
                                                                }}
                                                            >
                                                                Go to Chat
                                                            </button>

                                                            <button
                                                                onClick={() => handleDraftContract(req.propertyId?._id, req.renterId?._id)}
                                                                className="btn w-100"
                                                                style={{ 
                                                                    backgroundColor: '#1a1a1a', 
                                                                    borderColor: '#1a1a1a',
                                                                    color: '#fff',
                                                                    borderRadius: '8px',
                                                                    padding: '12px 20px',
                                                                    fontWeight: 500,
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#333';
                                                                    e.currentTarget.style.borderColor = '#333';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                                                                    e.currentTarget.style.borderColor = '#1a1a1a';
                                                                }}
                                                            >
                                                                Draft Contract
                                                            </button>
                                                        </div>
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