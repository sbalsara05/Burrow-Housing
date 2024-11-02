
import NiceSelect from "../../../ui/NiceSelect";

const DropdownOne = ({ style }: any) => {

   const selectHandler = () => { };

   const searchHandler = () => {
      window.location.href = '/listing_0';
   };

   return (
      <form onSubmit={(e) => { e.preventDefault(); searchHandler(); }}>
         <div className="row gx-0 align-items-center">
            <div className="col-xl-3 col-lg-4">
               <div className="input-box-one border-left">
                  <div className="label">I’m looking to...</div>
                  <NiceSelect className={`nice-select ${style ? "fw-normal" : ""}`}
                     options={[
                        { value: "apartments", text: "Buy Apartments" },
                        { value: "condos", text: "Rent Condos" },
                        { value: "houses", text: "Sell Houses" },
                        { value: "industrial", text: "Rent Industrial" },
                        { value: "villas", text: "Sell Villas" },
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder="" />
               </div>
            </div>
            <div className={`${style ? "col-xl-3" : "col-xl-4"} col-lg-4`}>
               <div className="input-box-one border-left">
                  <div className="label">Neighborhood</div>
                  <NiceSelect className={`nice-select location ${style ? "fw-normal" : ""}`}
                     options={[
                        { value: "allston", text: "Allston" },
                        { value: "back bay", text: "Back Bay" },
                        { value: "beacon hill", text: "Beacon Hill" },
                        { value: "brighton", text: "Brighton" },
                        { value: "charlestown", text: "Charlestown" },
                        { value: "chinatown", text: "Chinatown" },
                        { value: "dorchester", text: "Dorchester" },
                         { value: "fenway", text: "Fenway" },
                         { value: "hyde park", text: "Hyde Park" },
                         { value: "jamaica plain", text: "Jamaica Plain" },
                         { value: "mattapan", text: "Mattapan" },
                         { value: "mission hill", text: "Mission Hill" },
                         { value: "north end", text: "North End" },
                         { value: "roslindale", text: "Roslindale" },
                         { value: "roxbury", text: "Roxbury" },
                          { value: "south boston", text: "South Boston" },
                          { value: "south end", text: "South End" },
                          { value: "west end", text: "West End" },
                         { value: "west roxbury", text: "West Roxbury" },
                         { value: "wharf district", text: "Wharf District" },

                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder="" />
               </div>
            </div>
            <div className="col-xl-3 col-lg-4">
               <div className="input-box-one border-left border-lg-0">
                  <div className="label">Price Range</div>
                  <NiceSelect
                     className={`nice-select ${style ? "fw-normal" : ""}`}
                     options={[
                        { value: "1", text: "$10,000 - $200,000" },
                        { value: "2", text: "$20,000 - $300,000" },
                        { value: "3", text: "$30,000 - $400,000" },
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder="" />
               </div>
            </div>
            <div className={`${style ? "col-xl-3" : "col-xl-2"}`}>
               <div className="input-box-one lg-mt-10">
                  <button className={`fw-500 tran3s ${style ? "w-100 tran3s search-btn-three" : "text-uppercase search-btn"}`}>{style ? "Search Now" : "Search"}</button>
               </div>
            </div>
         </div>
      </form>
   );
};

export default DropdownOne;
