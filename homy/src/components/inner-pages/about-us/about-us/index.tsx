import Footer from "../../../../layouts/footers/Footer"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import Breadcrumb from "../../../common/breadcrumb/Breadcrumb"
import AboutUsArea from "../../../homes/home/AboutUsArea"
import BLockFeature from "./BLockFeature"

const AboutUs = () => {
   return (
      <>
         <HeaderOne style={true} />
         <Breadcrumb title="About Our Platform" sub_title="About us" style={false} />
         <BLockFeature />
         <AboutUsArea style={false} />
         <Footer />
      </>
   )
}

export default AboutUs
