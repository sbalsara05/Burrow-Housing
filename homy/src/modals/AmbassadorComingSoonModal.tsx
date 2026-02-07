import React from 'react';

interface AmbassadorComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AmbassadorComingSoonModal: React.FC<AmbassadorComingSoonModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-20 p-4">
          <div className="modal-header border-0 pb-2">
            <h4 className="modal-title fw-600">Coming Soon</h4>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body pt-0">
            <p className="mb-0">
              Ambassador features are coming soon! We&apos;re working on it. Check back later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorComingSoonModal;
