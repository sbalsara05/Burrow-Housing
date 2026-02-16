import React from 'react';
import { Link } from 'react-router-dom';
import { useChannelStateContext, useChatContext } from 'stream-chat-react';
import { useSelector } from 'react-redux';
import { useContractByChat } from '../../../hooks/useContractByChat';
import { selectCurrentProperty } from '../../../redux/slices/propertySlice';
import { selectCurrentUser } from '../../../redux/slices/authSlice';

const ChatAgreementBanner: React.FC = () => {
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();
    const currentUser = useSelector(selectCurrentUser);
    const property = useSelector(selectCurrentProperty);

    const propertyId = (channel?.data?.propertyId as string) || null;
    const listerId = (channel?.data?.listerId as string) || null;
    const effectiveListerId = listerId || (property?.userId as string) || null;

    const members = channel ? Object.values(channel.state?.members || {}).filter(
        ({ user }) => user?.id !== client.userID
    ) : [];
    const counterpartyId = members.length > 0 ? (members[0] as { user?: { id?: string } }).user?.id : null;

    const contract = useContractByChat(propertyId, counterpartyId);
    const isLister = Boolean(effectiveListerId && currentUser?._id && String(currentUser._id) === String(effectiveListerId));

    // Lister reminder when no contract exists yet (gentle prompt to draft)
    if (contract === null && isLister && propertyId && counterpartyId) {
        return (
            <div className="chat-agreement-banner chat-agreement-banner--action">
                <span>Ready to formalize? Draft an agreement when you&apos;re ready — use the &quot;Draft Contract&quot; button above.</span>
            </div>
        );
    }

    if (contract === undefined || !contract) return null;

    const linkTo = `/dashboard/agreements/${contract._id}/sign`;

    const isActionNeeded =
        (isLister && contract.status === 'PENDING_LISTER_SIGNATURE') ||
        (!isLister && contract.status === 'PENDING_TENANT_SIGNATURE') ||
        (isLister && contract.status === 'DRAFT');

    let message: React.ReactNode;

    if (contract.status === 'COMPLETED') {
        message = <>This agreement is complete. <Link to={linkTo}>View →</Link></>;
    } else if (isLister) {
        if (contract.status === 'DRAFT') {
            message = <>You have a draft agreement. <Link to={`/dashboard/agreements/${contract._id}/edit`}>Edit & Send →</Link></>;
        } else if (contract.status === 'PENDING_TENANT_SIGNATURE') {
            message = <>Waiting for sublessee to sign. <Link to={linkTo}>View →</Link></>;
        } else if (contract.status === 'PENDING_LISTER_SIGNATURE') {
            message = <>Sublessee has signed — countersign now. <Link to={linkTo}>Review & Sign →</Link></>;
        } else {
            return null;
        }
    } else {
        if (contract.status === 'PENDING_TENANT_SIGNATURE') {
            message = <>Your subletter sent a sublease agreement. <Link to={linkTo}>Review & Sign →</Link></>;
        } else if (contract.status === 'PENDING_LISTER_SIGNATURE') {
            message = <>Waiting for subletter to countersign. <Link to={linkTo}>View →</Link></>;
        } else if (contract.status === 'DRAFT') {
            return null; // Sublessee can't act on draft yet
        } else {
            return null;
        }
    }

    return (
        <div className={`chat-agreement-banner ${isActionNeeded ? 'chat-agreement-banner--action' : ''}`}>
            <span>{message}</span>
        </div>
    );
};

export default ChatAgreementBanner;
