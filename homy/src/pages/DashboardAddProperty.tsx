import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardAddPropertyMain from '../components/dashboard/add-property'

const DashboardAddProperty = () => {
   return (
      <Wrapper>
         <SEO pageTitle="Add Property | Burrow Housing" noIndex />
         <DashboardAddPropertyMain />
      </Wrapper>
   );
};

export default DashboardAddProperty;