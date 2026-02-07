import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import AboutUsMain from '../components/inner-pages/about-us/about-us';

const AboutUs = () => {
   return (
      <Wrapper>
         <SEO pageTitle="About Burrow Housing | Northeastern Student Subleases" canonical="/about_us" />
         <AboutUsMain />
      </Wrapper>
   );
};

export default AboutUs;