import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardChatMain from '../components/dashboard/chat'

const DashboardChatConversation = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Dashboard Chat Conversation - Burrow'} />
            <DashboardChatMain />
        </Wrapper>
    );
};

export default DashboardChatConversation;