import { useEffect, useState } from "react";
import NiceSelect from "../../../ui/NiceSelect";
import axios from "axios";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const AddressAndLocation = () => {
   const [states, setStates] = useState([]);
   const [cities, setCities] = useState([]);
   const [selectedState, setSelectedState] = useState("");
   const [selectedCity, setSelectedCity] = useState("");
   const [location, setLocation] = useState({ lat: 42.3601, lng: -71.0589 }); // Default to Boston coordinates
   const [address, setAddress] = useState("");

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

   const handleStateChange = async (selectedValue) => {
      setSelectedState(selectedValue);

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
      } catch (error) {
         console.error("Error fetching cities:", error);
      }
   };

   // Google Maps API: Handles location updates from map
   const handleMapClick = (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setLocation({ lat, lng });

      // Reverse geocode to get the address from lat, lng
      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(lat, lng);
      geocoder.geocode({ location: latLng }, (results, status) => {
         if (status === "OK" && results[0]) {
            setAddress(results[0].formatted_address);
         } else {
            console.error("Geocode failed: " + status);
         }
      });
   };

   // Geocode the entered address and update the map
   const handleAddressChange = async (e) => {
      const newAddress = e.target.value;
      setAddress(newAddress);

      if (newAddress.trim() === "") return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: newAddress }, (results, status) => {
         if (status === "OK" && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            setLocation({ lat: lat(), lng: lng() });
         } else {
            console.error("Geocode failed: " + status);
         }
      });
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
                     options={states.map((state) => ({ value: state.name, text: state.name }))}
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
                     options={cities.map((city) => ({ value: city.name, text: city.name }))}
                     onChange={(e) => setSelectedCity(e.target.value)}
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

         {/* Google Map */}
         <div className="map-container mt-40">
            <label>Select Location on Map</label>
            <LoadScript googleMapsApiKey="AIzaSyAkii4DFVqlM4poc0fHnHu0V91xkUVlvjQ">
               <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "400px" }}
                  center={location}
                  zoom={12}
                  onClick={handleMapClick}
               >
                  <Marker position={location} />
               </GoogleMap>
            </LoadScript>
         </div>
      </div>
   );
};

export default AddressAndLocation;
