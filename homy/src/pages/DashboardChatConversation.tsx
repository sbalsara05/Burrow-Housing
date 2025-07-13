import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardChatConversationMain from '../components/dashboard/chat/conversation'

const DashboardChatConversation = () => {
    return (
        <Wrapper>
            <SEO pageTitle={'Dashboard Chat Conversation - Homy'} />
            <DashboardChatConversationMain />
        </Wrapper>
    );
};

export default DashboardChatConversation;