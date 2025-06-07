import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne"
import ReviewBody from "./ReviewBody"

const DashboardReview = () => {
  return (
    <>
         <DashboardHeaderOne isActive={false} setIsActive={() => {}}/>
         <ReviewBody />
    </>
  )
}

export default DashboardReview
