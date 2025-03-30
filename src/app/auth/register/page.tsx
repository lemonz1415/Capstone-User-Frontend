"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faSpinner,
  faUser,
  faLock,
  faEnvelope,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import RegisterBackground from "../../../../public/images/auth-page-bg.jpg";
import RegisterBannerBackground from "../../../../public/images/register-bg.jpg";
import { registerUserQuery } from "@/query/auth.query";
import withAuth from "@/middlewares/withAuth";
import Image from "next/image";

const RegisterBG = () => (
  <div className="absolute inset-0">
    <Image
      src={RegisterBackground}
      alt="Heading Background"
      fill
      style={{ objectFit: "cover" }}
    />
  </div>
);

const RegisterBannerBG = () => (
  <div className="absolute inset-0 w-[500px] rounded-tl-2xl rounded-bl-2xl">
    <Image
      src={RegisterBannerBackground}
      alt="Heading Background"
      fill
      style={{ objectFit: "cover" }}
    />
  </div>
);

function RegisterPage() {
  const router = useRouter();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dobError, setDobError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [firstnameFocused, setFirstnameFocused] = useState(false);
  const [lastnameFocused, setLastnameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [dobFocused, setDobFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateFirstname = (value: string) => {
    if (!value && firstnameFocused) {
      setFirstnameError("Please enter your first name");
    } else {
      setFirstnameError("");
    }
  };

  const validateLastname = (value: string) => {
    if (!value && lastnameFocused) {
      setLastnameError("Please enter your last name");
    } else {
      setLastnameError("");
    }
  };

  const validateEmail = useCallback(
    (value: string) => {
      if (!value && emailFocused) {
        setEmailError("Please enter your email");
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    },
    [emailFocused]
  );

  const validateDob = useCallback(
    (value: string) => {
      if (!value && dobFocused) {
        setDobError("Please select your date of birth");
      } else {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        if (selectedDate > currentDate) {
          setDobError("Date of Birth cannot be in the future");
        } else {
          setDobError("");
        }
      }
    },
    [dobFocused]
  );

  const validatePassword = useCallback(
    (value: string) => {
      let error = "";
      if (!value && passwordFocused) {
        error = "Please enter your password";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters long";
      } else if (!/[A-Z]/.test(value)) {
        error = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(value)) {
        error = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(value)) {
        error = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9\s]/.test(value)) {
        error = "Password must contain at least one special character";
      }
      setPasswordError(error);
      return error;
    },
    [passwordFocused]
  );

  const validateConfirmPassword = useCallback(
    (value: string) => {
      if (!value && confirmPasswordFocused) {
        setConfirmPasswordError("Please confirm your password");
      } else if (value !== password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    },
    [confirmPasswordFocused, password]
  );

  const isFormValid =
    firstname &&
    lastname &&
    email &&
    dob &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    !firstnameError &&
    !lastnameError &&
    !emailError &&
    !dobError &&
    !passwordError &&
    !confirmPasswordError;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    maxLength: number,
    fieldName: string
  ) => {
    const target = e.target as HTMLInputElement;
    if (
      target.value.length >= maxLength &&
      e.key !== "Backspace" &&
      e.key !== "Delete"
    ) {
      e.preventDefault();
      if (fieldName === "Firstname") {
        setFirstnameError("Firstname cannot exceed 30 characters");
      } else if (fieldName === "Lastname") {
        setLastnameError("Lastname cannot exceed 30 characters");
      } else if (fieldName === "Email") {
        setEmailError("Email cannot exceed 50 characters");
      }
    } else {
      if (fieldName === "Firstname") {
        setFirstnameError("");
      } else if (fieldName === "Lastname") {
        setLastnameError("");
      } else if (fieldName === "Email") {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate All Inputs Before Submit
    validateFirstname(firstname);
    validateLastname(lastname);
    validateEmail(email);
    validateDob(dob);
    validatePassword(password);
    validateConfirmPassword(confirmPassword);

    const userData = { firstname, lastname, email, dob, password };
    setIsLoading(true);
    try {
      const response = await registerUserQuery(userData);
      if (response.success) {
        toast.success(
          response.message ||
            "Registration successful! Please check your email for the OTP."
        );
        sessionStorage.setItem("isRegistered", "true"); // เก็บสถานะใน sessionStorage
        setTimeout(() => {
          toast.dismiss();
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }, 1000);
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center">
      <RegisterBG />
      <Toaster position="top-right" />
      <div className="container mx-auto my-auto bg-white rounded-2xl shadow-xl max-w-6xl min-h-[550px] flex relative z-10">
        {/* Welcome Section */}
        <RegisterBannerBG />
        <div className="w-2/5 p-12 bg-cover bg-center rounded-tl-2xl rounded-bl-2xl text-white flex flex-col items-center justify-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-center">Welcome Back!</h2>
          <p className="text-md text-center">
            To keep connected with us please login with your personal info.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-8 bg-transparent border border-white hover:bg-gray-100 hover:text-blue-700 text-white font-semibold py-4 px-20 rounded-full shadow-md transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Register Form */}
        <div className="w-3/5 p-12 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-1 text-[#0066FF] text-center">
            Create Account
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Please fill in this form to create an account!
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            {/* Firstname and Lastname */}
            <div className="flex mb-4 space-x-4">
              {/* Firstname */}
              <div className="relative w-1/2">
                <label
                  htmlFor="firstname"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    firstnameError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    id="firstname"
                    type="text"
                    placeholder="Enter your firstname"
                    className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${
                      firstnameError ? "border-red-500" : ""
                    }`}
                    value={firstname}
                    onChange={(e) => {
                      setFirstname(e.target.value);
                      validateFirstname(e.target.value);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 30, "Firstname")}
                    maxLength={30}
                    onBlur={() => setFirstnameFocused(true)}
                    disabled={isLoading}
                  />
                </div>
                {firstnameError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {firstnameError}
                  </p>
                )}
              </div>

              {/* Lastname */}
              <div className="relative w-1/2">
                <label
                  htmlFor="lastname"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    lastnameError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    id="lastname"
                    type="text"
                    placeholder="Enter your lastname"
                    className={`shadow appearance-none border rounded w-full py-2 pr-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500  ${
                      lastnameError ? "border-red-500" : ""
                    }`}
                    value={lastname}
                    onChange={(e) => {
                      setLastname(e.target.value);
                      validateLastname(e.target.value);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, 30, "Lastname")}
                    maxLength={30}
                    onBlur={() => setLastnameFocused(true)}
                    disabled={isLoading}
                  />
                </div>
                {lastnameError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {lastnameError}
                  </p>
                )}
              </div>
            </div>

            {/* Email and Date of Birth */}
            <div className="flex mb-4 space-x-4">
              {/* Email */}
              <div className="relative w-1/2">
                <label
                  htmlFor="email"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    emailError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-400"
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`shadow appearance-none border rounded w-full py-2 pr-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500  ${
                      emailError ? "border-red-500" : ""
                    }`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    onBlur={() => setEmailFocused(true)}
                    onKeyDown={(e) => handleKeyDown(e, 50, "Email")}
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="relative w-1/2">
                <label
                  htmlFor="dob"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    dobError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="text-gray-400"
                    />
                  </div>
                  <input
                    id="dob"
                    type="date"
                    placeholder="Enter your date of birth"
                    className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500  ${
                      dobError ? "border-red-500" : ""
                    }`}
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      validateDob(e.target.value);
                    }}
                    onBlur={() => setDobFocused(true)}
                    disabled={isLoading}
                  />
                </div>
                {dobError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {dobError}
                  </p>
                )}
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="flex mb-6 space-x-4">
              {/* Password */}
              <div className="relative w-1/2">
                <label
                  htmlFor="password"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    passwordError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500  ${
                      passwordError ? "border-red-500" : ""
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                      validateConfirmPassword(confirmPassword);
                    }}
                    onBlur={() => setPasswordFocused(true)}
                    disabled={isLoading}
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative w-1/2">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-gray-700 text-sm font-bold mb-2 ${
                    confirmPasswordError ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className={`shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500  ${
                      confirmPasswordError ? "border-red-500" : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validateConfirmPassword(e.target.value);
                    }}
                    onBlur={() => setConfirmPasswordFocused(true)}
                    disabled={isLoading}
                  />
                </div>
                {confirmPasswordError && (
                  <p className="text-red-500 text-xs italic mt-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mr-1"
                    />
                    {confirmPasswordError}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <div className="flex items-center justify-center">
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline ${
                  isLoading || !isFormValid
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                type="submit"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? (
                  <>
                    Registering...
                    <FontAwesomeIcon icon={faSpinner} className="ml-2" spin />
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuth(RegisterPage);
