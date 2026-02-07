import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorComingSoonPage from '../components/dashboard/ambassador/AmbassadorComingSoonPage';

const DashboardAmbassadorRequests = () => {
    return (
        <Wrapper>
            <SEO pageTitle="Ambassador Responses | Burrow Housing" noIndex />
            <AmbassadorComingSoonPage />
        </Wrapper>
    );
};

export default DashboardAmbassadorRequests;

