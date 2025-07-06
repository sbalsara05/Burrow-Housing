import { Link } from "react-router-dom";
import footer_data from "../../data/home-data/FooterData";

interface ContentType {
   title: string;
   desc_1: string;
   desc_2: string;
   email: string;
   icon: string[];
}

const footer_content: ContentType = {
   title: "Our Newsletter",
   desc_1: "Get instant news by subscribe to our newsletter",
   desc_2: "Northeastern University",
   email: "burrowhousingsublets@gmail.com",
   icon: ["facebook-f", "twitter", "instagram"],
}

const { title, desc_1, desc_2, email, number, icon } = footer_content;

const FooterTwo = () => {
   return (
      <div className="footer-two">
         <div className="container container-large">
            <div className="bg-wrapper position-relative z-1">

               <div className="row justify-content-between">
                  <div className="col-xl-3">
                     <div className="footer-intro position-relative z-1 pt-70 pb-150 lg-pb-20">
                        <div className="logo mb-15">
                           <Link to="/">
                              <img src="/assets/images/logo/textlogo.png" alt="" style={{width: "250px", height: "auto"}}/>
                           </Link>
                        </div>
                        <p className="mb-45 lg-mb-30 pe-2 pe-lg-5">{desc_2}</p>
                        <ul className="style-none contact-info">
                           <li className="d-flex align-items-center">
                              <img src="/assets/images/icon/icon_30.svg" alt="" width="20" />
                              <Link to="#">{email}</Link>
                           </li>
                           <li className="d-flex align-items-center">
                              <img src="/assets/images/icon/icon_31.svg" alt="" width="20" />
                              <Link to="#">{number}</Link>
                           </li>
                        </ul>

                        <ul className="style-none d-flex align-items-center social-icon">
                           {icon.map((icon, i) => (
                              <li key={i}><Link to="#"><i className={`fa-brands fa-${icon}`}></i></Link></li>
                           ))}
                        </ul>
                        <img src="/assets/images/shape/shape_46.svg" alt="" className="lazy-img shapes shape_01 d-none d-xl-block" />
                     </div>
                  </div>

                  <div className="col-xl-9">
                     <div className="ms-xxl-5 ps-xl-5 mt-200 lg-mt-20">
                        <div className="row justify-content-between">
                           {footer_data.filter((items) => items.page === "home_3").map((item) => (
                              <div key={item.id} className={`${item.widget_class} col-lg-3 col-md-4`}>
                                 <div className="footer-nav pt-30">
                                    <h5 className="footer-title">{item.widget_title}</h5>
                                    <ul className="footer-nav-link style-none">
                                       {item.footer_link.map((li, i) => (
                                          <li key={i}><Link to={li.link}>{li.link_title}</Link></li>
                                       ))}
                                    </ul>
                                 </div>
                              </div>
                           ))}
                           <div className="col-xxl-3 col-lg-2 d-none d-lg-block">
                              <img src="/assets/images/shape/shape_47.svg" alt="" className="lazy-img mt-50" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bottom-footer">
               <div className="d-md-flex justify-content-center justify-content-md-between align-items-center">
                  <p className="mb-15 text-center text-lg-start order-md-first">Copyright @2025 Burrow Housing</p>
               </div>
            </div>
         </div>
      </div>
   )
}

export default FooterTwo
