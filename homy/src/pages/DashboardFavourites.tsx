import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardFavouritesMain from '../components/dashboard/favourites'

const DashboardFavourites = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Dashboard Favourites  Burrow'} />
         <DashboardFavouritesMain />
      </Wrapper>
   );
};

export default DashboardFavourites;