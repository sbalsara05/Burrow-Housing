import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardChatMain from '../components/dashboard/chat'

const DashboardChatConversation = () => {
    return (
        <Wrapper>
            <SEO pageTitle="Chat | Burrow Housing" noIndex />
            <DashboardChatMain />
        </Wrapper>
    );
};

export default DashboardChatConversation;