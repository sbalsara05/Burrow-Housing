
import { Link } from "react-router-dom"
import inner_faq_data from "../../../data/inner-data/FaqData"

const FaqArea = () => {

   return (
      <div className="faq-section-two mt-130 xl-mt-100 mb-150 xl-mb-100">
         <div className="container">
            <div className="row">
               <div className="col-lg-4">
                  <div className="faq-sidebar" style={{ position: 'sticky', top: '100px' }}>
                     <div className="bg-wrapper">
                        <ul className="style-none">
                           <li><a href="#PlatformRole">1. <span>Platform Role & Scope</span></a></li>
                           <li><a href="#UserResponsibility">2. <span>User Responsibility</span></a></li>
                           <li><a href="#ListingsContent">3. <span>Listings & User Content</span></a></li>
                           <li><a href="#PaymentsFees">4. <span>Payments & Service Fees</span></a></li>
                           <li><a href="#SecurityDeposits">5. <span>Security Deposits</span></a></li>
                           <li><a href="#SubleaseTemplates">6. <span>Sublease Templates</span></a></li>
                           <li><a href="#Tours">7. <span>Tours & Walkthroughs</span></a></li>
                           <li><a href="#FairHousing">8. <span>Fair Housing</span></a></li>
                           <li><a href="#Verification">9. <span>Verification & Accounts</span></a></li>
                           <li><a href="#LimitationLiability">10. <span>Limitation of Liability</span></a></li>
                           <li><a href="#DisputeResolution">11. <span>Dispute Resolution</span></a></li>
                           <li><a href="#ModificationsTermination">12. <span>Modifications</span></a></li>
                           <li><a href="#GoverningLaw">13. <span>Governing Law</span></a></li>
                        </ul>
                     </div>
                     <div className="bg-wrapper text-center mt-35">
                        <h4 className="mb-35">Have Questions?</h4>
                        <Link to="/contact" className="btn-five">Contact us</Link>
                     </div>
                  </div>
               </div>

               <div className="col-lg-8">
                  {inner_faq_data.map((item) => (
                     <div key={item.id} className="accordion-style-two no-bg p0 ms-xl-5">
                        <div className={`accordion-title text-uppercase fw-500 ${item.md_pt ? "md-pt-90" : "pt-90"}`} id={item.id_name}>{item.title}</div>
                        <div className="accordion p0" id={`accordion${item.id}`}>
                           {item.faq.map((faq: any, index: any) => (
                              <div key={index} className={`accordion-item ${faq.showAnswer ? "active" : ""}`}>
                                 <h2 className="accordion-header">
                                    <button className={`accordion-button ${faq.id === 3 ? "" : "collapsed"}`} type="button"
                                       data-bs-toggle="collapse" data-bs-target={`#collapse${faq.id}`} aria-expanded="true"
                                       aria-controls={`collapse${faq.id}`}>
                                       {faq.question}
                                    </button>
                                 </h2>
                                 <div id={`collapse${faq.id}`} className={`accordion-collapse collapse ${faq.id === 3 ? "show" : ""}`}
                                    data-bs-parent={`#accordion${item.id}`}>
                                    <div className="accordion-body">
                                       <p style={{ whiteSpace: 'pre-line' }}>{faq.answer}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

   </div>
   )
}
export default FaqArea