import { useEffect, useState } from "react";
import NiceSelect from "../../../ui/NiceSelect";
import axios from "axios";

const AddressAndLocation = ({ location, setLocation }) => {
   const [states, setStates] = useState([]);
   const [cities, setCities] = useState([]);
   const [selectedState, setSelectedState] = useState("");
   const [selectedCity, setSelectedCity] = useState("");
   const [address, setAddress] = useState("");
   const [zipCode, setZipCode] = useState("");
   const [mapUrl, setMapUrl] = useState("");

   // Fetch U.S. states on component mount
   useEffect(() => {
      const fetchStates = async () => {
         try {
            const config = {
               method: 'post',
               url: 'https://countriesnow.space/api/v0.1/countries/states',
               headers: { 'Content-Type': 'application/json' },
               data: JSON.stringify({ country: "United States" }),
            };
            const response = await axios(config);
            const stateData = response.data.data.states.map((state) => ({
               name: state.name,
               state_code: state.state_code,
            }));
            setStates(stateData);
         } catch (error) {
            console.error("Error fetching states:", error);
         }
      };
      fetchStates();
   }, []);

   // Generate Google Maps embed URL based on full address
   const generateMapUrl = async (fullAddress) => {
      if (!fullAddress.trim()) return "";

      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://www.google.com/maps/embed/v1/place?q=${encodedAddress}&key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ`;

      try {
         // Attempt to geocode the address to get lat/lng
         const geocodeResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ`);

         if (geocodeResponse.data.results.length > 0) {
            const location = geocodeResponse.data.results[0].geometry.location;
            setLocation({ lat: location.lat, lng: location.lng });
         }
      } catch (error) {
         console.error("Error geocoding address:", error);
      }

      return url;
   };

   // Handle state change
   const handleStateChange = async (selectedValue) => {
      setSelectedState(selectedValue);
      // Reset city when state changes
      setCities([]);
      setSelectedCity("");

      // Fetch cities for the selected state
      try {
         const config = {
            method: 'post',
            url: 'https://countriesnow.space/api/v0.1/countries/state/cities',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ country: "United States", state: selectedValue }),
         };

         const response = await axios(config);
         const cityData = response.data.data.map((city) => ({
            name: city,
         }));
         setCities(cityData);

         // Update map if we have a complete address
         updateMapLocation();
      } catch (error) {
         console.error("Error fetching cities:", error);
      }
   };

   // Handle city change
   const handleCityChange = (selectedValue) => {
      setSelectedCity(selectedValue);
      updateMapLocation();
   };

   // Handle address change
   const handleAddressChange = (e) => {
      const newAddress = e.target.value;
      setAddress(newAddress);
      updateMapLocation();
   };

   // Handle zip code change
   const handleZipCodeChange = (e) => {
      const newZipCode = e.target.value;
      setZipCode(newZipCode);
      updateMapLocation();
   };

   // Update map location based on current inputs
   const updateMapLocation = async () => {
      // Construct full address
      const fullAddress = `${address ? address + ', ' : ''}${selectedCity ? selectedCity + ', ' : ''}${selectedState ? selectedState + ', ' : ''}${zipCode ? zipCode : ''} United States`;

      if (fullAddress.trim() !== '') {
         const url = await generateMapUrl(fullAddress);
         setMapUrl(url);
      }
   };

   return (
      <div className="bg-white card-box border-20 mt-40">
         <h4 className="dash-title-three">Address</h4>
         <div className="row">
            <div className="col-12">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Address*</label>
                  <input
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={handleAddressChange}
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">State*</label>
                  <NiceSelect
                      className="nice-select"
                      options={states.map((state) => ({value: state.name, text: state.name}))}
                      onChange={(e) => handleStateChange(e.target.value)}
                      placeholder="Select State"
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">City*</label>
                  <input
                      type="text"
                      placeholder="Enter City"
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!selectedState}
                  />
               </div>
            </div>
            <div className="col-lg-3">
               <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Zip Code*</label>
                  <input
                      type="text"
                      placeholder="12345"
                      value={zipCode}
                      onChange={handleZipCodeChange}
                  />
               </div>
            </div>
         </div>

         {/* Google Map iframe */}
         <div className="map-container mt-40">
            <label>Select Location on Map</label>
            {mapUrl && (
                <iframe
                    className="gmap_iframe h-200 w-100"
                    src={mapUrl}
                    title="Google Map"
                    width="100%"
                  height="400px"
                  style={{ border: 0 }}
                  allowFullScreen
               ></iframe>
            )}
         </div>
      </div>
   );
};

export default AddressAndLocation;