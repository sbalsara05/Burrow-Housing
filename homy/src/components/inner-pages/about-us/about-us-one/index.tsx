import FooterFour from "../../../../layouts/footers/FooterFour"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import FancyBanner from "../../../common/FancyBanner"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import Feedback from "../../../homes/home-five/Feedback"
import AgentArea from "../../../homes/home-one/AgentArea"
import BLockFeatureFive from "../../../homes/home-one/BLockFeatureFive"
import VideoBanner from "../../../homes/home-seven/VideoBanner"
import BLockFeatureOne from "./BLockFeatureOne"
import Brand from "./Brand"

const AboutUsOne = () => {
   return (
      <>
         <HeaderOne style={true} />
         <BreadcrumbOne title="About Our Platform" sub_title="About us" style={false} />
         <BLockFeatureOne />
         <AgentArea style={false} />
         <FooterFour />
      </>
   )
}

export default AboutUsOne
