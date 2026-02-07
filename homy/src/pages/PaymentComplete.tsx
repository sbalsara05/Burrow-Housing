import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Landing page after Stripe redirects (e.g. ACH bank verification).
 * Shows success and redirects to My Agreements.
 */
const PaymentComplete = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('redirect_status');
        const contractId = params.get('contract');
        if (status === 'succeeded') {
            toast.success('Payment successful.');
        } else if (status === 'processing') {
            toast.info('Payment is processing. You will be notified when it completes.');
        }
        // Redirect to the contract viewer if we have the contract ID, so user sees the update
        if (contractId) {
            navigate(`/dashboard/agreements/${contractId}/sign`, { replace: true });
        } else {
            navigate('/dashboard/my-agreements', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="p-5 text-center">
            <p>Completing your payment…</p>
        </div>
    );
};

export default PaymentComplete;
