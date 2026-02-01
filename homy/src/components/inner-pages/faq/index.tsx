import Footer from '../../../layouts/footers/Footer'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import Breadcrumb from '../../common/breadcrumb/Breadcrumb'
import FaqArea from './FaqArea'

const Faq = () => {
   return (
      <>
         <HeaderOne style={true} />
         <Breadcrumb title="Terms of Service" link="#" link_title="Pages" sub_title="Terms of Service" style={true} />
         <FaqArea/>
         <Footer />
      </>
   )
}

export default Faq
