import React from 'react';
import InterestedModal from '../../modals/InterestedModal';
import { useInterestedModal } from '../../hooks/useInterestedModal';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    price: number;
    location: string;
    image: string;
    // ... other property fields
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { isModalOpen, currentProperty, openModal, closeModal, handleSubmitInterest } = useInterestedModal({
    onSubmitInterest: async (data) => {
      // Handle the interest submission here
      // This could involve API calls, notifications, etc.
      console.log('Submitting interest:', data);

      // Example API call:
      // await axios.post('/api/interests', data);

      // Show success message
      alert('Interest submitted successfully!');
    }
  });

  const handleInterestedClick = () => {
    openModal(property.id, property.name);
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img src={property.image} alt={property.name} />
      </div>

      <div className="property-content">
        <h3 className="property-title">{property.name}</h3>
        <p className="property-location">{property.location}</p>
        <p className="property-price">${property.price}/month</p>

        <div className="property-actions">
          <button
            className="btn btn-primary interested-btn"
            onClick={handleInterestedClick}
          >
            I'm Interested
          </button>
        </div>
      </div>

      <InterestedModal
        isOpen={isModalOpen}
        onClose={closeModal}
        propertyName={currentProperty?.name || ''}
        propertyId={currentProperty?.id || ''}
        onSubmit={handleSubmitInterest}
      />

      <style jsx>{`
        .property-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease;
        }

        .property-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .property-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .property-content {
          padding: 1rem;
        }

        .property-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .property-location {
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .property-price {
          font-size: 1.1rem;
          font-weight: 600;
          color: #FF6B47;
          margin-bottom: 1rem;
        }

        .interested-btn {
          background-color: #FF6B47;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .interested-btn:hover {
          background-color: #e55a3c;
        }
      `}</style>
    </div>
  );
};

export default PropertyCard;