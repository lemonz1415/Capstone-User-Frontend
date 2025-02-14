"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRandom,
  faCogs,
  faPlay,
  faArrowLeft,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/modal"; // นำเข้า Modal

export default function NewExamPage() {
  const router = useRouter();
  const [examType, setExamType] = useState<"random" | "custom">("random");
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [isLoading, setIsLoading] = useState(false);

  const handleStartExam = () => {
    setIsModalOpen(true); // เปิด Modal เมื่อกด Start Exam
  };

  const handleConfirmStart = async () => {
    setIsLoading(true);

    try {
      // พาไปยังหน้าคำถามข้อแรก
      router.push(`/exam/123/question/1`);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false); // ปิด Modal หลังจากเริ่มต้น Exam
    }
  };

  const handleCancel = () => {
    router.push("/exam"); // กลับไปยังหน้ารวม Exam
  };

  return (
    <div className="container mx-auto py-10">
      {/* Modal Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmFetch={handleConfirmStart}
        title="Preview Exam Settings"
        message={
          <>
            <p>
              You are about to start a new exam with the following settings:
            </p>
            <ul className="list-disc list-inside mt-4 text-left">
              <li>
                <strong>Exam Type:</strong>{" "}
                {examType === "random" ? "Random" : "Custom"}
              </li>
              {examType === "random" && (
                <li>
                  <strong>Number of Questions:</strong> {numberOfQuestions}
                </li>
              )}
            </ul>
            {/* ข้อความสำคัญ */}
            <p className="mt-6 font-semibold text-red-500 bg-red-100 rounded-lg px-2 py-2">
              *Once you start this exam, you must complete it before leaving.
              Your progress will not be saved if you exit.
            </p>
            <p className="mt-6">Are you sure you want to proceed?</p>
          </>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        actionType="default"
      />

      {/* Back Button */}
      <div className="relative flex items-center mb-8">
        <button
          onClick={() => router.push("/exam")}
          className="absolute left-0 flex items-center text-blue-500 font-semibold"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>

        <h1 className="mx-auto text-4xl font-bold text-[#0066FF]">
          Start a New Exam
        </h1>
      </div>

      {/* เลือกประเภทของ Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Random Exam */}
        <div
          onClick={() => setExamType("random")}
          className={`p-6 rounded-lg shadow-lg border ${
            examType === "random"
              ? "border-blue-500 bg-blue-100"
              : "border-gray-200 bg-white"
          } cursor-pointer transition-all hover:shadow-xl`}
        >
          <FontAwesomeIcon
            icon={faRandom}
            className="text-blue-500 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Random Exam</h2>
          <p className="text-gray-600">
            Let the system randomly generate questions for you.
          </p>
        </div>

        {/* Custom Exam */}
        <div
          onClick={() => setExamType("custom")}
          className={`p-6 rounded-lg shadow-lg border ${
            examType === "custom"
              ? "border-blue-500 bg-blue-100"
              : "border-gray-200 bg-white"
          } cursor-pointer transition-all hover:shadow-xl`}
        >
          <FontAwesomeIcon
            icon={faCogs}
            className="text-blue-500 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Custom Exam</h2>
          <p className="text-gray-600">
            Customize the number and type of questions you want to do.
          </p>
        </div>
      </div>

      {/* จำนวนคำถาม (เฉพาะ Random) */}
      {examType === "random" && (
        <div className="mb-8">
          <label
            htmlFor="numberOfQuestions"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Number of Questions:
          </label>
          <input
            type="number"
            id="numberOfQuestions"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            min="1"
            className="w-full text-gray-700 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
      )}

      {/* ปุ่ม Start และ Cancel */}
      <div className="flex justify-center space-x-4">
        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          } transition-all`}
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Cancel
        </button>

        {/* Start Button */}
        <button
          onClick={handleStartExam}
          disabled={isLoading}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-all`}
        >
          <FontAwesomeIcon icon={faPlay} className="mr-2" />
          Start Exam
        </button>
      </div>
    </div>
  );
}
