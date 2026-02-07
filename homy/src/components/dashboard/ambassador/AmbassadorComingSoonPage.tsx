import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeaderTwo from '../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';

const AmbassadorComingSoonPage: React.FC = () => {
  const navigate = useNavigate();
  const isCollapsed = useSidebarCollapse();

  return (
    <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="position-relative">
        <DashboardHeaderTwo title="Ambassador" />
        <h2 className="main-title d-block d-lg-none">Ambassador</h2>
        <div className="d-flex flex-column align-items-center justify-content-center py-5 px-3">
          <h3 className="fw-600 mb-3">Coming Soon</h3>
          <p className="text-muted text-center mb-4">
            Ambassador features are coming soon! We&apos;re working on it. Check back later.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/dashboard-index')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorComingSoonPage;
