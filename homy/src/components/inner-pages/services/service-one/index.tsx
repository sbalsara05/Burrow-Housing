import BlockFeatureOne from "./BlockFeatureOne"
// import HomeBLockFeatureOne from "../../../components/homes/home-one/BLockFeatureOne"
import BlockFeatureTwo from "./BlockFeatureTwo"
import FancyBanner from "./FancyBanner"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import FancyBannerCommon from "../../../common/FancyBanner"
import FooterFour from "../../../../layouts/footers/FooterFour"

const ServiceOne = () => {
   return (
      <>
         <HeaderOne style={true} />
         <BreadcrumbOne title="Our Services" link="#" link_title="Pages" sub_title="Services" style={false} />
         <BlockFeatureOne />
         <BlockFeatureTwo style={false} />
         <FancyBanner />
         <FancyBannerCommon />
         <FooterFour />
      </>
   )
}

export default ServiceOne;
