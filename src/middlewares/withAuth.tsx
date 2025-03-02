"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context"; // ดึง Context API สำหรับ Auth
import { useModal } from "@/contexts/modal.context"; // ดึง Context API สำหรับ Modal

export default function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const { isLoggedIn, isLoading } = useAuth(); // ตรวจสอบสถานะการ Login จาก Context
    const { isOpen, openModal } = useModal(); // ใช้ Modal Context
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isLoggedIn && !isOpen) {
        // หากไม่ได้ Login และ Modal ยังไม่เปิด ให้แสดง Modal แจ้งเตือน
        openModal(
          "Session Expired",
          "Your session has expired. Please log in again.",
          "Go to Login",
          undefined,
          () => router.push("/auth/login"), // Redirect ไปยังหน้า Login เมื่อกดปุ่ม
          true // ส่งค่า isExpired เป็น true เพื่อกำหนดรูปแบบการแสดงผลของ Modal
        );
      }
    }, [isLoading, isLoggedIn, isOpen, openModal, router]);

    if (isLoading || !isLoggedIn) return null; // รอจนกว่าจะตรวจสอบสถานะเสร็จ

    return <Component {...props} />;
  };
}
