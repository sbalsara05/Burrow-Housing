import HeroBanner from "./HeroBanner"
import Category from "./Category"
import BLockFeatureOne from "./BLockFeatureOne"
import PropertyOne from "./PropertyOne"
import BLockFeatureTwo from "./BLockFeatureTwo"
import FancyBannerOne from "./FancyBannerOne"
import Brand from "./Brand"
import FancyBannerTwo from "./FancyBannerTwo"
import FooterTwo from "../../../layouts/footers/FooterTwo"
import PropertyTwo from "./PropertyTwo"
import Feedback from "./Feedback"
import HeaderTwo from "../../../layouts/headers/HeaderTwo"

const HomeThree = () => {
  return (
    <>
      <HeaderTwo style_1={true} style_2={false} />
      <HeroBanner />
      {/*<Category style={false} />*/}
      {/*<BLockFeatureOne />*/}

        // Possible use for new listings section
      {/*<PropertyOne />*/}
        // Possible use for new listings section
      {/*<PropertyTwo style={false} />*/}
      {/*<BLockFeatureTwo />*/}
      {/*<FancyBannerOne />*/}
        // Make this a review section?
      {/*<Feedback style={false} />*/}
      {/*<Brand />*/}
      {/*<FancyBannerTwo />*/}
      <FooterTwo />
    </>
  )
}

export default HomeThree
