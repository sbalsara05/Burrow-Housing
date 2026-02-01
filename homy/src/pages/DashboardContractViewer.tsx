import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import ContractViewer from '../components/dashboard/agreements/ContractViewer';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

const DashboardContractViewer = () => {
    const isCollapsed = useSidebarCollapse();

    return (
        <Wrapper>
            <SEO pageTitle={'Review Agreement - Burrow Housing'} />
            <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="position-relative">
                    <DashboardHeaderTwo title="Review Agreement" />
                    <ContractViewer />
                </div>
            </div>
        </Wrapper>
    );
};

export default DashboardContractViewer;