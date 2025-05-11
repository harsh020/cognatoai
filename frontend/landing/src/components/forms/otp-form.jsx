"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {cn, range} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  // InputOTPSeparator, // Keep if you want a visual separator
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/loader";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "sonner";
import {sendOtp, verifyEmail} from "@/store/user/actions";

// --- Configuration ---
const RESEND_COOLDOWN_SECONDS = 60; // Cooldown duration
const MAX_RESEND_ATTEMPTS = 3;     // Max number of resends allowed
const OTP_LENGTH = 6;

export function OtpForm({
  email,
  className,
  onGoBack,
  ...props
}) {
  const dispatch = useDispatch();

  const [otpValue, setOtpValue] = useState("");

  // --- Resend Logic State ---
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef(null);

  const { error, loading, user: verifiedUser } = useSelector(state => state.verifyEmail);
  const { error: resendError, loading: resendLoading, otp } = useSelector(state => state.sendOtp);

  // --- Cleanup interval on component unmount ---
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // --- Cooldown Timer Effect ---
  useEffect(() => {
    if (cooldown > 0) {
      intervalRef.current = setInterval(() => {
        setCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup function for this effect instance
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cooldown]); // Rerun effect when cooldown changes

  // --- Check if resend is allowed ---
  const canResend = resendAttempts < MAX_RESEND_ATTEMPTS && cooldown === 0 && true; // add loading for resend here
  const resendLimitReached = resendAttempts >= MAX_RESEND_ATTEMPTS;

  // --- Handlers ---

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otpValue.length < OTP_LENGTH) {
      toast.error('Invalid OTP')
      return;
    }

    // dispatch action
    dispatch(verifyEmail({
      'email': email,
      'otp': otpValue
    }));
  };

  const handleResendClick = (e) => {
    e.preventDefault();
    if (!canResend) return; // Exit if not allowed to resend

    // dispatch action
    dispatch(sendOtp({
      'email': user.email,
    }));
  }; // Recalculate if canResend changes

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/* --- Add Back Button conditionally if onGoBack exists --- */}
        <div className='flex flex-row w-full my-auto gap-4'>
          {onGoBack && (
            <Button
              variant="ghost" // Use ghost or link for less emphasis
              size="icon"
              type="button" // Important: prevent form submission
              onClick={onGoBack}
              disabled={false}
              className="rounded-full my-auto" // Position top-left relative to parent container (adjust if needed)
              aria-label="Go back to sign up"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className='flex flex-col'>
            <h1 className="text-2xl font-bold pt-8 md:pt-4">Verify your Email</h1> {/* Added padding top if back button present */}
            <p className="text-balance text-sm text-muted-foreground">
              Enter the {OTP_LENGTH}-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4">
        {/* Display Verification or Resend Errors */}

        {/* OTP Input */}
        <div className="grid gap-2">
          <InputOTP
            id="otp-input"
            maxLength={OTP_LENGTH}
            value={otpValue}
            onChange={(value) => {
              setOtpValue(value);
            }}
            disabled={false}
            autoFocus
          >
            <InputOTPGroup className="w-full justify-between">
              {
                range(OTP_LENGTH).map(index => (
                  <InputOTPSlot key={index} index={index} className='rounded-lg border p-4 text-2xl h-12 w-12' />
                ))
              }
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || otpValue.length < OTP_LENGTH}
        >
          {
            loading ? (
              <Loader />
            ) : (
              "Submit"
            )
          }
        </Button>

        {/* Resend OTP Section */}
        <div className="text-center text-sm">
          {resendLimitReached ? (
            <span className="text-muted-foreground">
              Maximum resend attempts reached.
            </span>
          ) : (
            <>
              <span className="text-muted-foreground">
                Didn't receive the code?{" "}
              </span>
              <Button
                variant="link"
                type="button"
                onClick={handleResendClick}
                disabled={!canResend} // Disable based on calculated state
                className={cn(
                  "h-auto p-0 font-medium",
                  !canResend && "cursor-not-allowed text-muted-foreground/80"
                )}
              >
                {resendLoading ? (
                  <Loader />
                ) : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend OTP"}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}