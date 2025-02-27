"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faRightToBracket, faSpinner, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import LoginBackground from "../../../../public/images/register-page-bg-2.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = email && password
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Please enter your email");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Please enter your password");
    } else if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    }else {
        setPasswordError("");
      }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate inputs before submitting
    validateEmail(email);
    validatePassword(password);

    // Mock API Call
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      toast.success("Login Successful!", { duration: 1000 });
      setTimeout(() => router.push("/exam"), 1000); // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid email or password", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/auth/register"); 
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${LoginBackground.src})`,
      }}
    >
      <Toaster position="top-right" />
      <div className="bg-gradient-to-br from-white to-gray-100 shadow-lg rounded-2xl p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#0066FF] py-5 px-6 rounded-3xl shadow-sm">
            <FontAwesomeIcon icon={faRightToBracket} size="2xl" className="text-white" />
          </div>
        </div>
  
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#0066FF] mb-2 text-center">Sign in with email</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Enter your email and password to access your account.
        </p>
  
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`shadow-sm border rounded-lg w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-xs italic mt-1">{emailError}</p>
            )}
          </div>
  
          {/* Password */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`shadow-sm border rounded-lg w-full py-2 pl-10 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                disabled={isLoading}
              />
              {/* Show/Hide Password Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-gray-400" />
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs italic mt-1">{passwordError}</p>
            )}
          </div>
  
          {/* Forgot Password */}
          {/* <div className="mb-4 text-right">
            <a href="/auth/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div> */}
  
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 ${
              isLoading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                Logging in...
                <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
              </>
            ) : (
              "Get Started"
            )}
          </button>
        </form>
  
        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <span onClick={handleSignUp} className="text-blue-500 hover:underline cursor-pointer">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}  