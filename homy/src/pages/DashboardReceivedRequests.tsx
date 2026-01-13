import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import RequestsBody from '../components/dashboard/requests/RequestsBody';

const DashboardReceivedRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Received Requests'} />
            <RequestsBody />
        </Wrapper>
    );
};

export default DashboardReceivedRequests;