import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import ListingFourteenMain from '../components/inner-listing/listing-14';

const ListingFourteen = () => {
   return (
      <Wrapper>
         <SEO pageTitle="Northeastern Student Subleases | Burrow Housing" description="Browse sublease listings for Northeastern University students. Apartments and rooms for sublease near campus. Find your next place on Burrow Housing." canonical="/all_listings" />
         <ListingFourteenMain />
      </Wrapper>
   );
};

export default ListingFourteen;