import { useState } from 'react';

interface InterestedFormData {
  moveInDate: string;
  message: string;
}

interface UseInterestedModalProps {
  onSubmitInterest?: (data: InterestedFormData & { propertyId: string }) => Promise<void>;
}

export const useInterestedModal = ({ onSubmitInterest }: UseInterestedModalProps = {}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const openModal = (propertyId: string, propertyName: string) => {
    setCurrentProperty({ id: propertyId, name: propertyName });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProperty(null);
  };

  const handleSubmitInterest = async (data: InterestedFormData) => {
    if (!currentProperty) return;

    if (onSubmitInterest) {
      await onSubmitInterest({
        ...data,
        propertyId: currentProperty.id
      });
    } else {
      // Default implementation - you can customize this
      console.log('Interest submitted:', {
        propertyId: currentProperty.id,
        propertyName: currentProperty.name,
        moveInDate: data.moveInDate,
        message: data.message
      });
    }
  };

  return {
    isModalOpen,
    currentProperty,
    openModal,
    closeModal,
    handleSubmitInterest
  };
};