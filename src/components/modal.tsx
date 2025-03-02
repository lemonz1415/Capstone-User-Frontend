"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faQuestion,
  faEye,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirmFetch: (() => Promise<void>) | (() => void); 
  readonly title: string;
  readonly message: string | React.ReactNode;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly icon?: IconDefinition;
  readonly iconColor?: string;
  readonly actionType?: "delete" | "default";
  readonly isPreview?: boolean;
  readonly isExpired?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirmFetch,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = faQuestion,
  iconColor = "text-white",
  actionType = "default",
  isPreview = false,
  isExpired = false,
}: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const result = onConfirmFetch();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error: any) {
      console.error("Error in modal confirm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-[90%] max-w-xl shadow-lg text-center relative">
        {/* Close button */}
        {!isExpired && ( // ซ่อนปุ่ม Close หากเป็นกรณี Session หมดอายุ
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-2xl" />
          </button>
        )}
        <div className="flex justify-center mb-6">
          <div
            className={`${
              actionType === "delete" ? "bg-red-500" : "bg-blue-500"
            } p-6 rounded-full w-20 h-20 flex items-center justify-center`}
          >
            <FontAwesomeIcon
              icon={isPreview ? faEye : icon}
              className={`text-4xl ${iconColor}`}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-[#0066FF]">{title}</h2>
        <div className="text-gray-600 mb-10">{message}</div>

        <div className="flex justify-center space-x-4">
          {/* กรณี Session หมดอายุ แสดงเฉพาะปุ่ม Go to Login */}
          {isExpired ? (
            <button
              onClick={handleConfirm}
              className={`px-8 py-2 ${
                isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              } text-white rounded-md`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          ) : (
            <>
              {/* ปุ่ม Cancel */}
              <button
                onClick={onClose}
                className="px-8 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400"
                disabled={isLoading}
              >
                {isPreview ? "Close" : cancelText}
              </button>

              {/* ปุ่ม Confirm */}
              {(isPreview || (!isPreview && confirmText)) && (
                <button
                  onClick={handleConfirm}
                  className={`px-8 py-2 ${
                    isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                  } text-white rounded-md`}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : confirmText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}