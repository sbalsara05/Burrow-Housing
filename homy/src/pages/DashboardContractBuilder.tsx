import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from "../layouts/headers/dashboard/DashboardHeaderTwo";
import ContractBuilder from '../components/dashboard/agreements/ContractBuilder';

const DashboardContractBuilder = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Edit Contract - Burrow Housing'} />
            <DashboardHeaderOne />
            <div className="dashboard-body">
                <div className="position-relative">
                    <DashboardHeaderTwo title="Edit Agreement" />
                    <ContractBuilder />
                </div>
            </div>
        </Wrapper>
    );
};

export default DashboardContractBuilder;