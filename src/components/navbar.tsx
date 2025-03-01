"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/auth.context";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav className="bg-blue-900 text-white py-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
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
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* ไอคอน Circle-User */}
              <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />

              {/* ปุ่ม Sign Out */}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
              >
                Sign Out
              </button>
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
