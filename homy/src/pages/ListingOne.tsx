import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import ListingOneMain from '../components/inner-listing/listing-01';

const ListingOne = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Listing One Burrow'} />
      <ListingOneMain />
    </Wrapper>
  );
};

export default ListingOne;