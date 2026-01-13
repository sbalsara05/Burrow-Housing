import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import FavoriteArea from "./FavouriteArea"; // File name still uses Favourite, but component is FavoriteArea
import { useSidebarCollapse } from '../../../hooks/useSidebarCollapse';

const FavoriteBody = () => {
   const isCollapsed = useSidebarCollapse();

   return (
      <div className={`dashboard-body ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
         <div className="position-relative">
            <DashboardHeaderTwo title="Favorites" />
            <FavoriteArea/>
         </div>
      </div>
   )
}

export default FavoriteBody;
