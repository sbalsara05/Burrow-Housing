import { useEffect, useState } from "react";
import NiceSelect from "../../../ui/NiceSelect";
import axios from "axios";

const AddressAndLocation = () => {
   const [states, setStates] = useState([]);
   const [cities, setCities] = useState([]);
   const [selectedState, setSelectedState] = useState("");

   // Fetch U.S. states on component mount
   useEffect(() => {
      const fetchStates = async () => {
         try {
               const config = {
               method: 'post',
               url: 'https://countriesnow.space/api/v0.1/countries/states',
               maxBodyLength: Infinity,
               headers: { 'Content-Type': 'application/json' },
               data: JSON.stringify({ country: "United States" })
            };
            const response = await axios(config);
            const stateData = response.data.data.states.map(state => ({
               name: state.name,
               state_code: state.state_code
            }));
            setStates(stateData);
         } catch (error) {
            console.error("Error fetching states:", error);
         }
      };
      fetchStates();
   }, []);

   const handleStateChange = async (selectedValue) => {
      setSelectedState(selectedValue);
      
      // Fetch cities for the selected state
      try {
         const config = {
            method: 'post',
            url: 'https://countriesnow.space/api/v0.1/countries/state/cities',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ country: "United States", state: selectedValue })
         };

         const response = await axios(config);      
         const cityData = response.data.data.map(city => ({
            name: city,
         }));
        setCities(cityData);
      } catch (error) {
         console.error("Error fetching cities:", error);
      }
   };

   return (
      <div className="bg-white card-box border-20 mt-40">
         <h4 className="dash-title-three">Address</h4>
         <div className="row">
            <div className="col-12">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Address*</label>
                  <input type="text" placeholder="123 Main Street" />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">State*</label>
                  <NiceSelect
                     className="nice-select"
                     options={states.map(state => ({ value: state.name, text: state.name }))}
                     defaultCurrent={0}
                     onChange={(e) => handleStateChange(e.target.value)}
                     placeholder="Select State"
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">City*</label>
                  <NiceSelect
                     className="nice-select"
                     options={cities.map(city => ({ value: city.name, text: city.name }))}
                     defaultCurrent={0}
                     placeholder="Select City"
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Zip Code*</label>
                  <input type="number" placeholder="12345" />
               </div>
            </div>
         </div>
      </div>
   );
};

export default AddressAndLocation;