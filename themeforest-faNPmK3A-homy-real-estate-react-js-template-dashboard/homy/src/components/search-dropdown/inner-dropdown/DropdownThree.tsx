
import { Link } from "react-router-dom"
import NiceSelect from "../../../ui/NiceSelect"
import ListingDropdownModal from "../../../modals/ListingDropdownModal"

const DropdownThree = ({
   handleBathroomChange,
   handleBedroomChange,
   handleSearchChange,
   handlePriceChange,
   maxPrice,
   priceValue,
   handleResetFilter,
   selectedAmenities,
   handleAmenityChange,
   handleLocationChange,
   handleStatusChange,
   handlePriceDropChange }: any) => {
   return (
      <>
         <form onSubmit={(e) => e.preventDefault()}>
            <div className="row gx-0 align-items-center">
               <div className="col-xxl-2 col-xl-3 col-lg-4">
                  <div className="input-box-one border-left">
                     <div className="label">I’m looking to...</div>
                     <NiceSelect className="nice-select fw-normal"
                        options={[
                           { value: "apartments", text: "Buy Apartments" },
                           { value: "condos", text: "Rent Condos" },
                           { value: "houses", text: "Sell Houses" },
                           { value: "industrial", text: "Rent Industrial" },
                           { value: "villas", text: "Sell Villas" },
                        ]}
                        defaultCurrent={0}
                        onChange={handleStatusChange}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-xl-3 col-lg-4">
                  <div className="input-box-one border-left">
                     <div className="label">Location</div>
                     <NiceSelect className="nice-select location fw-normal"
                        options={[
                           { value: "washington", text: "Washington DC" },
                           { value: "mexico", text: "Acapulco, Mexico" },
                           { value: "germany", text: "Berlin, Germany" },
                           { value: "france", text: "Cannes, France" },
                           { value: "india", text: "Delhi, India" },
                           { value: "giza", text: "Giza, Egypt" },
                           { value: "cuba", text: "Havana, Cuba" },
                        ]}
                        defaultCurrent={0}
                        onChange={handleLocationChange}
                        name=""
                        placeholder="" />
                  </div>
               </div>
               <div className="col-xl-3 col-lg-4">
                  <div className="input-box-one border-left border-lg-0">
                     <div className="label">Price Range</div>
                     <NiceSelect
                        className="nice-select fw-normal"
                        options={[
                           { value: "1", text: "$10,000 - $200,000" },
                           { value: "2", text: "$20,000 - $300,000" },
                           { value: "3", text: "$30,000 - $400,000" },
                        ]}
                        defaultCurrent={0}
                        onChange={(event) => handlePriceDropChange(event.target.value)}
                        name=""
                        placeholder=""
                     />
                  </div>
               </div>
               <div className="col-xxl-4 col-xl-3">
                  <div className="input-box-one lg-mt-20">
                     <div className="d-flex align-items-center justify-content-center">
                        <Link to="#" data-bs-toggle="modal" data-bs-target="#advanceFilterModal" className="search-modal-btn tran3s text-uppercase fw-500 d-inline-flex align-items-center me-3">
                           <span className="d-xl-none d-xxl-block">ADVANCE Search</span>
                           <i className="fa-light fa-sliders-up"></i>
                        </Link>
                        <button className="fw-500 text-uppercase tran3s search-btn-four">
                           <span>Search</span>
                           <i className="fa-light fa-magnifying-glass"></i>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </form>
         <ListingDropdownModal
            handleSearchChange={handleSearchChange}
            handleBedroomChange={handleBedroomChange}
            handleBathroomChange={handleBathroomChange}
            handlePriceChange={handlePriceChange}
            maxPrice={maxPrice}
            priceValue={priceValue}
            handleResetFilter={handleResetFilter}
            selectedAmenities={selectedAmenities}
            handleAmenityChange={handleAmenityChange}
            handleLocationChange={handleLocationChange}
            handleStatusChange={handleStatusChange}
         />
      </>
   )
}

export default DropdownThree
