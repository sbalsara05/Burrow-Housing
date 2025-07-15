import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HomeThreeMain from '../components/homes/home';

const HomeThree = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Burrow Housing'} />
      <HomeThreeMain />
    </Wrapper>
  );
};

export default HomeThree;