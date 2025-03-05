"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // ใช้เพื่อตรวจจับ Route Change
import { jwtDecode } from "jwt-decode";
interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean; 
  userId: number | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  getUserId: () => number | null;
}

// กำหนดโครงสร้างของ JWT Payload
interface JwtPayload {
    email: string;
    user_id: number;
    exp: number;
    iat: number;
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [userId, setUserId] = useState<number | null>(null);
  const pathname = usePathname();

    // ฟังก์ชันสำหรับดึง user_id จาก token
    const getUserIdFromToken = (token: string): number | null => {
        try {
          // ตัด "Bearer " ออกจาก token ถ้ามี
          const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
          
          // ใช้ jwt-decode แทนการ decode เอง
          const decoded = jwtDecode<JwtPayload>(tokenValue);
          return decoded.user_id || null;
        } catch (error) {
          console.error("Error extracting user ID from token:", error);
          return null;
        }
      };

        // ฟังก์ชันสำหรับดึง userId สำหรับใช้ภายนอก
  const getUserId = (): number | null => {
    return userId;
  };

  const validateTokens = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // ตรวจสอบ Access Token
    if (accessToken && isTokenValid(accessToken)) {
      setIsLoggedIn(true);
      const extractedUserId = getUserIdFromToken(accessToken);
      setUserId(extractedUserId);

    } else {
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUserId(null);
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
    const extractedUserId = getUserIdFromToken(accessToken);
    setUserId(extractedUserId);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false); // อัปเดตสถานะการ Logout
    setUserId(null)
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading,userId, login, logout, getUserId }}>
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
      // ตัด "Bearer " ออกจาก token ถ้ามี
      const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
      
      const payload = JSON.parse(atob(tokenValue.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };
