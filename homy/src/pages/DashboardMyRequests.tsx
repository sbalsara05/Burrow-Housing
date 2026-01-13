import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import MyRequestsBody from '../components/dashboard/requests/MyRequestsBody';

const DashboardMyRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'My Sent Requests'} />
            <MyRequestsBody />
        </Wrapper>
    );
};

export default DashboardMyRequests;