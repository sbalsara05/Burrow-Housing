import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorComingSoonPage from '../components/dashboard/ambassador/AmbassadorComingSoonPage';

const DashboardAmbassador = () => {
	return (
		<Wrapper>
			<SEO pageTitle="Ambassador Dashboard | Burrow Housing" noIndex />
			<AmbassadorComingSoonPage />
		</Wrapper>
	);
};

export default DashboardAmbassador;
