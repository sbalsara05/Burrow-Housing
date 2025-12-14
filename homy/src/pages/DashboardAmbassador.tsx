import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorDashboard from '../components/dashboard/ambassador';

const DashboardAmbassador = () => {
	return (
		<Wrapper>
			<SEO pageTitle={'Ambassador Dashboard - Burrow'} />
			<AmbassadorDashboard />
		</Wrapper>
	);
};

export default DashboardAmbassador;
