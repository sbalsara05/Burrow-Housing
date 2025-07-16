import HeroBanner from "./HeroBanner"
import Footer from "../../../layouts/footers/Footer"
import HeaderTwo from "../../../layouts/headers/HeaderTwo"

const Home = () => {
  return (
    <>
      <HeaderTwo style_1={true} style_2={false} />
      <HeroBanner />
      <Footer />
    </>
  )
}

export default Home
