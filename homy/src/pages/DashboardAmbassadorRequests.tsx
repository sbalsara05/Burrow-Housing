import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import AmbassadorRequestsBody from '../components/dashboard/requests/AmbassadorRequestsBody';

const DashboardAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Ambassador Responses - Burrow'} />
            <DashboardHeaderOne />
            <AmbassadorRequestsBody />
        </Wrapper>
    );
};

export default DashboardAmbassadorRequests;

