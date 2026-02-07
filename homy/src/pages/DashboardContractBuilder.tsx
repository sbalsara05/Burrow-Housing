import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import ContractBuilder from '../components/dashboard/agreements/ContractBuilder';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

const DashboardContractBuilder = () => {
    const isCollapsed = useSidebarCollapse();

    return (
        <Wrapper>
            <SEO pageTitle="Edit Contract | Burrow Housing" noIndex />
            <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="position-relative">
                    <DashboardHeaderTwo title="Edit Agreement" />
                    <ContractBuilder />
                </div>
            </div>
        </Wrapper>
    );
};

export default DashboardContractBuilder;