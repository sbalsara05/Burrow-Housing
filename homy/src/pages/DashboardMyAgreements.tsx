import React from 'react';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import AgreementsBody from '../components/dashboard/agreements/AgreementsBody';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

const DashboardMyAgreements = () => {
    const isCollapsed = useSidebarCollapse();

    return (
        <Wrapper>
            <SEO pageTitle={'My Agreements - Burrow Housing'} />
            <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="position-relative">
                    {/* Top Header */}
                    <DashboardHeaderTwo title="My Agreements" />

                    {/* Main Content Body */}
                    <AgreementsBody />
                </div>
            </div>
        </Wrapper>
    );
};

export default DashboardMyAgreements;
