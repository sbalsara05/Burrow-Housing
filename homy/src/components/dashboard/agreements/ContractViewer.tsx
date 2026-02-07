import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../../redux/slices/store';
import {
    fetchContractById,
    signContract,
    recallContract,
    createPaymentIntent,
    type CreatePaymentIntentResponse,
} from '../../../redux/slices/contractSlice';
import SignaturePad from '../../common/SignaturePad';

const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const isTestMode = stripePublishableKey.startsWith('pk_test_');

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: { fontSize: '16px', color: '#32325d', fontFamily: 'sans-serif' },
        invalid: { color: '#fa755a' },
    },
};

function PaymentForm({
    clientSecret,
    amountCents,
    paymentMethod,
    contractId,
    onSuccess,
    onCancel,
    isTestMode = false,
}: {
    clientSecret: string;
    amountCents: number;
    paymentMethod: 'card' | 'ach';
    contractId?: string;
    onSuccess: () => void;
    onCancel: () => void;
    isTestMode?: boolean;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);
        setErrorMessage(null);

        try {
            if (paymentMethod === 'ach') {
                const { error: submitError } = await elements.submit();
                if (submitError) {
                    setErrorMessage(submitError.message || 'Payment validation failed');
                    return;
                }
                const returnUrl = new URL('/dashboard/agreements/payment-complete', window.location.origin);
                if (contractId) returnUrl.searchParams.set('contract', contractId);
                const { error } = await stripe.confirmPayment({
                    elements,
                    clientSecret,
                    confirmParams: {
                        return_url: returnUrl.toString(),
                    },
                    redirect: 'if_required',
                });
                if (error) {
                    setErrorMessage(error.message || 'Payment failed');
                    return;
                }
            } else {
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    setErrorMessage('Payment form not ready. Please try again.');
                    return;
                }
                const { error } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: { card: cardElement },
                });
                if (error) {
                    setErrorMessage(error.message || 'Payment failed');
                    return;
                }
            }

            toast.success('Payment successful.');
            onSuccess();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const amountDollars = (amountCents / 100).toFixed(2);

    return (
        <form onSubmit={handleSubmit} className="border rounded p-4 bg-light">
            <p className="fw-bold mb-2">Amount due: ${amountDollars}</p>
            {isTestMode && (
                <p className="text-info small mb-2">Test mode — no real charges will be made.</p>
            )}
            <div className="mb-3 p-3 bg-white border rounded">
                {paymentMethod === 'ach' ? (
                    <PaymentElement />
                ) : (
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                )}
            </div>
            {errorMessage && <div className="text-danger small mb-2">{errorMessage}</div>}
            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-one" disabled={!stripe || processing}>
                    {processing ? 'Processing…' : 'Pay now'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={processing}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

const ContractViewer = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentContract, isLoading, error, successMessage } = useSelector((state: RootState) => state.contract);
    const { user } = useSelector((state: RootState) => state.auth);

    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [isRecalling, setIsRecalling] = useState(false);
    const [paymentIntent, setPaymentIntent] = useState<CreatePaymentIntentResponse | null>(null);
    const [paymentMethodUsed, setPaymentMethodUsed] = useState<'card' | 'ach'>('card');
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchContractById(id));
        }
    }, [dispatch, id]);

    if (isLoading) return <div className="p-5 text-center">Loading Agreement...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!currentContract) return null;

    // 1. Inject Variables into HTML (variables may be Map or plain object from API)
    const getVar = (key: string) => {
        const v = currentContract.variables as Record<string, string> | undefined;
        if (!v) return undefined;
        return typeof (v as { get?: (k: string) => string }).get === 'function'
            ? (v as { get: (k: string) => string }).get(key)
            : (v as Record<string, string>)[key];
    };
    const filledHtml = currentContract.templateHtml.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return getVar(key.trim()) || `<span class="text-danger">[Missing: ${key}]</span>`;
    });

    // 2. Determine if User needs to sign
    const isTenant = currentContract.tenant._id === user?._id;
    const isLister = currentContract.lister._id === user?._id;

    const needsTenantSign = isTenant && currentContract.status === 'PENDING_TENANT_SIGNATURE';
    const needsListerSign = isLister && currentContract.status === 'PENDING_LISTER_SIGNATURE';
    const canSign = needsTenantSign || needsListerSign;

    const handleSignatureSave = (signatureData: string) => {
        if (id) {
            dispatch(signContract({ id, signatureData }));
            setShowSignatureModal(false);
        }
    };

    const getStatusBadgeClass = () => {
        if (currentContract.status === 'COMPLETED') return 'agreement-status-badge completed';
        if (currentContract.status === 'CANCELLED') return 'agreement-status-badge cancelled';
        return 'agreement-status-badge pending';
    };

    const formatStatus = (s: string) =>
        s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const tenantPaid = currentContract.paymentStatus === 'SUCCEEDED' || currentContract.stripePaymentStatus === 'succeeded';
    const listerPaid = currentContract.listerPaymentStatus === 'SUCCEEDED' || currentContract.listerStripePaymentStatus === 'succeeded';
    const tenantProcessing = currentContract.paymentStatus === 'PROCESSING' || currentContract.stripePaymentStatus === 'processing';
    const listerProcessing = currentContract.listerPaymentStatus === 'PROCESSING' || currentContract.listerStripePaymentStatus === 'processing';
    const bothPaid = tenantPaid && listerPaid;

    return (
        <div className="row mx-0">
            <div className="col-lg-10 m-auto px-3 px-lg-4" style={{ minWidth: 0 }}>
                <div className="bg-white card-box border-20 p-5 agreement-review">

                    {/* Header */}
                    <div className="agreement-review-header d-flex justify-content-between align-items-center mb-4 pb-3">
                        <h2 className="dash-title-three mb-0">Sublease Agreement</h2>
                        <span className={getStatusBadgeClass()}>
                            {formatStatus(currentContract.status)}
                        </span>
                    </div>

                    {successMessage && <div className="agreement-review-success">{successMessage}</div>}

                    {/* Payment complete banner - only when BOTH have paid */}
                    {currentContract.status === 'COMPLETED' && bothPaid && (
                        <div className="agreement-review-success mb-4">
                            Agreement fully complete. Both parties have paid their service fees.
                        </div>
                    )}

                    {/* Document Body */}
                    <div
                        className="agreement-review-doc contract-content mb-5 p-4"
                        dangerouslySetInnerHTML={{ __html: filledHtml }}
                    />

                    {/* Liability Waiver (Hardcoded) */}
                    <div className="agreement-review-waiver fs-sm mb-5">
                        <strong>Liability Waiver:</strong> By signing this agreement, both parties acknowledge that
                        Burrow Housing is strictly a listing platform. Burrow Housing bears no responsibility for
                        property damage, rent disputes, or lease violations. This contract is solely between the
                        Sublessor and the Sublessee.
                    </div>

                    {/* Next Steps (Sublessor - COMPLETED, waiting for tenant to pay) */}
                    {currentContract.status === 'COMPLETED' && isLister && !tenantPaid && (
                        <div className="agreement-review-blurb mb-5">
                            <strong>What&apos;s next:</strong> The sublessee will be prompted to pay their 2.5% service fee. Be on the lookout in your email for any updates.
                        </div>
                    )}

                    {/* Next Steps (Tenant - COMPLETED, tenant paid but waiting for lister to pay) */}
                    {currentContract.status === 'COMPLETED' && isTenant && tenantPaid && !listerPaid && (
                        <div className="agreement-review-blurb mb-5">
                            <strong>What&apos;s next:</strong> You&apos;ve paid your service fee. Waiting for the sublessor to pay their 2.5% service fee. You&apos;ll be notified when the agreement is fully complete.
                        </div>
                    )}

                    {/* Next Steps (Sublessor - COMPLETED, tenant paid, lister needs to pay) */}
                    {currentContract.status === 'COMPLETED' && isLister && tenantPaid && !listerPaid && (
                        <div className="agreement-review-blurb mb-5">
                            <strong>What&apos;s next:</strong> The sublessee has paid. Please pay your 2.5% service fee below to complete the agreement.
                        </div>
                    )}

                    {/* Waiting for Sublessor (Tenant has signed) */}
                    {currentContract.status === 'PENDING_LISTER_SIGNATURE' && isTenant && (
                        <div className="agreement-review-blurb mb-5">
                            <strong>What&apos;s next:</strong> Please wait for the sublessor to countersign. You&apos;ll be notified when the agreement is complete.
                        </div>
                    )}

                    {/* All complete - both paid */}
                    {currentContract.status === 'COMPLETED' && bothPaid && (
                        <div className="agreement-review-blurb agreement-review-blurb-done mb-5">
                            <strong>What&apos;s next:</strong> This agreement is fully complete. You can download your copy from My Agreements.
                        </div>
                    )}

                    {/* Signatures Section */}
                    <div className="row mb-5 agreement-review-signatures">
                        <div className="col-md-6">
                            <p className="fw-bold mb-2">Sublessee Signature:</p>
                            {currentContract.tenantSignature?.url ? (
                                <div className="agreement-review-sig-box signed p-3">
                                    <img src={currentContract.tenantSignature.url} alt="Sublessee Signature" height="60" />
                                    <div className="agreement-review-sig-date mt-2">
                                        Signed: {new Date(currentContract.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ) : (
                                <div className="agreement-review-sig-box waiting p-3">
                                    Waiting for signature...
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <p className="fw-bold mb-2">Sublessor Signature:</p>
                            {currentContract.listerSignature?.url ? (
                                <div className="agreement-review-sig-box signed p-3">
                                    <img src={currentContract.listerSignature.url} alt="Sublessor Signature" height="60" />
                                </div>
                            ) : (
                                <div className="agreement-review-sig-box waiting p-3">
                                    Waiting for signature...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment (both parties; each pays their own fee) */}
                    {currentContract.status === 'COMPLETED' && (
                        <div className="agreement-review-payment mb-5 p-4">
                            <h5 className="mb-3">Payment</h5>
                            {isTenant && !tenantPaid && listerPaid && (
                                <div className="agreement-review-blurb mb-3">
                                    <strong>What&apos;s next:</strong> The sublessor has already paid. Now it&apos;s your turn to complete your service fee.
                                </div>
                            )}
                            {!isTenant && !listerPaid && tenantPaid && (
                                <div className="agreement-review-blurb mb-3">
                                    <strong>What&apos;s next:</strong> The sublessee has already paid. Now it&apos;s your turn to complete your service fee.
                                </div>
                            )}
                            {isTenant ? (
                                tenantPaid ? (
                                    <div>
                                        <div className="agreement-review-payment-done fw-bold mb-3">
                                            ✓ Your service fee has been paid.
                                        </div>
                                        {!listerPaid && (
                                            <div className="alert alert-info mb-0">
                                                <strong>What's next:</strong> Waiting for the sublessor to pay their 2.5% service fee. You'll be notified when the agreement is fully complete.
                                            </div>
                                        )}
                                    </div>
                                ) : tenantProcessing ? (
                                    <div className="alert alert-info mb-0">
                                        <strong>Your bank transfer is processing.</strong> You will be notified when the payment completes. This usually takes 1–3 business days for ACH transfers.
                                    </div>
                                ) : paymentIntent && stripePromise ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
                                        <PaymentForm
                                            clientSecret={paymentIntent.clientSecret}
                                            amountCents={paymentIntent.amountCents}
                                            paymentMethod={paymentMethodUsed}
                                            contractId={id}
                                            isTestMode={isTestMode}
                                            onSuccess={async () => {
                                                setPaymentIntent(null);
                                                if (id) {
                                                    await dispatch(fetchContractById(id));
                                                }
                                            }}
                                            onCancel={() => setPaymentIntent(null)}
                                        />
                                    </Elements>
                                ) : (
                                    <div>
                                        <p className="text-muted small mb-2">
                                            Pay your service fee: 2.5% of rent (+ 1% if paying by card). Rent is paid through your own portals.
                                        </p>
                                        {isTestMode && (
                                            <p className="text-info small mb-2">
                                                <strong>Test mode:</strong> No real charges will be made. Use Stripe test card 4242 4242 4242 4242.
                                            </p>
                                        )}
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            <button
                                                className="btn-one"
                                                disabled={paymentLoading || !stripePublishableKey}
                                                onClick={async () => {
                                                    if (!id) return;
                                                    setPaymentLoading(true);
                                                    try {
                                                        const result = await dispatch(
                                                            createPaymentIntent({ contractId: id, paymentMethod: 'card' })
                                                        ).unwrap();
                                                        setPaymentMethodUsed('card');
                                                        setPaymentIntent(result);
                                                    } catch (err: unknown) {
                                                        const msg = typeof err === 'string' ? err : (err as { message?: string })?.message;
                                                        toast.error(msg || 'Could not start payment');
                                                    } finally {
                                                        setPaymentLoading(false);
                                                    }
                                                }}
                                            >
                                                {paymentLoading ? 'Loading…' : 'Pay by card (2.5% + 1% fee)'}
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary"
                                                disabled={paymentLoading || !stripePublishableKey}
                                                onClick={async () => {
                                                    if (!id) return;
                                                    setPaymentLoading(true);
                                                    try {
                                                        const result = await dispatch(
                                                            createPaymentIntent({ contractId: id, paymentMethod: 'ach' })
                                                        ).unwrap();
                                                        setPaymentMethodUsed('ach');
                                                        setPaymentIntent(result);
                                                    } catch (err: unknown) {
                                                        const msg = typeof err === 'string' ? err : (err as { message?: string })?.message;
                                                        toast.error(msg || 'Could not start payment');
                                                    } finally {
                                                        setPaymentLoading(false);
                                                    }
                                                }}
                                            >
                                                Pay by bank transfer (2.5% only)
                                            </button>
                                        </div>
                                        {!stripePublishableKey && (
                                            <p className="text-warning small mt-2">Stripe is not configured (missing VITE_STRIPE_PUBLISHABLE_KEY).</p>
                                        )}
                                    </div>
                                )
                            ) : (
                                listerPaid ? (
                                    <div>
                                        <div className="agreement-review-payment-done fw-bold mb-3">
                                            ✓ Your service fee has been paid.
                                        </div>
                                        {!tenantPaid && (
                                            <div className="alert alert-info mb-0">
                                                <strong>What's next:</strong> Waiting for the sublessee to pay their 2.5% service fee. You'll be notified when they complete payment.
                                            </div>
                                        )}
                                    </div>
                                ) : listerProcessing ? (
                                    <div className="alert alert-info mb-0">
                                        <strong>Your bank transfer is processing.</strong> You will be notified when the payment completes. This usually takes 1–3 business days for ACH transfers.
                                    </div>
                                ) : paymentIntent && stripePromise ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
                                        <PaymentForm
                                            clientSecret={paymentIntent.clientSecret}
                                            amountCents={paymentIntent.amountCents}
                                            paymentMethod={paymentMethodUsed}
                                            contractId={id}
                                            isTestMode={isTestMode}
                                            onSuccess={async () => {
                                                setPaymentIntent(null);
                                                if (id) {
                                                    await dispatch(fetchContractById(id));
                                                }
                                            }}
                                            onCancel={() => setPaymentIntent(null)}
                                        />
                                    </Elements>
                                ) : (
                                    <div>
                                        <p className="text-muted small mb-2">
                                            Pay your service fee: 2.5% of rent (+ 1% if paying by card). Rent is paid through your own portals.
                                        </p>
                                        {isTestMode && (
                                            <p className="text-info small mb-2">
                                                <strong>Test mode:</strong> No real charges will be made. Use Stripe test card 4242 4242 4242 4242.
                                            </p>
                                        )}
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            <button
                                                className="btn-one"
                                                disabled={paymentLoading || !stripePublishableKey}
                                                onClick={async () => {
                                                    if (!id) return;
                                                    setPaymentLoading(true);
                                                    try {
                                                        const result = await dispatch(
                                                            createPaymentIntent({ contractId: id, paymentMethod: 'card' })
                                                        ).unwrap();
                                                        setPaymentMethodUsed('card');
                                                        setPaymentIntent(result);
                                                    } catch (err: unknown) {
                                                        const msg = typeof err === 'string' ? err : (err as { message?: string })?.message;
                                                        toast.error(msg || 'Could not start payment');
                                                    } finally {
                                                        setPaymentLoading(false);
                                                    }
                                                }}
                                            >
                                                {paymentLoading ? 'Loading…' : 'Pay by card (2.5% + 1% fee)'}
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary"
                                                disabled={paymentLoading || !stripePublishableKey}
                                                onClick={async () => {
                                                    if (!id) return;
                                                    setPaymentLoading(true);
                                                    try {
                                                        const result = await dispatch(
                                                            createPaymentIntent({ contractId: id, paymentMethod: 'ach' })
                                                        ).unwrap();
                                                        setPaymentMethodUsed('ach');
                                                        setPaymentIntent(result);
                                                    } catch (err: unknown) {
                                                        const msg = typeof err === 'string' ? err : (err as { message?: string })?.message;
                                                        toast.error(msg || 'Could not start payment');
                                                    } finally {
                                                        setPaymentLoading(false);
                                                    }
                                                }}
                                            >
                                                Pay by bank transfer (2.5% only)
                                            </button>
                                        </div>
                                        {!stripePublishableKey && (
                                            <p className="text-warning small mt-2">Stripe is not configured.</p>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                        {/* Lister: Edit button when pending tenant signature (recall & edit for negotiations) */}
                        {isLister && currentContract.status === 'PENDING_TENANT_SIGNATURE' && (
                            <button
                                className="btn-two"
                                onClick={async () => {
                                    if (!id) return;
                                    setIsRecalling(true);
                                    try {
                                        await dispatch(recallContract(id)).unwrap();
                                        toast.success('Contract recalled. You can now edit.');
                                        navigate(`/dashboard/agreements/${id}/edit`);
                                    } catch (err) {
                                        toast.error(typeof err === 'string' ? err : (err as { message?: string })?.message || 'Failed to recall');
                                    } finally {
                                        setIsRecalling(false);
                                    }
                                }}
                                disabled={isRecalling}
                            >
                                {isRecalling ? 'Recalling…' : 'Edit Agreement'}
                            </button>
                        )}
                        {canSign && !showSignatureModal && (
                            <button
                                className="btn-one"
                                onClick={() => setShowSignatureModal(true)}
                            >
                                Sign Agreement
                            </button>
                        )}
                    </div>

                    {/* Signature Modal Overlay */}
                    {showSignatureModal && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Sign Document</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowSignatureModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p className="small text-danger mb-3">
                                            By drawing your signature below, you agree to the terms listed in the contract
                                            and the Burrow Housing Liability Waiver.
                                        </p>
                                        <SignaturePad
                                            onSave={handleSignatureSave}
                                            onCancel={() => setShowSignatureModal(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ContractViewer;