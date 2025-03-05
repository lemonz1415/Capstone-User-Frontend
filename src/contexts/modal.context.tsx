"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Modal from "@/components/modal";

interface ModalContextType {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  openModal: (
    title: string,
    message: string,
    confirmText?: string,
    cancelText?: string,
    onConfirm?: () => void,
    isExpired?: boolean 
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState<string | undefined>();
  const [cancelText, setCancelText] = useState<string | undefined>();
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>();
  const [isExpired, setIsExpired] = useState<boolean>(false); // เพิ่ม State สำหรับ Session หมดอายุ
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);     // เก็บค่า path ก่อนหน้าไว้เพื่อตรวจสอบการเปลี่ยนหน้า    

  const openModal = (
    title: string,
    message: string,
    confirmText?: string,
    cancelText?: string,
    onConfirm?: () => void,
    isExpiredProp?: boolean // รับค่า isExpired จากการเรียกใช้ openModal
  ) => {
    if (isOpen) return; // ป้องกันการเปิด Modal ซ้ำ
    setTitle(title);
    setMessage(message);
    setConfirmText(confirmText);
    setCancelText(cancelText);
    setOnConfirm(() => onConfirm);
    setIsExpired(!!isExpiredProp); // กำหนดค่า isExpired
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTitle("");
    setMessage("");
    setConfirmText(undefined);
    setCancelText(undefined);
    setOnConfirm(undefined);
    setIsExpired(false); // รีเซ็ตค่า isExpired
  };

  useEffect(() => {
    // ตรวจสอบว่ามี token หรือไม่
    const hasToken = typeof window !== "undefined" && localStorage.getItem("accessToken");
    
    // กรณีที่มี token และพยายามเข้าถึงหน้า auth หลังจากเปลี่ยนหน้า
    if (hasToken && 
        ["/auth/login", "/auth/register", "/auth/verify-email"].includes(pathname) &&
        prevPathRef.current !== pathname) {
      // ไม่ต้องทำอะไร - ให้ withAuth จัดการแสดง Modal
    } 
    else if (hasToken && 
            (pathname === "/exam" || pathname.startsWith("/exam/"))) {
          closeModal();
        }
    // กรณีที่เปลี่ยนไปหน้าแรกหรือหน้า login หลังจาก session expired
    else if (pathname === "/" || pathname === "/auth/login") {
      closeModal();
    }
    
    // อัปเดต path ก่อนหน้า
    prevPathRef.current = pathname;
  }, [pathname]);

//   useEffect(() => {
//     if (pathname === "/auth/login") {
//       closeModal(); 
//     }
//   }, [pathname]);

//     useEffect(() => {
//         if (pathname === "/") {
//           closeModal(); 
//         }
//       }, [pathname]);

  return (
    <ModalContext.Provider value={{ isOpen, title, message, confirmText, cancelText, onConfirm, openModal, closeModal }}>
      {children}
      {/* เพิ่ม Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirmFetch={() => {
          if (onConfirm) onConfirm();
          closeModal();
        }}
        isExpired={isExpired} // ส่งค่า isExpired ไปยัง Modal Component
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
