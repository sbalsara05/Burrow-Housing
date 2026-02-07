import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardPropertiesListMain from '../components/dashboard/properties-list'

const DashboardPropertiesList = () => {
   return (
      <Wrapper>
         <SEO pageTitle="My Properties | Burrow Housing" noIndex />
         <DashboardPropertiesListMain />
      </Wrapper>
   );
};

export default DashboardPropertiesList;