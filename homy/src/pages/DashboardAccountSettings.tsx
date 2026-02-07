import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardAccountSettingsMain from '../components/dashboard/account-settings'

const DashboardAccountSettings = () => {
   return (
      <Wrapper>
         <SEO pageTitle="Account Settings | Burrow Housing" noIndex />
         <DashboardAccountSettingsMain />
      </Wrapper>
   );
};

export default DashboardAccountSettings;