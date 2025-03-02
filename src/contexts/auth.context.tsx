"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // ใช้เพื่อตรวจจับ Route Change
interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean; // เพิ่มสถานะ Loading
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // เพิ่มสถานะ Loading
  const pathname = usePathname();

  const validateTokens = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // ตรวจสอบ Access Token
    if (accessToken && isTokenValid(accessToken)) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
    }

    // ตรวจสอบ Refresh Token
    if (refreshToken && !isTokenValid(refreshToken)) {
      localStorage.removeItem("refreshToken"); // ลบ Refresh Token ที่หมดอายุออก
    }
  };

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const accessToken = localStorage.getItem("accessToken");
//       const refreshToken = localStorage.getItem("refreshToken");

//       // ตรวจสอบ Access Token
//       if (accessToken && isTokenValid(accessToken)) {
//         setIsLoggedIn(true);
//       } else {
//         localStorage.removeItem("accessToken");
//         setIsLoggedIn(false);
//       }

//       // ตรวจสอบ Refresh Token
//       if (refreshToken && !isTokenValid(refreshToken)) {
//         localStorage.removeItem("refreshToken"); // ลบ Refresh Token ที่หมดอายุออก
//       }

//       setIsLoading(false); // การตรวจสอบเสร็จสิ้น
//     }
//   }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      validateTokens(); // ตรวจสอบ Token เมื่อ Component ถูก Mount
      setIsLoading(false); // การตรวจสอบเสร็จสิ้น
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
        validateTokens(); // ตรวจสอบ Token เมื่อ Route เปลี่ยนแปลง
  }
  }, [pathname]);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsLoggedIn(true); // อัปเดตสถานะการ Login
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false); // อัปเดตสถานะการ Logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ฟังก์ชันตรวจสอบความถูกต้องของ Token
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT Payload
    const currentTime = Math.floor(Date.now() / 1000); // เวลาปัจจุบันในรูปแบบ Unix Timestamp
    return payload.exp > currentTime; // เปรียบเทียบเวลาหมดอายุของ Token
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};
