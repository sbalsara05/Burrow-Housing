import Footer from '../../../layouts/footers/Footer'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import Breadcrumb from '../../common/breadcrumb/Breadcrumb'
import FaqArea from './FaqArea'

const Faq = () => {
   return (
      <>
         <HeaderOne style={true} />
         <Breadcrumb title="Question & Answers" link="#" link_title="Pages" sub_title="Faq’s" style={true} />
         <FaqArea/>
         <Footer />
      </>
   )
}

export default Faq
