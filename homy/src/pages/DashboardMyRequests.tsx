import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from "../layouts/headers/dashboard/DashboardHeaderOne";
import MyRequestsBody from '../components/dashboard/requests/MyRequestsBody';

const DashboardMyRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'My Sent Requests'} />
            <DashboardHeaderOne />
            <MyRequestsBody />
        </Wrapper>
    );
};

export default DashboardMyRequests;