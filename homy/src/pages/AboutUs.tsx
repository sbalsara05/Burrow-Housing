import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AboutUsMain from '../components/inner-pages/about-us/about-us-one';

const AboutUs = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'About Us'} />
         <AboutUsMain />
      </Wrapper>
   );
};

export default AboutUs;