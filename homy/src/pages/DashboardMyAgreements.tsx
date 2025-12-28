import React from 'react';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import AgreementsBody from '../components/dashboard/agreements/AgreementsBody'; // We will create this next

const DashboardMyAgreements = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'My Agreements - Burrow Housing'} />
            {/* Sidebar */}
            <DashboardHeaderOne />
            <div className="dashboard-body">
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