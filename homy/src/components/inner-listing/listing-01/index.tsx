import Footer from "../../../layouts/footers/Footer";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import FancyBanner from "../../common/FancyBanner";
import ListingOneArea from "./ListingOneArea"

const ListingOne = () => {
   return (
      <>
         <HeaderOne style={true} />
         <ListingOneArea />
         <FancyBanner />
         <Footer />
      </>
   )
}

export default ListingOne;
