"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth.context"; // ดึง Context API สำหรับ Auth
import { useModal } from "@/contexts/modal.context"; // ดึง Context API สำหรับ Modal

export default function withAuth(
  Component: React.ComponentType,
  redirectIfLoggedIn?: string
) {
  return function AuthenticatedComponent(props: any) {
    const { isLoggedIn, isLoading, sessionExpiredReason } = useAuth(); // ตรวจสอบสถานะการ Login จาก Context
    const pathname = usePathname(); // ใช้เพื่อดึงเส้นทางปัจจุบัน
    const router = useRouter();
    const { isOpen, openModal } = useModal(); // ใช้ Modal Context

    useEffect(() => {
      if (!isLoading) {
        if (
          isLoggedIn &&
          ["/auth/login", "/auth/register", "/auth/verify-email"].includes(
            pathname
          ) &&
          pathname !== "/exam" &&
          !pathname.includes("/exam/")
        ) {
          // แสดง Modal เฉพาะเมื่อผู้ใช้พยายามเข้าถึงหน้า auth โดยตรง ไม่ใช่หลังจาก login สำเร็จ
          const isDirectAccess = !sessionStorage.getItem("justLoggedIn");
          if (isDirectAccess && !isOpen) {
            // หากผู้ใช้ Login แล้ว และพยายามเข้าถึงหน้าที่เกี่ยวกับ Auth
            openModal(
              "Access Restricted",
              "You are already logged in. Please proceed to the Exam page.",
              "Go to Exam",
              undefined,
              () => router.push("/exam"), // Redirect ไปยังหน้า Exam เมื่อกดปุ่ม
              true // ส่งค่า isExpired เป็น true เพื่อกำหนดรูปแบบการแสดงผลของ Modal
            );
          }
          // ลบ flag หลังจากใช้งาน
          sessionStorage.removeItem("justLoggedIn");
        }

        if (
          !isLoggedIn &&
          !isOpen &&
          !["/auth/login", "/auth/register", "/auth/verify-email"].includes(
            pathname
          )
        ) {
          // หากไม่ได้ Login และพยายามเข้าถึงหน้าที่ต้องการการ Authentication
          openModal(
            sessionExpiredReason === "notLoggedIn"
              ? "Authentication Required"
              : "Session Expired", // ชื่อ Modal
            sessionExpiredReason === "notLoggedIn"
              ? "You must log in to access this page."
              : "Your session has expired. Please log in again.", // ข้อความ
            "Go to Login",
            undefined,
            () => router.push("/auth/login"), // Redirect ไปยังหน้า Login เมื่อกดปุ่ม
            true // ส่งค่า isExpired เป็น true เพื่อกำหนดรูปแบบการแสดงผลของ Modal
          );
        }
      }
    }, [isLoading, isLoggedIn, pathname, openModal, isOpen, router]);

    if (
      isLoading ||
      (!isLoggedIn &&
        !["/auth/login", "/auth/register", "/auth/verify-email"].includes(
          pathname
        ))
    ) {
      return null; // รอจนกว่าจะตรวจสอบสถานะเสร็จ
    }

    return <Component {...props} />;
  };
}
