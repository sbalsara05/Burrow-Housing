import React, { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import {BadgeCheck, X, Plus} from 'lucide-react';
import {Profile} from '../../../redux/slices/profileSlice';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../../../redux/slices/authSlice';

// --- Ambassador Modal Component ---
interface InspectionPoint {
  id: string;
  text: string;
}

interface AmbassadorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  propertyId?: string;
}

const AmbassadorRequestModal: React.FC<AmbassadorRequestModalProps> = ({
  isOpen,
  onClose,
  propertyTitle = "this property",
  propertyId
}) => {
  const [step, setStep] = useState(1);
  const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>([]);
  const [newPoint, setNewPoint] = useState('');
  const [showNewPointInput, setShowNewPointInput] = useState(false);
  const [preferredDates, setPreferredDates] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState<Record<string, string>>({});
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useSelector(selectAuthToken);

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      const newInspectionPoint = {
        id: Date.now().toString(),
        text: newPoint
      };
      setInspectionPoints([...inspectionPoints, newInspectionPoint]);
      setNewPoint('');
      setShowNewPointInput(false);
    }
  };

  const handleRemovePoint = (id: string) => {
    setInspectionPoints(inspectionPoints.filter(point => point.id !== id));
    const newDetails = { ...additionalDetails };
    delete newDetails[id];
    setAdditionalDetails(newDetails);
  };

  const handleNext = () => {
    if (step === 1) {
      if (inspectionPoints.length === 0) {
        alert('Please add at least one inspection point before continuing.');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!propertyId) {
      alert('Property ID is missing. Please try again.');
      return;
    }

    if (!token) {
      alert('You must be logged in to request an ambassador.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        propertyId,
        propertyTitle,
        inspectionPoints: inspectionPoints.map(point => ({
          text: point.text,
          details: additionalDetails[point.id] || ''
        })),
        preferredDates: preferredDates.trim()
      };

      const response = await axios.post('/api/ambassador-requests', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Ambassador request submitted successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error submitting ambassador request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit ambassador request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPreferredDates('');
    setContactInfo('');
    setAdditionalDetails({});
    setSelectedPoint(null);
    onClose();
  };

  const handleCarrotClick = (pointId: string) => {
    setSelectedPoint(selectedPoint === pointId ? null : pointId);
  };

  const handleDetailsChange = (pointId: string, value: string) => {
    setAdditionalDetails({
      ...additionalDetails,
      [pointId]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-z-[9999]">
      <div className="tw-bg-white tw-rounded-lg tw-max-w-4xl tw-w-full tw-max-h-[90vh] tw-overflow-y-auto">
        {/* Step 1: Inspection Points */}
        {step === 1 && (
          <div className="tw-p-8">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
              <h2 className="tw-text-2xl tw-font-semibold tw-m-0">Request Ambassador Viewing</h2>
              <button
                onClick={handleClose}
                className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-gray-500 tw-p-0 hover:tw-text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <p className="tw-text-gray-700 tw-mb-6">
              What would you like the ambassador to check during their visit?
            </p>

            <div className="tw-mb-6">
              {inspectionPoints.length === 0 && !showNewPointInput && (
                <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-4 tw-mb-4" style={{ backgroundColor: '#fff5f0', borderColor: '#ff6b35' }}>
                  <p className="tw-mb-2 tw-font-medium" style={{ color: '#ff6b35' }}>
                    Add inspection points to help the ambassador know what to check
                  </p>
                  <p className="tw-text-sm" style={{ color: '#d14030' }}>
                    Click "Add Point" below to specify what you'd like inspected (e.g., room condition, amenities, damage, etc.)
                  </p>
                </div>
              )}
              
              <div className="tw-flex tw-flex-col tw-gap-3">
                {!showNewPointInput && (
                  <button
                    onClick={() => setShowNewPointInput(true)}
                    className="tw-flex tw-items-center tw-gap-2 tw-text-[#f16040] tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-sm tw-font-medium tw-mb-4 tw-p-0 hover:tw-text-[#d14030]"
                  >
                    <Plus size={16} />
                    Add Point
                  </button>
                )}

                {showNewPointInput && (
                  <div className="tw-flex tw-gap-2 tw-mb-4">
                    <input
                      type="text"
                      value={newPoint}
                      onChange={(e) => setNewPoint(e.target.value)}
                      placeholder="Add inspection point..."
                      className="tw-flex-1 tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded focus:tw-outline-none focus:tw-border-[#f16040]"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPoint()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddPoint}
                      className="tw-px-4 tw-py-2 tw-bg-[#f16040] tw-text-white tw-border-none tw-rounded tw-cursor-pointer hover:tw-bg-[#d14030]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPointInput(false);
                        setNewPoint('');
                      }}
                      className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded tw-bg-white tw-cursor-pointer hover:tw-bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {inspectionPoints.map((point) => (
                  <div key={point.id} className="tw-border-b tw-border-gray-200 tw-pb-3">
                    <div className="tw-flex tw-justify-between tw-items-center">
                      <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1">
                        <button
                          onClick={() => handleCarrotClick(point.id)}
                          className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-[#f16040] tw-p-0 hover:tw-text-[#d14030]"
                          aria-label="Toggle details"
                        >
                          <svg
                            className={`tw-w-4 tw-h-4 tw-transition-transform ${selectedPoint === point.id ? 'tw-rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <span className="tw-text-gray-800">{point.text}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePoint(point.id)}
                        className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-gray-400 tw-p-0 hover:tw-text-red-500"
                        aria-label="Remove point"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {selectedPoint === point.id && (
                      <div className="tw-mt-3 tw-ml-6">
                        <textarea
                          value={additionalDetails[point.id] || ''}
                          onChange={(e) => handleDetailsChange(point.id, e.target.value)}
                          placeholder="Add additional details about this inspection point..."
                          className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded focus:tw-outline-none focus:tw-border-[#f16040] tw-min-h-[120px] tw-resize-none tw-font-sans"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="tw-flex tw-justify-between tw-pt-6">
              <button
                onClick={handleClose}
                className="tw-px-8 tw-py-3 tw-border tw-border-gray-300 tw-rounded tw-bg-white tw-cursor-pointer tw-font-medium hover:tw-bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="tw-px-8 tw-py-3 tw-bg-[#f16040] tw-text-white tw-border-none tw-rounded tw-cursor-pointer tw-font-medium hover:tw-bg-[#d14030]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dates and Contact */}
        {step === 2 && (
          <div className="tw-p-8">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
              <h2 className="tw-text-2xl tw-font-normal tw-m-0">Request Ambassador Viewing</h2>
              <button
                onClick={handleClose}
                className="tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-gray-500 tw-p-0 hover:tw-text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="tw-flex tw-flex-col tw-gap-6">
              <div>
                <label className="tw-block tw-text-gray-700 tw-mb-2 tw-font-medium">
                  Preferred Viewing Dates
                </label>
                <input
                  type="text"
                  value={preferredDates}
                  onChange={(e) => setPreferredDates(e.target.value)}
                  placeholder="e.g. May 21-25"
                  className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded focus:tw-outline-none focus:tw-border-[#f16040]"
                />
              </div>

            </div>

            <div className="tw-flex tw-justify-between tw-pt-8">
              <button
                onClick={handleBack}
                className="tw-px-8 tw-py-3 tw-border tw-border-gray-300 tw-rounded tw-bg-white tw-cursor-pointer tw-font-medium hover:tw-bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="tw-px-8 tw-py-3 tw-text-white tw-border-none tw-rounded tw-font-medium disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                style={{
                  backgroundColor: (!preferredDates || isSubmitting) ? '#d1d5db' : '#f16040',
                  cursor: (!preferredDates || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
                disabled={!preferredDates || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Define Props ---
interface SidebarInfoProps {
    profile: Profile | null;
    isLoading: boolean;
    onInterestedClick: () => void;
    interestStatus: string | null;
    isStatusLoading: boolean;
    isOwner: boolean;
    propertyId?: string;
    propertyTitle?: string;
}

// --- Skeleton Loader Component ---
const SkeletonLoader = () => {
    return (
        <div className="agent-info bg-white border-20 p-30 mb-40 placeholder-glow">
            <div className="d-flex justify-content-center mb-3">
                <div className="placeholder rounded-circle" style={{width: '100px', height: '100px'}}></div>
            </div>
            <div className="text-center">
                <h6 className="placeholder col-6"></h6>
                <p className="placeholder col-8"></p>
            </div>
            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    <li><span className="placeholder col-10"></span></li>
                    <li><span className="placeholder col-8"></span></li>
                </ul>
            </div>
            <div className="d-flex justify-content-center gap-2">
                <div className="btn placeholder flex-fill" style={{height: '50px'}}></div>
                <div className="btn placeholder flex-fill" style={{height: '50px'}}></div>
                <div className="btn placeholder flex-fill" style={{height: '50px'}}></div>
            </div>
        </div>
    );
};

const SidebarInfo: React.FC<SidebarInfoProps> = ({
                                                     profile,
                                                     isLoading,
                                                     onInterestedClick,
                                                     interestStatus,
                                                     isStatusLoading,
                                                     isOwner,
                                                     propertyId,
                                                     propertyTitle
                                                 }) => {
    const navigate = useNavigate();
    const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);

    // --- RENDER LOGIC FOR THE MAIN ACTION BUTTON ---
    const renderActionButton = () => {
        if (isOwner) {
            return (
                <button
                    onClick={() => navigate('/dashboard/properties-list')}
                    className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                    style={{backgroundColor: '#2C3E50'}}
                >
                    Manage Property
                </button>
            );
        }

        if (isStatusLoading) {
            return <button className="btn flex-fill" disabled>Checking Status...</button>;
        }

        switch (interestStatus) {
            case 'pending':
                return <button className="btn flex-fill" disabled>Request Pending</button>;
            case 'approved':
                return <button onClick={() => navigate('/dashboard/chat')}
                               className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                               style={{backgroundColor: '#27ae60'}}>Go to Chat</button>;
            case 'declined':
                return <button className="btn flex-fill" disabled>Request Declined</button>;
            case 'withdrawn':
                return <button className="btn flex-fill" disabled>Request Withdrawn</button>;
            default: // null or any other case
                return (
                    <button
                        onClick={onInterestedClick}
                        className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                        style={{backgroundColor: '#f16040'}}
                    >
                        I'm Interested
                    </button>
                );
        }
    };

    if (isLoading) {
        return <SkeletonLoader/>;
    }

    if (!profile) {
        return (
            <div className="agent-info bg-white border-20 p-30 mb-40 text-center">
                <p>Lister information is not available.</p>
            </div>
        );
    }

    const avatarUrl = profile.image || "/assets/images/dashboard/no-profile-pic.png";

    return (
        <>
            <div className="agent-info bg-white border-20 p-30 mb-40">
                <img
                    src={avatarUrl}
                    alt={`${profile.username}'s Avatar`}
                    className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
                    style={{width: '100px', height: '100px', objectFit: 'cover'}}
                />

                <div className="text-center mt-25">
                    <div className="d-flex align-items-center justify-content-center">
                        <h6 className="name mb-0">{profile.username}</h6>
                        <BadgeCheck className="ms-1 text-primary" size={20} color="#1E88E5"/>
                    </div>
                    <p className="fs-16">{profile.majors_minors || 'Student'}</p>
                </div>

                <div className="divider-line mt-40 mb-45 pt-20">
                    <ul className="style-none">
                        {profile.school_attending &&
                            <li className="d-flex justify-content-between">
                                <span>School:</span> <span className="fw-500 color-dark">{profile.school_attending}</span>
                            </li>
                        }
                        {profile.expected_graduation_year && profile.expected_graduation_year.trim() !== '' &&
                            <li className="d-flex justify-content-between">
                                <span>Expected Graduation:</span> <span className="fw-500 color-dark">{profile.expected_graduation_year}</span>
                            </li>
                        }
                        <li className="d-flex align-items-start justify-content-between">
                            <span className="me-2">About:</span>
                            <span
                                className="fw-500 color-dark text-end">{profile.about || 'No information provided.'}</span>
                        </li>
                    </ul>
                </div>

                <div className="d-flex justify-content-center gap-2">
                    {renderActionButton()}
                    <Link
                        to="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowAmbassadorModal(true);
                        }}
                        className="btn flex-fill d-flex align-items-center justify-content-center text-white"
                        style={{backgroundColor: '#f16040'}}
                    >
                        Request Ambassador
                    </Link>
                </div>
            </div>

            {/* Ambassador Request Modal */}
            <AmbassadorRequestModal
                isOpen={showAmbassadorModal}
                onClose={() => setShowAmbassadorModal(false)}
                propertyTitle={propertyTitle}
                propertyId={propertyId}
            />
        </>
    );
};

export default SidebarInfo;