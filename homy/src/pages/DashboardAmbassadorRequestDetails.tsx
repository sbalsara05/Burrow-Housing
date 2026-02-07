import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorComingSoonPage from '../components/dashboard/ambassador/AmbassadorComingSoonPage';

const DashboardAmbassadorRequestDetails = () => {
	return (
		<Wrapper>
			<SEO pageTitle="Request Details | Burrow Housing" noIndex />
			<AmbassadorComingSoonPage />
		</Wrapper>
	);
};

export default DashboardAmbassadorRequestDetails;
