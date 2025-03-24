"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/auth.context";
import { useModal } from "@/contexts/modal.context";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserInfoQuery } from "@/query/auth.query";
import { lowerCase } from "lodash";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  const { closeModal } = useModal();
  const [userName, setUserName] = useState<string>("My Account");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { userId } = useAuth();

  let timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MENU = [
    { title: "Exam", path: "/exam", disabled: false },
    { title: "About", path: "/about", disabled: true },
    { title: "Contact", path: "/contact", disabled: true },
  ];

  // ดึงข้อมูลผู้ใช้เมื่อ login
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn && userId) {
        try {
          const userInfo = await fetchUserInfoQuery(userId);
          if (userInfo && userInfo.firstname) {
            // แสดงชื่อและนามสกุลของผู้ใช้
            setUserName(`${userInfo.firstname} ${userInfo.lastname || ""}`);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      }
    };

    fetchUserInfo();
  }, [isLoggedIn, userId]);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [isLoggedIn]);

  const handleLogout = () => {
    closeModal();
    logout();
    toast.success("Sign out successfully!");
    router.push("/");
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 50); // delay ก่อนปิดเมนู
  };

  const isActive = (menuPath: string) => pathname.startsWith(menuPath);

  return (
    <nav className="bg-blue-900 text-white py-3 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Toaster position="top-right" />

        <button onClick={() => router.push("/")} className="text-2xl font-bold">
          ExamPrep
        </button>

        {/* Centered Links */}
        <div className="flex items-center space-x-6 font-semibold">
          {MENU.map((menu) => (
            <button
              key={`menu_${lowerCase(menu?.title)}`}
              onClick={() => router.push(menu.path)}
              className={`relative px-4 py-3 hover:text-blue-200 ${
                isActive(menu.path)
                  ? "bg-blue-700 text-white font-bold shadow-md rounded-lg"
                  : "hover:bg-[#445165] hover:text-white rounded-lg"
              }`}
              disabled={menu.disabled}
            >
              {menu.title}
            </button>
          ))}
        </div>

        {/* เมนูด้านขวา */}
        <div className="flex items-center space-x-4 relative">
          {isLoggedIn ? (
            <>
              {/* User Profile Icon */}
              <div className="relative group">
                <button
                  className="flex items-center space-x-2 hover:text-blue-200 transition-all"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <FontAwesomeIcon
                    icon={faCircleUser}
                    size="2x"
                    className="text-2xl mr-1"
                  />
                  <span className="hidden md:inline font-bold">{userName}</span>
                </button>


                {/* Dropdown Menu (แสดงเมื่อ Hover) */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-[200px] bg-white text-gray-800 rounded-lg shadow-lg z-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <ul>
                      {/* Profile */}
                      <li
                        onClick={() => router.push("/profile")}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex items-center space-x-2 text-blue-500 rounded-lg"
                      >
                        <FontAwesomeIcon icon={faUser} />
                        <span>Profile</span>
                      </li>

                      {/* Sign Out */}
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-red-100 cursor-pointer flex items-center space-x-2 text-red-500 rounded-lg"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Sign Out</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* ปุ่ม Sign In */}
              <button
                onClick={() => router.push("/auth/login")}
                className={`hover:text-blue-200 ${
                  isActive("/auth/login")
                    ? "text-blue-400 font-bold shadow-md rounded-lg underline"
                    : ""
                }`}
              >
                Sign In
              </button>

              {/* ปุ่ม Sign Up */}
              <button
                onClick={() => router.push("/auth/register")}
                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all ${
                  isActive("/auth/register") ? "bg-blue-600 shadow-lg" : ""
                }`}
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
