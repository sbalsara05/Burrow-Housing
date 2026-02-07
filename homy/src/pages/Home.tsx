import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HomeMain from '../components/homes/home';

const Home = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Burrow Housing | Northeastern Student Subleases" canonical="/home" />
      <HomeMain />
    </Wrapper>
  );
};

export default Home;