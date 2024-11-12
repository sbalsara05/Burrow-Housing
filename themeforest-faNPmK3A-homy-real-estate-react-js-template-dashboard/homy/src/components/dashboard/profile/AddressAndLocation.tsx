import { useState } from "react";
import NiceSelect from "../../../ui/NiceSelect";

const AddressAndLocation = () => {
   const [address, setAddress] = useState("Northeastern University");
   const [city, setCity] = useState("Boston");
   const [state, setState] = useState("Massachusetts");
   const [zip, setZip] = useState("");
   const [mapUrl, setMapUrl] = useState(`https://www.google.com/maps?q=${encodeURIComponent("Northeastern University, Boston, MA")}&output=embed`);

   const updateMapUrl = (newAddress, newCity, newState, newZip) => {
      const fullAddress = `${newAddress}, ${newCity}, ${newState} ${newZip}`;
      setMapUrl(`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`);
   };

   const handleAddressChange = (e) => {
      const newAddress = e.target.value;
      setAddress(newAddress);
      updateMapUrl(newAddress, city, state, zip);
   };

   const handleCityChange = (value) => {
      setCity(value);
      updateMapUrl(address, value, state, zip);
   };

   const handleStateChange = (value) => {
      setState(value);
      updateMapUrl(address, city, value, zip);
   };

   const handleZipChange = (e) => {
      const newZip = e.target.value;
      setZip(newZip);
      updateMapUrl(address, city, state, newZip);
   };

   return (
      <div className="bg-white card-box border-20 mt-40">
         <h4 className="dash-title-three">Address & Location</h4>
         <div className="row">
            <div className="col-12">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="address">Address*</label>
                  <input
                     type="text"
                     placeholder="19 Yawkey Way"
                     value={address}
                     onChange={handleAddressChange}
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="city">City*</label>
                  <NiceSelect
                     className="nice-select"
                     options={[
                        { value: "Boston", text: "Boston" },
                        { value: "Tokyo", text: "Tokyo" },
                        { value: "Delhi", text: "Delhi" },
                        { value: "Shanghai", text: "Shanghai" },
                        { value: "Mumbai", text: "Mumbai" },
                        { value: "Bangalore", text: "Bangalore" },
                     ]}
                     defaultCurrent={0}
                     onChange={(e) => handleCityChange(e.target.value)}
                     name="city"
                     placeholder=""
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="zip">Zip Code*</label>
                  <input
                     type="number"
                     placeholder="02115"
                     value={zip}
                     onChange={handleZipChange}
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="state">State*</label>
                  <NiceSelect
                     className="nice-select"
                     options={[
                        { value: "Alabama", text: "Alabama" },
                        { value: "Alaska", text: "Alaska" },
                        { value: "Arizona", text: "Arizona" },
                        { value: "Arkansas", text: "Arkansas" },
                        { value: "California", text: "California" },
                        { value: "Colorado", text: "Colorado" },
                        { value: "Connecticut", text: "Connecticut" },
                        { value: "Delaware", text: "Delaware" },
                        { value: "Florida", text: "Florida" },
                        { value: "Georgia", text: "Georgia" },
                        { value: "Hawaii", text: "Hawaii" },
                        { value: "Idaho", text: "Idaho" },
                        { value: "Illinois", text: "Illinois" },
                        { value: "Indiana", text: "Indiana" },
                        { value: "Iowa", text: "Iowa" },
                        { value: "Kansas", text: "Kansas" },
                        { value: "Kentucky", text: "Kentucky" },
                        { value: "Louisiana", text: "Louisiana" },
                        { value: "Maine", text: "Maine" },
                        { value: "Maryland", text: "Maryland" },
                        { value: "Massachusetts", text: "Massachusetts" },
                        { value: "Michigan", text: "Michigan" },
                        { value: "Minnesota", text: "Minnesota" },
                        { value: "Mississippi", text: "Mississippi" },
                        { value: "Missouri", text: "Missouri" },
                        { value: "Montana", text: "Montana" },
                        { value: "Nebraska", text: "Nebraska" },
                        { value: "Nevada", text: "Nevada" },
                        { value: "New Hampshire", text: "New Hampshire" },
                        { value: "New Jersey", text: "New Jersey" },
                        { value: "New Mexico", text: "New Mexico" },
                        { value: "New York", text: "New York" },
                        { value: "North Carolina", text: "North Carolina" },
                        { value: "North Dakota", text: "North Dakota" },
                        { value: "Ohio", text: "Ohio" },
                        { value: "Oklahoma", text: "Oklahoma" },
                        { value: "Oregon", text: "Oregon" },
                        { value: "Pennsylvania", text: "Pennsylvania" },
                        { value: "Rhode Island", text: "Rhode Island" },
                        { value: "South Carolina", text: "South Carolina" },
                        { value: "South Dakota", text: "South Dakota" },
                        { value: "Tennessee", text: "Tennessee" },
                        { value: "Texas", text: "Texas" },
                        { value: "Utah", text: "Utah" },
                        { value: "Vermont", text: "Vermont" },
                        { value: "Virginia", text: "Virginia" },
                        { value: "Washington", text: "Washington" },
                        { value: "West Virginia", text: "West Virginia" },
                        { value: "Wisconsin", text: "Wisconsin" },
                        { value: "Wyoming", text: "Wyoming" },
                     ]}
                     defaultCurrent={0}
                     onChange={(e) => handleStateChange(e.target.value)}
                     name="state"
                     placeholder=""
                  />
               </div>
            </div>
         </div>
         <div className="col-12">
            <div className="dash-input-wrapper mb-25">
               <div className="map-frame mt-30">
                  <div className="gmap_canvas h-100 w-100">
                     <iframe
                        className="gmap_iframe h-100 w-100"
                        src={mapUrl}
                        title="Google Map"
                     ></iframe>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AddressAndLocation;
