import FooterTwo from "../../../../layouts/footers/FooterTwo"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import AgentArea from "../../../homes/home-one/AgentArea"
import BLockFeatureOne from "./BLockFeatureOne"

const AboutUsOne = () => {
   return (
      <>
         <HeaderOne style={true} />
         <BreadcrumbOne title="About Our Platform" sub_title="About us" style={false} />
         <BLockFeatureOne />
         {/* <VideoBanner /> */}
         {/*<BLockFeatureFive style={true} />*/}
         {/*<Feedback style={true} />*/}
         <AgentArea style={false} />
         {/*<Brand />*/}
         {/*<FancyBanner style={false} />*/}
         <FooterTwo />
      </>
   )
}

export default AboutUsOne
