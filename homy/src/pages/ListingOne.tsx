import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import ListingOneMain from '../components/inner-listing/listing-01';

const ListingOne = () => {
  return (
    <Wrapper>
      <SEO pageTitle="Listings | Burrow Housing" canonical="/listing_01" />
      <ListingOneMain />
    </Wrapper>
  );
};

export default ListingOne;