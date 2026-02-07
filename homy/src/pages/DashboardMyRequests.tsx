import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import MyRequestsBody from '../components/dashboard/requests/MyRequestsBody';

const DashboardMyRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle="My Sent Requests | Burrow Housing" noIndex />
            <MyRequestsBody />
        </Wrapper>
    );
};

export default DashboardMyRequests;