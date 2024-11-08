import NiceSelect from "../../../ui/NiceSelect";

const UserAvatarSetting = () => {

   const selectHandler = () => { };

   return (
       <div className="row">
           <div className="col-12">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Username*</label>
                   <input type="text" placeholder=""/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">First Name*</label>
                   <input type="text" placeholder="First Name"/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Last Name*</label>
                   <input type="text" placeholder="Last Name"/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">School Email*</label>
                   <input type="email" placeholder="name@school.com"/>
               </div>
           </div>

           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Majors and/or Minors*</label>
                   {/*<NiceSelect className="nice-select"*/}
                   {/*   options={[*/}
                   {/*      { value: "1", text: "Agent" },*/}
                   {/*      { value: "2", text: "Agency" },*/}
                   {/*   ]}*/}
                   {/*   defaultCurrent={0}*/}
                   {/*   onChange={selectHandler}*/}
                   {/*   name=""*/}
                   {/*   placeholder="" />*/}
                   <input type="text" placeholder="Major and Minors"/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">I am Attending:</label>
                   <input type="text" placeholder="Northeastern University"/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Phone Number*</label>
                   <input type="tel" placeholder="+123 456 7890"/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Smoker*</label>
                   <NiceSelect className="nice-select"
                               options={[
                                   {value: "1", text: "Yes"},
                                   {value: "2", text: "No"},
                               ]}
                               defaultCurrent={0}
                               onChange={selectHandler}
                               name=""
                               placeholder=""/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">Allergies*</label>
                   <NiceSelect className="nice-select"
                               options={[
                                   {value: "1", text: "Yes"},
                                   {value: "2", text: "No"},
                               ]}
                               defaultCurrent={0}
                               onChange={selectHandler}
                               name=""
                               placeholder=""/>
               </div>
           </div>
           <div className="col-sm-6">
               <div className="dash-input-wrapper mb-30">
                   <label htmlFor="">If "Yes" Which Ones?</label>
                   <input type="text" placeholder="Allergic to..."/>
               </div>
           </div>
           <div className="col-12">
               <div className="dash-input-wrapper">
                   <label htmlFor="">About*</label>
                   <textarea className="size-lg"
                             placeholder="This is your chance to talk about yourself, and how you are as a person..."></textarea>
                   <div className="alert-text">Brief description for you, and your profile. URLs are hyperlinked.</div>
               </div>
           </div>
       </div>
   )
}

export default UserAvatarSetting
