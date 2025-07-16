import DashboardHeaderOne from "../../../layouts/headers/dashboard/DashboardHeaderOne";
import AccountSettingBody from "./AccountSettingBody";

const DashboardAccountSetting = () => {
   return (
      <>
         <DashboardHeaderOne isActive={false} setIsActive={function (isActive: boolean): void {
            throw new Error("Function not implemented.");
         } } />
         <AccountSettingBody />
      </>
   )
}

export default DashboardAccountSetting;
