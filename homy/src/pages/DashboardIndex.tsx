import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardIndexMain from '../components/dashboard/index'

const DashboardIndex = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Dashboard Index  Burrow'} />
         <DashboardIndexMain />
      </Wrapper>
   );
};

export default DashboardIndex;