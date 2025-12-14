import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AmbassadorRequestDetails from '../components/dashboard/ambassador/AmbassadorRequestDetails';

const DashboardAmbassadorRequestDetails = () => {
	return (
		<Wrapper>
			<SEO pageTitle={'Request Details - Ambassador Dashboard - Burrow'} />
			<AmbassadorRequestDetails />
		</Wrapper>
	);
};

export default DashboardAmbassadorRequestDetails;
