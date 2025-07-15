import {Link} from "react-router-dom";

 interface ContentType {
     title_1: string;
     title_2: string;
     desc_2: JSX.Element;
     desc_3: JSX.Element;
 }

 const feature_content: ContentType = {
     title_1: "Who are we?",
     title_2: "Our Mission",
     desc_2: (<>Our founders are a group of college students from Northeastern University that took notice of the fact
         that housing and subletting has become increasingly convoluted
         and difficult to navigate across sites and unvetted areas</>),
     desc_3: (<>We want students to be able to find a wide variety of subletting options to their specifications all in
         one organized and optimized search and for subletters to have a
         practical place to put their properties
     </>),
 }

 const {title_1, title_2, desc_2, desc_3} = feature_content;

 const BLockFeature = () => {
     return (
         <div className="block-feature-two mt-150 xl-mt-100">
             <div className="container">
                 <div className="row">
                     <div className="col-12">
                         <div>
                             <Link to="/contact" className="btn-two tw-mb-4 tw-w-full">Contact Us</Link>
                         </div>
                         <div className="block-two">
                             <div className="bg-wrapper tw-text-left mb-20">
                                 <h5>{title_1}</h5>
                                 <p className="fs-22 lh-lg mt-20">{desc_2}</p>
                             </div>
                             <div className="bg-wrapper tw-text-left">
                                 <h5 className="">{title_2}</h5>
                                 <p className="fs-22 lh-lg mt-20">{desc_3}</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     )
 }

 export default BLockFeature
