import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import MyAmbassadorRequestsBody from '../components/dashboard/requests/MyAmbassadorRequestsBody';

const DashboardMyAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'My Ambassador Requests - Burrow'} />
            <MyAmbassadorRequestsBody />
        </Wrapper>
    );
};

export default DashboardMyAmbassadorRequests;

