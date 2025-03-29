"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner, faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import VerifyBackground from "../../../../public/images/auth-page-bg.jpg";
import { verifyEmailOtpQuery } from "@/query/auth.query";
import Modal from "@/components/modal";
import withAuth from "@/middlewares/withAuth";

function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // State สำหรับสถานะ Verify สำเร็จ
  const [errorMessage, setErrorMessage] = useState(""); // State สำหรับข้อความ Error
  const [isModalOpen, setIsModalOpen] = useState(false); 

    // ตรวจสอบสิทธิ์การเข้าถึง
    useEffect(() => {
        const isRegistered = sessionStorage.getItem("isRegistered");
        const hasToken = localStorage.getItem("accessToken");
        if (hasToken) return;
        if (!isRegistered && !isVerified) {
          setIsModalOpen(true);
        }
      }, [email, isVerified]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // รีเซ็ตข้อความ Error ก่อนเริ่มตรวจสอบ
    try {
      const response: any = await verifyEmailOtpQuery(email, otp);
      if (response.success) {
        setIsVerified(true); // ตั้งค่าเป็น Verified
        sessionStorage.removeItem("isRegistered"); // ลบ isRegistered ออกจาก Session Storage หลัง verify สำเร็จแล้ว ป้องกันไม่ให้ user เข้าถึงหน้านี้ได้อีก
        toast.success(response.message || "Email verified successfully!");
        setTimeout(() => router.push("/auth/login"), 2000); // Redirect to login after success
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setErrorMessage("Invalid OTP. Please try again."); // กำหนดข้อความ Error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${VerifyBackground.src})`,
      }}
    >
      <Toaster position="top-right" />
      <Modal
        isOpen={isModalOpen}
        onClose={() => router.push("/auth/login")}
        title="Access Restricted"
        message="This page is no longer accessible after email verification. Please log in to continue."
        confirmText="Go to Login"
        onConfirmFetch={() => router.push("/auth/login")}
        icon={faExclamationTriangle}
        iconColor="text-white"
        actionType="delete"
        isExpired={true}
      />
      
      {/* Container */}
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-lg rounded-2xl p-8 max-w-md w-full">
        {/* ตรวจสอบสถานะว่า Verified หรือไม่ */}
        {isVerified ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  size="5x"
                  className="text-green-500"
                />
            </div>
            <h1 className="text-2xl font-bold text-green-500 mb-2">
              Email Verified Successfully!
            </h1>
            <p className="text-sm text-gray-400">
              Redirecting you to the login page...
            </p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#0066FF] py-5 px-6 rounded-3xl shadow-sm">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  size="2xl"
                  className="text-white"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#0066FF] mb-2 text-center">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-400 mb-6 text-center">
              Enter the OTP sent to your registered email address.
            </p>

            {/* Form */}
            <form onSubmit={handleVerify}>
              {/* OTP Input */}
              <div className="mb-4">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter your OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    maxLength={6}
                    className={`w-full border rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring uppercase${
                      errorMessage ? "border-red-500" : "focus:border-blue-500"
                    } text-gray-700 placeholder-gray-500`}
                    style={{ textTransform: 'uppercase' }}
                    disabled={isLoading}
                  />
                </div>
                {/* Error Message */}
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all ${
                  isLoading || otp.length !== 6 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    Verifying...
                    <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(VerifyEmailPage);