import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardReviewMain from '../components/dashboard/review'

const DashboardReview = () => {
   return (
      <Wrapper>
         <SEO pageTitle="Review | Burrow Housing" noIndex />
         <DashboardReviewMain />
      </Wrapper>
   );
};

export default DashboardReview;