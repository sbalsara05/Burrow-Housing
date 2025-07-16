import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import ListingDetailsOneMain from '../components/ListingDetails/listing-details-1';

const ListingDetailsOne = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Listing Details One Burrow'} />
         <ListingDetailsOneMain />
      </Wrapper>
   );
};

export default ListingDetailsOne;