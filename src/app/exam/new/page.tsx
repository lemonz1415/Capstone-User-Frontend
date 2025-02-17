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
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/modal"; // นำเข้า Modal
import { generateRandomExamQuery } from "@/query/exam.query";

export default function NewExamPage() {
  const router = useRouter();
  const [examType, setExamType] = useState<"random" | "custom">("random");
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExamID, setGeneratedExamID] = useState<number | null>(null); // เก็บ exam_id ที่สร้าง

  const handleStartExam = async () => {
    setIsLoading(true); // แสดงสถานะ Loading

    try {
      // เรียก API เพื่อสร้างข้อสอบแบบสุ่ม
      const user_id = 1; // Mock user_id (คุณสามารถเปลี่ยนเป็นค่าจริงได้)
      const result = await generateRandomExamQuery(user_id);

      if (result?.success && result.exam_id) {
        setGeneratedExamID(result.exam_id); // เก็บ exam_id ที่สร้าง
        setIsModalOpen(true); // เปิด Modal เมื่อสร้างสำเร็จ
      } else {
        console.error("Failed to generate exam");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
    } finally {
      setIsLoading(false); // ปิดสถานะ Loading
    }
  };

  const handleConfirmStart = () => {
    if (generatedExamID) {
      router.push(`/exam/${generatedExamID}/question`); // Redirect ไปยังหน้าคำถามข้อแรก
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
            <p className="mt-6">Are you sure you want to proceed?</p>
          </>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        actionType="default"
        isPreview={true}
      />

      {/* Back Button */}
      <div className="relative flex items-center mb-8">
        <button
          onClick={() => router.push("/exam")}
          className="absolute left-0 flex items-center text-blue-500 font-semibold"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Exams
        </button>

        <h1 className="mx-auto text-4xl font-bold text-[#0066FF]">
          Start a New Exam
        </h1>
      </div>

      {/* เลือกประเภทของ Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Random Exam */}
        <button
          onClick={() => setExamType("random")}
          className={`p-6 rounded-lg shadow-lg border text-left ${
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
        </button>

        {/* Custom Exam (Disabled) */}
        <div
          className={`p-6 rounded-lg shadow-lg border border-gray-200 bg-gray-100 cursor-not-allowed`}
        >
          <FontAwesomeIcon
            icon={faCogs}
            className="text-gray-400 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-500 mb-2">Custom Exam</h2>
          <p className="text-gray-400">
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
            disabled
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
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              Start Exam
            </>
          )}
        </button>
      </div>
    </div>
  );
}