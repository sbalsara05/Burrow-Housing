import FooterTwo from '../../../layouts/footers/FooterTwo'
import HeaderOne from '../../../layouts/headers/HeaderOne'
import BreadcrumbOne from '../../common/breadcrumb/BreadcrumbOne'
import FaqArea from './FaqArea'

const Faq = () => {
   return (
      <>
         <HeaderOne style={true} />
         <BreadcrumbOne title="Question & Answers" link="#" link_title="Pages" sub_title="Faq’s" style={true} />
         <FaqArea/>
         <FooterTwo />
      </>
   )
}

export default Faq
