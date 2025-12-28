import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import ContractViewer from '../components/dashboard/agreements/ContractViewer';

const DashboardContractViewer = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Review Agreement - Burrow Housing'} />
            <div className="main-page-wrapper">
                {/* Sidebar Navigation */}
                <DashboardHeaderOne isActive={false} setIsActive={() => { }} />

                <div className="dashboard-body">
                    <div className="position-relative">
                        {/* Top Header */}
                        <DashboardHeaderTwo title="Review Agreement" />

                        {/* Main Content */}
                        <ContractViewer />
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};

export default DashboardContractViewer;