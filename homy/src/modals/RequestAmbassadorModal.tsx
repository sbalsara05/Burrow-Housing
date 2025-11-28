import React, {useState} from 'react';
import {X, Plus} from 'lucide-react';

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
    const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>([
        {id: '1', text: 'Damage to the room'},
        {id: '2', text: 'Room size'},
        {id: '3', text: 'Kitchen Size'},
    ]);
    const [newPoint, setNewPoint] = useState('');
    const [showNewPointInput, setShowNewPointInput] = useState(false);
    const [preferredDates, setPreferredDates] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState<Record<string, string>>({});
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

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
        const newDetails = {...additionalDetails};
        delete newDetails[id];
        setAdditionalDetails(newDetails);
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const handleSubmit = async () => {
        const requestData = {
            propertyId,
            propertyTitle,
            inspectionPoints: inspectionPoints.map(point => ({
                text: point.text,
                details: additionalDetails[point.id] || ''
            })),
            preferredDates,
            contactInfo
        };

        console.log('Ambassador request submitted:', requestData);

        // TODO: Send to your backend API
        // await axios.post('/api/ambassador-requests', requestData);

        alert('Ambassador request submitted successfully!');
        handleClose();
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Step 1: Inspection Points */}
                {step === 1 && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl tw-font-light">Request Ambassador Viewing</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <p className="text-gray-700 mb-6">
                            What would you like the ambassador to check during their visit?
                        </p>

                        <div className="mb-6">
                            <div className="space-y-3">
                                {!showNewPointInput && (
                                    <button
                                        onClick={() => setShowNewPointInput(true)}
                                        className="text-orange-500 hover:text-orange-600 flex items-center gap-2 text-sm font-medium mb-4"
                                    >
                                        <Plus size={16}/>
                                        Add Point
                                    </button>
                                )}

                                {showNewPointInput && (
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newPoint}
                                            onChange={(e) => setNewPoint(e.target.value)}
                                            placeholder="Add inspection point..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddPoint()}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAddPoint}
                                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewPointInput(false);
                                                setNewPoint('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {inspectionPoints.map((point) => (
                                    <div key={point.id} className="border-b border-gray-200 pb-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 flex-1">
                                                <button
                                                    onClick={() => handleCarrotClick(point.id)}
                                                    className="text-orange-500 hover:text-orange-600 transition-transform"
                                                    aria-label="Toggle details"
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transition-transform ${selectedPoint === point.id ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </button>
                                                <span className="text-gray-800">{point.text}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemovePoint(point.id)}
                                                className="text-gray-400 hover:text-red-500"
                                                aria-label="Remove point"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </div>

                                        {/* Additional details textarea shown when carrot is clicked */}
                                        {selectedPoint === point.id && (
                                            <div className="mt-3 ml-6">
                        <textarea
                            value={additionalDetails[point.id] || ''}
                            onChange={(e) => handleDetailsChange(point.id, e.target.value)}
                            placeholder="Add additional details about this inspection point..."
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500 min-h-[120px] resize-none"
                        />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-6">
                            <button
                                onClick={handleClose}
                                className="px-8 py-3 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Dates and Contact */}
                {step === 2 && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Request Ambassador Viewing</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Preferred Viewing Dates
                                </label>
                                <input
                                    type="text"
                                    value={preferredDates}
                                    onChange={(e) => setPreferredDates(e.target.value)}
                                    placeholder="e.g. May 21-25"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Contact Information
                                </label>
                                <input
                                    type="text"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="Your email or phone number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <button
                                onClick={handleBack}
                                className="px-8 py-3 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!preferredDates || !contactInfo}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmbassadorRequestModal;