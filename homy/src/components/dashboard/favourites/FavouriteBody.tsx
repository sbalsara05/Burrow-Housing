import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import FavouriteArea from "./FavouriteArea";

const FavouriteBody = () => {

   return (
      <div className="dashboard-body">
         <div className="position-relative">
            <DashboardHeaderTwo title="Favorites" />
            <FavouriteArea/>
         </div>
      </div>
   )
}

export default FavouriteBody;
