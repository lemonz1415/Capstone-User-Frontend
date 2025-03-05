"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRandom,
  faCogs,
  faPlay,
  faArrowLeft,
  faTimes,
  faSpinner,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/modal"; 
import { generateRandomExamQuery, getAllExamLogIDQuery } from "@/query/exam.query";
import withAuth from "@/middlewares/withAuth";
import { useAuth } from "@/contexts/auth.context";

function NewExamPage() {
  const router = useRouter();
  const [examType, setExamType] = useState<"random" | "custom">("random");
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExamID, setGeneratedExamID] = useState<number | null>(null); // เก็บ exam_id ที่สร้าง
  const [isBlocked, setIsBlocked] = useState(false); // บล็อกการเข้าถึง
  const { userId } = useAuth();

   // Fetch ข้อมูลเพื่อเช็คจำนวนข้อสอบที่ยังไม่เสร็จ
   useEffect(() => {
    const fetchExamStatus = async () => {
      try {
        if (!userId) {
          console.error("User ID not found");
          return;
        }
        const data = await getAllExamLogIDQuery(userId); // เรียก API ดึงข้อมูล Exam
        const inProgressExams = data.filter((exam: any) => !exam.is_completed); // นับข้อสอบที่ยังไม่เสร็จ

        if (inProgressExams.length >= 5) {
          setIsBlocked(true); // บล็อกการเข้าถึงหากมี inProgress >= 5
        }
      } catch (error) {
        console.error("Error fetching exam status:", error);
      }
    };

    fetchExamStatus();
  }, []);

  const handleStartExam = async () => {
    setIsLoading(true); // แสดงสถานะ Loading

    try {
      // เรียก API เพื่อสร้างข้อสอบแบบสุ่ม
      if (!userId) {
        console.error("User ID not found");
        return;
      }
      const result = await generateRandomExamQuery(userId);

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

  if (isBlocked) {
    return (
      <div className="container mx-auto py-10 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-8xl mb-4" />
        </div>
  
        {/* Title */}
        <h1 className="text-xl md:text-[34px] font-extrabold text-[#FF0000] mb-4">
          Access Denied
        </h1>
  
        {/* Message */}
        <p className="text-gray-600 mb-6">
          You cannot create a new exam until you complete or submit your current In Progress exams.
        </p>
  
        {/* Button */}
        <button
          onClick={handleCancel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
        >
          Go Back to Exams
        </button>
      </div>
    );
  }
  
  
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
            style={{ fontSize: '2em' }}
            className="text-gray-400 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-500 mb-2">Custom Exam</h2>
          <p className="text-gray-400">
            Customize the number and type of questions you want to do.
          </p>
        </div>
      </div>

      {/* Select Number of Questions */}
      {examType === "random" && (
        <div className="mb-8">
          <label
            htmlFor="numberOfQuestions"
            className="block text-lg font-medium text-gray-700 mb-4"
          >
            Select Number of Questions:
          </label>
          {/* Button Group for Number Selection */}
          <div className="flex space-x-4">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => setNumberOfQuestions(num)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  numberOfQuestions === num
                    ? "bg-blue-500 text-white shadow-lg scale-[1.05]"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:shadow-md"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
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

export default withAuth(NewExamPage);