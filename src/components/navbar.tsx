"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/auth.context";
import { useModal } from "@/contexts/modal.context";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserInfoQuery } from "@/query/auth.query";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const { closeModal } = useModal();
  const [userName, setUserName] = useState<string>("My Account");
  const { userId } = useAuth();
  
    // ดึงข้อมูลผู้ใช้เมื่อ login
    useEffect(() => {
        const fetchUserInfo = async () => {
          if (isLoggedIn && userId) {
            try {
              const userInfo = await fetchUserInfoQuery(userId);
              if (userInfo && userInfo.firstname) {
                // แสดงชื่อและนามสกุลของผู้ใช้
                setUserName(`${userInfo.firstname} ${userInfo.lastname || ''}`);
              }
            } catch (error) {
              console.error("Error fetching user info:", error);
            }
          }
        };
        
        fetchUserInfo();
      }, [isLoggedIn, userId]);

  const handleLogout = () => {
        closeModal();
        logout()
        toast.success("Sign out successfully!");
        router.push("/"); 
};

return (
    <nav className="bg-blue-900 text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Toaster position="top-right" />
        {/* โลโก้ */}
        <button onClick={() => router.push("/")} className="text-2xl font-bold">
          ExamPrep
        </button>

        {/* Centered Links */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => router.push("/exam")}
            className="hover:text-blue-200"
          >
            Exam
          </button>
          <button onClick={() => {}} className="hover:text-blue-200">
            About
          </button>
          <button onClick={() => {}} className="hover:text-blue-200">
            Contact
          </button>
        </div>

        {/* เมนูด้านขวา */}
        <div className="flex items-center space-x-4 relative">
          {isLoggedIn ? (
            <>
              {/* User Profile Icon */}
              <div className="relative group">
                <button
                  className="flex items-center space-x-2 hover:text-blue-200 transition-all"
                >
                  <FontAwesomeIcon icon={faCircleUser} className="text-2xl mr-1" />
                  <span className="hidden md:inline font-bold">{userName}</span>
                </button>

                {/* Dropdown Menu (แสดงเมื่อ Hover) */}
                <div className="absolute right-0 mt-2 w-[200px] bg-white text-gray-800 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ul>
                    {/* Profile (Disabled) */}
                    <li
                      className="px-4 py-2 flex items-center space-x-2 text-gray-400 cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Profile</span>
                    </li>

                    {/* Sign Out */}
                    <li
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-red-100 cursor-pointer flex items-center space-x-2 text-red-500"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Sign Out</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ปุ่ม Sign In */}
              <button
                onClick={() => router.push("/auth/login")}
                className="hover:text-blue-200"
              >
                Sign In
              </button>

              {/* ปุ่ม Sign Up */}
              <button
                onClick={() => router.push("/auth/register")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}