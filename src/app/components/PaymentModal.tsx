"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api, { paymentAPI } from "@/lib/api";
import { TokenData, User } from "@/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  idToken: string;
  membership?: "free" | "pro";
  userEmail: string;
  setUser: (user: User) => void;
  setTokenData: (tokenData: TokenData | null) => void;
  initialMode?: "subscription" | "tokens" | "cancellation" | "updateMethod";
  subscriptionActive?: boolean | null;
}

export default function PaymentModal({
  isOpen,
  onClose,
  idToken,
  membership,
  userEmail,
  setUser,
  setTokenData,
  initialMode = "subscription",
  subscriptionActive,
}: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"subscription" | "tokens" | "cancellation" | "updateMethod">(
    initialMode,
  );
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(
    null,
  );
  const [setupLoading, setSetupLoading] = useState(false);

  const refetchUser = async () => {
    if (userEmail && idToken) {
      try {
        const response = await api.user.getUser(userEmail, idToken);
        console.log("refetch user response: ", { response });
        setUser(response);
      } catch (err) {
        console.error("Failed to refetch user data:", err);
      }
    }
  };

  const refetchTokenData = async () => {
    if (userEmail && idToken) {
      try {
        const tokenUsage = await api.user.getTokenUsage(userEmail, idToken);
        setTokenData(tokenUsage);
      } catch (err) {
        console.error("Failed to refetch token data:", err);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
      setShowUpdatePayment(false);
      setSetupClientSecret(null);
      return;
    }

    // Set mode from initialMode when modal opens
    setMode(initialMode);
    console.log({mode})
    console.log({loading})
    console.log({error})

    const fetchClientSecret = async () => {
      setLoading(true);
      setError(null);

      try {
        if (mode === "subscription" || mode === "cancellation") {
          console.log("Creating subscription with idToken:", idToken);
          const result = await paymentAPI.createSubscription(idToken);
          if (result) {
            console.log("Received client secret:", result.client_secret);
            setClientSecret(result.client_secret);
          }
        } else if (mode === "tokens") {
          const tokenAmount = 200000;
          console.log(
            "Buying tokens with idToken:",
            idToken,
            "and token amount of ",
            tokenAmount,
          );
          const result = await paymentAPI.buyTokens(
            {
              token_amount: tokenAmount,
            },
            idToken,
          );
          if (result) setClientSecret(result.client_secret);
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment");
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [isOpen, mode, idToken]);

  const handleUpdatePaymentClick = async () => {
    if (showUpdatePayment) {
      setShowUpdatePayment(false);
      setSetupClientSecret(null);
      return;
    }
    setSetupLoading(true);
    try {
      const result = await paymentAPI.createSetupIntent(idToken);
      if (result) {
        setSetupClientSecret(result.client_secret);
        setShowUpdatePayment(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment method update");
    } finally {
      setSetupLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.04, ease: "easeOut" }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[90vh] z-50 overflow-y-auto"
          >
            <div className="bg-background rounded-2xl shadow-2xl border border-base-10 overflow-hidden">
              <div className="p-6">
                {loading && (
                  <div className="flex flex-col gap-6 items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-base-20 border-t-primary-text rounded-full animate-spin" />
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {(mode == "tokens" ||
                  (membership == "free" && !loading && !error)) &&
                  clientSecret && (
                    <Elements
                      key={clientSecret}
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            borderRadius: "10px",
                            fontFamily: "inherit",
                          },
                        },
                      }}
                    >
                      <CheckoutForm
                        onClose={onClose}
                        refetchUser={refetchUser}
                        refetchTokenData={refetchTokenData}
                      />
                    </Elements>
                  )}
                {mode == "subscription" && membership === "pro" && !loading && (
                  <div className="mt-4">
                    {!showUpdatePayment && (
                      <button
                        type="button"
                        onClick={handleUpdatePaymentClick}
                        disabled={setupLoading}
                        className="bg-zinc-700 p-4 w-full py-3 px-4 bg-transparent border border-base-10 text-text-70 dark:text-text-30 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {setupLoading ? "Loading..." : "Change Payment Method"}
                      </button>
                    )}
                    {showUpdatePayment && setupClientSecret && (
                      <div className="bg-zinc-700 p-4 rounded-xl">
                        <Elements
                          key={setupClientSecret}
                          stripe={stripePromise}
                          options={{
                            clientSecret: setupClientSecret,
                            appearance: {
                              theme: "stripe",
                              variables: {
                                borderRadius: "10px",
                                fontFamily: "inherit",
                              },
                            },
                          }}
                        >
                          <UpdatePaymentMethodForm
                            onClose={() => {
                              setShowUpdatePayment(false);
                              setSetupClientSecret(null);
                            }}
                            idToken={idToken}
                          />
                        </Elements>
                      </div>
                    )}
                  </div>
                )}
                {mode == "subscription" &&
                  membership === "pro" &&
                  !loading &&
                  !error &&
                  clientSecret && (
                    <Elements
                      key={clientSecret}
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            borderRadius: "10px",
                            fontFamily: "inherit",
                          },
                        },
                      }}
                    >
                      <ResumptionForm
                        onClose={onClose}
                        idToken={idToken}
                        refetchUser={refetchUser}
                        refetchTokenData={refetchTokenData}
                      />
                    </Elements>
                  )}
                {mode === "cancellation" &&
                  clientSecret &&
                  !loading &&
                  !error && (
                    <Elements
                      key={clientSecret}
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            borderRadius: "10px",
                            fontFamily: "inherit",
                          },
                        },
                      }}
                      >
                      <CancellationForm
                        onClose={onClose}
                        idToken={idToken}
                        refetchUser={refetchUser}
                        refetchTokenData={refetchTokenData}
                      />
                    </Elements>
                  )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  function CheckoutForm({
    onClose,
    refetchUser,
    refetchTokenData,
  }: {
    onClose: () => void;
    refetchUser: () => void;
    refetchTokenData: () => void;
  }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setSubmitting(true);
      setError(null);

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setSubmitting(false);
      } else {
        setSuccess(true);
        setSubmitting(false);
        setTimeout(() => {
          refetchUser();
          refetchTokenData();
          setSuccess(false);
        }, 5000);
      }
    };

    if (success) {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-text">
            Payment successful
          </h3>
          <p className="mt-1 text-sm text-text-70 dark:text-text-30">
            Your account has been updated.
          </p>
          <button
            onClick={onClose}
            className="mt-4 py-2.5 px-6 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200"
          >
            Done
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: "always",
              spacedAccordionItems: false,
            },
          }}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        {!loading && (
          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={!stripe || submitting}
              className="w-full py-3 px-4 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : "Pay now"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full py-3 px-4 bg-transparent text-text-70 dark:text-text-30 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    );
  }

  function CancellationForm({
    onClose,
    idToken,
    refetchUser,
    refetchTokenData,
  }: {
    onClose: () => void;
    idToken: string;
    refetchUser: () => void;
    refetchTokenData: () => void;
  }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [periodEnd, setPeriodEnd] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setSubmitting(true);
      setError(null);

      try {
        const result = await paymentAPI.cancelSubscription(idToken);
        if (result) {
          setSuccess(true);
          setPeriodEnd(result.active_until);
          setTimeout(() => {
            refetchUser();
            refetchTokenData();
            setSuccess(false);
          }, 5000);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to cancel subscription.");
      } finally {
        setSubmitting(false);
      }
    };

    if (success && periodEnd) {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-text">
            Cancellation successful
          </h3>
          <p className="mt-1 text-sm text-text-70 dark:text-text-30">
            You will keep Pro membership privileges until{" "}
            {new Date(periodEnd).toLocaleString()}.
          </p>
          <button
            onClick={onClose}
            className="mt-4 py-2.5 px-6 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200"
          >
            Done
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={!stripe || submitting}
            className="w-full py-3 px-4 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Cancel Pro Subscription"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-3 px-4 bg-transparent text-text-70 dark:text-text-30 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </form>
    );
  }

  function ResumptionForm({
    onClose,
    idToken,
    refetchUser,
    refetchTokenData,
  }: {
    onClose: () => void;
    idToken: string;
    refetchUser: () => void;
    refetchTokenData: () => void;
  }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setSubmitting(true);
      setError(null);

      try {
        const result = await paymentAPI.resumeSubscription(idToken);
        if (result) {
          setSuccess(true);
          setTimeout(() => {
            refetchUser();
            refetchTokenData();
            setSuccess(false);
          }, 5000);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to resume subscription.");
      } finally {
        setSubmitting(false);
      }
    };

    if (success) {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-text">
            Cancellation reverted
          </h3>
          <p className="mt-1 text-sm text-text-70 dark:text-text-30">
            Your Pro subscription has been continued.
          </p>
          <button
            onClick={onClose}
            className="mt-4 py-2.5 px-6 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200"
          >
            Done
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={!stripe || submitting || !!subscriptionActive}
            className="w-full py-3 px-4 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Resume Pro Subscription"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-3 px-4 bg-transparent text-text-70 dark:text-text-30 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </form>
    );
  }

  function UpdatePaymentMethodForm({
    onClose,
    idToken,
  }: {
    onClose: () => void;
    idToken: string;
  }) {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setSubmitting(true);
      setError(null);

      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Failed to save payment method");
        setSubmitting(false);
        return;
      }

      if (setupIntent?.payment_method) {
        try {
          await paymentAPI.updatePaymentMethod(
            setupIntent.payment_method as string,
            idToken,
          );
          setSuccess(true);
          setTimeout(() => onClose(), 5000);
        } catch (err: any) {
          setError(err?.message || "Failed to update payment method");
        } finally {
          setSubmitting(false);
        }
      }
    };

    if (success) {
      return (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-text">
            Payment method updated
          </h3>
          <p className="mt-1 text-sm text-text-70 dark:text-text-30">
            Your subscription will use the new payment method going forward.
          </p>
          <button
            onClick={onClose}
            className="mt-4 py-2.5 px-6 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200"
          >
            Done
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: "always",
              spacedAccordionItems: false,
            },
          }}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={!stripe || submitting}
            className="w-full py-3 px-4 bg-primary-text text-secondary-text font-medium rounded-full hover:bg-text-80 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Payment Method"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-3 px-4 bg-transparent text-text-70 dark:text-text-30 font-medium rounded-full hover:bg-base-10 cursor-pointer transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }
}
