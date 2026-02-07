import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import FaqMain from '../components/inner-pages/faq'

const Faq = () => {
   return (
      <Wrapper>
         <SEO pageTitle="Terms of Service | Burrow Housing" description="Terms of Service for Burrow Housing – the Northeastern student sublease platform. Policies on listings, payments, and user responsibilities." canonical="/faq" />
         <FaqMain />
      </Wrapper>
   );
};

export default Faq;