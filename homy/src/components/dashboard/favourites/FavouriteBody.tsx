import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import FavoriteArea from "./FavouriteArea"; // File name still uses Favourite, but component is FavoriteArea

const FavoriteBody = () => {

   return (
      <div className="dashboard-body">
         <div className="position-relative">
            <DashboardHeaderTwo title="Favorites" />
            <FavoriteArea/>
         </div>
      </div>
   )
}

export default FavoriteBody;
