import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorRequestsBody from '../components/dashboard/requests/AmbassadorRequestsBody';

const DashboardAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Ambassador Responses - Burrow'} />
            <AmbassadorRequestsBody />
        </Wrapper>
    );
};

export default DashboardAmbassadorRequests;

