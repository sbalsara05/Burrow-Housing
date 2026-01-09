import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import MyAmbassadorRequestsBody from '../components/dashboard/requests/MyAmbassadorRequestsBody';

const DashboardMyAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'My Ambassador Requests - Burrow'} />
            <DashboardHeaderOne />
            <MyAmbassadorRequestsBody />
        </Wrapper>
    );
};

export default DashboardMyAmbassadorRequests;

