import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import RequestsBody from '../components/dashboard/requests/RequestsBody';

const DashboardReceivedRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Received Requests'} />
            <DashboardHeaderOne />
            <RequestsBody />
        </Wrapper>
    );
};

export default DashboardReceivedRequests;