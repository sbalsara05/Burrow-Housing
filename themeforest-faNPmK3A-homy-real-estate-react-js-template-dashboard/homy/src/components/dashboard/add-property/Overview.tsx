import NiceSelect from "../../../ui/NiceSelect";

const Overview = () => {
   const selectHandler = () => { };

   return (
      <div className="bg-white card-box border-20">
         <h4 className="dash-title-three">Overview</h4>
         <div className="row">
            <div className="col-12">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Building Name <span className="text-muted">(if applicable)</span></label>
                  <input type="text" placeholder="Enter building name" />
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Category*</label>
                  <NiceSelect className="nice-select"
                     options={[
                        {value: "1", text: "Single Room"},
                        {value: "2", text: "Apartment"},
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder=""/>
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Neighborhood*</label>
                  <NiceSelect className="nice-select"
                     options={[
                        {value: "any", text: "Any"},
                        {value: "allston", text: "Allston"},
                        {value: "back bay", text: "Back Bay"},
                        {value: "beacon hill", text: "Beacon Hill"},
                        {value: "brighton", text: "Brighton"},
                        {value: "charlestown", text: "Charlestown"},
                        {value: "chinatown", text: "Chinatown"},
                        {value: "dorchester", text: "Dorchester"},
                        {value: "fenway", text: "Fenway"},
                        {value: "hyde park", text: "Hyde Park"},
                        {value: "jamaica plain", text: "Jamaica Plain"},
                        {value: "mattapan", text: "Mattapan"},
                        {value: "mission hill", text: "Mission Hill"},
                        {value: "north end", text: "North End"},
                        {value: "roslindale", text: "Roslindale"},
                        {value: "roxbury", text: "Roxbury"},
                        {value: "south boston", text: "South Boston"},
                        {value: "south end", text: "South End"},
                        {value: "west end", text: "West End"},
                        {value: "west roxbury", text: "West Roxbury"},
                        {value: "wharf district", text: "Wharf District"},
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder=""/>
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Total Rent*</label>
                  <input type="text" placeholder="Rent of Residence" />
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Lease Length*</label>
                  <NiceSelect className="nice-select"
                     options={[
                        {value: "12", text: "12 Months"},
                        {value: "9", text: "9 Months"},
                        {value: "6", text: "6 Months"},
                        {value: "3", text: "3 Months"},
                        {value: "1", text: "Month to Month"},
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder=""/>
               </div>
            </div>
            <div className="col-md-6">
               <div className="dash-input-wrapper mb-30">
                  <label htmlFor="">Room Type*</label>
                  <NiceSelect className="nice-select"
                     options={[
                        {value: "single", text: "Single Room (Private)"},
                        {value: "shared", text: "Shared Room"},
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder=""/>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Overview;