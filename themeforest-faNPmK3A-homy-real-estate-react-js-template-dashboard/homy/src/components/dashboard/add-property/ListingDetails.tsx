import NumberNiceSelect from "../../../ui/NumberNiceSelect";

const ListingDetails = () => {
   const selectHandler = () => { };

   return (
      <div className="bg-white card-box border-20 mt-40">
         <h4 className="dash-title-three">Listing Details</h4>
         <div className="row align-items-end">
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Size in sqft*</label>
                  <input type="text" placeholder="Ex: 500 sqft or N/A if unknown" />
                  <small className="text-muted"></small>
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Bedrooms*</label>
                  <NumberNiceSelect className="nice-select"
                     options={[
                        { value: 1, text: 1 },
                        { value: 2, text: 2 },
                        { value: 3, text: 3 },
                        { value: 4, text: 4 },
                        { value: 5, text: 5},
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder="" />
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Bathrooms*</label>
                  <NumberNiceSelect className="nice-select"
                     options={[
                        { value: 1, text: 1 },
                        { value: 2, text: 2 },
                        { value: 3, text: 3 }
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder="" />
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Floor No.</label>
                  <input type="number" min="0" placeholder="Enter floor number" />
               </div>
            </div>
            <div className="col-12 mt-10">
               <div className="dash-input-wrapper">
                  <label htmlFor="">Property Description</label>
                  <textarea
                     className="size-lg"
                     rows="5"
                     placeholder="Write details about your property, highlight key features, nearby amenities, etc."
                  ></textarea>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ListingDetails;