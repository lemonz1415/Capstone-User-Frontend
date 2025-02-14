"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleXmark,
  faQuestion,
  faEye,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFetch: (() => Promise<void>) | (() => void); 
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: IconDefinition;
  iconColor?: string;
  actionType?: "delete" | "default";
  isPreview?: boolean;
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
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-400 hover:text-gray-500 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="text-2xl" />
        </button>
        <div className="flex justify-center mb-6">
          <div
            className={`${
              isPreview
                ? "bg-blue-500"
                : actionType === "delete"
                ? "bg-red-500"
                : "bg-blue-500"
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
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400"
            disabled={isLoading}
          >
            {isPreview ? "Close" : cancelText}
          </button>
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
        </div>
      </div>
    </div>
  );
}
