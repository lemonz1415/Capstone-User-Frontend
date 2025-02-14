"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/modal"; // นำเข้า Modal Component

// Mock Data สำหรับคำถาม
const mockQuestions = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  instruction: `Instruction for question ${i + 1}`,
  questionTexts: `This is question number ${i + 1}`,
  choiceA: `Choice A for question ${i + 1}`,
  choiceB: `Choice B for question ${i + 1}`,
  choiceC: `Choice C for question ${i + 1}`,
  choiceD: `Choice D for question ${i + 1}`,
  answer: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)], // Random Answer
}));

export default function QuestionPage() {
  const router = useRouter();
  const examID = 1;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // คำถามปัจจุบัน
  const [answers, setAnswers] = useState(
    Array(mockQuestions.length).fill(null)
  ); // เก็บคำตอบของผู้ใช้
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับเปิด/ปิด Modal

  const currentQuestion = mockQuestions[currentQuestionIndex]; // ดึงคำถามปัจจุบัน

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsModalOpen(true); // เปิด Modal เมื่อกด Submit
  };

  const confirmSubmit = () => {
    setIsModalOpen(false); // ปิด Modal
    toast.success("Exam Submitted Successfully!"); // แสดง Toast Notification
    router.push(`/exam/${examID}`); // กลับไปยังหน้ารวม Exam
  };

  const isAllAnswered = answers.every((answer) => answer !== null); // ตรวจสอบว่าตอบครบทุกข้อหรือไม่

  // คำนวณจำนวนคำถามที่ตอบแล้ว
  const answeredCount = answers.filter((answer) => answer !== null).length;

  // คำนวณชุดจุดไข่ปลา (แสดงทีละ 10 จุด)
  const startDotIndex = Math.floor(currentQuestionIndex / 10) * 10;
  const visibleDots = mockQuestions.slice(startDotIndex, startDotIndex + 10);

  return (
    <div className="flex flex-col h-screen p-6 bg-gradient-to-r from-gray-100 to-blue-200">
      <Toaster position="top-right" /> {/* Toast Notification */}

      {/* Modal สำหรับ Confirm Submit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // ปิด Modal เมื่อกด Cancel หรือ Close
        onConfirmFetch={confirmSubmit} // ยืนยันการ Submit เมื่อกด Confirm ใน Modal
        title="Confirm Submission"
        message="Are you sure you want to submit your exam? Once submitted, you cannot make any changes."
        confirmText="Submit"
        cancelText="Cancel"
      />

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="w-full bg-gray-200 h-[6px] rounded-lg overflow-hidden">
          <div
            className="bg-blue-500 h-[6px] rounded-lg transition-all duration-500 ease-in-out"
            style={{
              width: `${(answeredCount / mockQuestions.length) * 100}%`, // เปลี่ยนการคำนวณเป็นจำนวนข้อที่ตอบแล้ว
            }}
          />
        </div>
        <div className="text-right text-gray-700 text-sm mt-[2px]">
          {answeredCount}/{mockQuestions.length} answered
        </div>
      </div>

      {/* Question Content */}
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Question Number */}
        <p className="text-sm font-medium text-gray-500 text-center">
          Question {currentQuestionIndex + 1}
        </p>

        {/* Question Text */}
        <p className="text-lg font-medium text-gray-800">
          {currentQuestion.questionTexts}
        </p>
        <p className="text-gray-500 italic">{currentQuestion.instruction}</p>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-4">
          {["A", "B", "C", "D"].map((choice) => (
            <button
              key={choice}
              onClick={() =>
                setAnswers((prev) =>
                  prev.map((ans, index) =>
                    index === currentQuestionIndex ? choice : ans
                  )
                )
              }
              className={`p-4 rounded-lg transition-all ${
                answers[currentQuestionIndex] === choice
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {choice}.{" "}
              {
                currentQuestion[
                  `choice${choice}` as keyof typeof currentQuestion
                ]
              }
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
        {visibleDots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(startDotIndex + index)}
            className={`w-4 h-4 rounded-full transition-all ${
              currentQuestionIndex === startDotIndex + index
                ? "bg-green-500" // สีเขียวสำหรับข้อที่กำลังดูอยู่
                : answers[startDotIndex + index]
                ? "bg-blue-500" // สีน้ำเงินสำหรับข้อที่ตอบแล้ว
                : "bg-gray-300" // สีเทาสำหรับข้อที่ยังไม่ได้ตอบ
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 max-w-3xl mx-auto gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg ${
            currentQuestionIndex === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === mockQuestions.length - 1}
          className={`px-6 py-3 rounded-lg ${
            currentQuestionIndex === mockQuestions.length - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-6 max-w-3xl mx-auto mb-4">
        <button
          onClick={handleSubmit}
          disabled={!isAllAnswered} // ปุ่ม Submit จะกดได้เมื่อทำครบทุกข้อ
          className={`px-8 py-3 rounded-lg font-bold ${
            isAllAnswered
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit 
        </button>
      </div>
    </div>
  );
}
