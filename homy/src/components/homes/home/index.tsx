import HeroBanner from "./HeroBanner"
import FooterTwo from "../../../layouts/footers/FooterTwo"
import HeaderTwo from "../../../layouts/headers/HeaderTwo"

const Home = () => {
  return (
    <>
      <HeaderTwo style_1={true} style_2={false} />
      <HeroBanner />
      <FooterTwo />
    </>
  )
}

export default Home
