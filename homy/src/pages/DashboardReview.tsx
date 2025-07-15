import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardReviewMain from '../components/dashboard/review'

const DashboardReview = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Dashboard Review  Burrow'} />
         <DashboardReviewMain />
      </Wrapper>
   );
};

export default DashboardReview;