import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorComingSoonPage from '../components/dashboard/ambassador/AmbassadorComingSoonPage';

const DashboardMyAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle="My Ambassador Requests | Burrow Housing" noIndex />
            <AmbassadorComingSoonPage />
        </Wrapper>
    );
};

export default DashboardMyAmbassadorRequests;

