"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getQuestionDetailQuery,
  updateSelectedOptionQuery,
  getCountQuestionByExamIDQuery,
} from "@/query/exam.query";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/modal";
import QuestionContent from "@/components/question_content";

export default function QuestionPage() {
  const router = useRouter();
  const params = useParams();
  const examID = parseInt(params.examID as string);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // เก็บ Index ของคำถามปัจจุบัน
  const [currentQuestion, setCurrentQuestion] = useState<any>(null); // เก็บข้อมูลคำถามปัจจุบัน
  const [answers, setAnswers] = useState<(number | null)[]>([]); // เก็บคำตอบของผู้ใช้
  const [totalQuestions, setTotalQuestions] = useState(0); // จำนวนคำถามทั้งหมด
  const [isLoading, setIsLoading] = useState(true); // สถานะ Loading
  const [error, setError] = useState<string | null>(null); // ข้อผิดพลาด
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [visibleDotsRange, setVisibleDotsRange] = useState<[number, number]>([
    0, 10,
  ]); // ช่วงคำถามที่แสดง (เริ่มต้นที่ข้อ 1-10)

  // Fetch จำนวนคำถามทั้งหมดเมื่อ Component ถูก Mount
  useEffect(() => {
    const fetchTotalQuestions = async () => {
      try {
        const count = await getCountQuestionByExamIDQuery(examID);
        setTotalQuestions(count);
        setAnswers(Array(count).fill(null)); // เตรียม State สำหรับเก็บคำตอบ
      } catch (err) {
        console.error("Error fetching question count:", err);
        toast.error("Failed to load question count.");
      }
    };

    fetchTotalQuestions();
  }, [examID]);

  // Fetch ข้อมูลคำถามเมื่อ currentQuestionIndex เปลี่ยน
  useEffect(() => {
    if (totalQuestions === 0) return; // รอให้จำนวนคำถามถูกโหลดก่อน

    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const data = await getQuestionDetailQuery(examID, currentQuestionIndex);
        setCurrentQuestion(data); // เก็บข้อมูลคำถามใน State

        if (!answers[currentQuestionIndex]) {
          setAnswers((prev) => {
            const updatedAnswers = [...prev];
            updatedAnswers[currentQuestionIndex] =
              data.selected_option_id || null; // ดึงค่า selected_option_id มาเก็บใน State
            return updatedAnswers;
          });
        }
      } catch (err) {
        console.error("Error fetching question:", err);
        setError("Failed to load question. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [examID, currentQuestionIndex, totalQuestions]);

  // ฟังก์ชันสำหรับเลือกคำตอบ
  const handleSelectOption = async (option_id: number) => {
    try {
      setAnswers((prev) =>
        prev.map((ans, index) =>
          index === currentQuestionIndex ? option_id  : ans
        )
      );

      await updateSelectedOptionQuery(
        examID,
        currentQuestion.question_id,
        option_id
      );
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to save answer. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1 && !isLoading) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // อัปเดตช่วงของ Indicator Dots
      if (currentQuestionIndex + 1 >= visibleDotsRange[1]) {
        setVisibleDotsRange([
          visibleDotsRange[0] + 10,
          visibleDotsRange[1] + 10,
        ]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isLoading) {
      setCurrentQuestionIndex(currentQuestionIndex - 1 );
      // อัปเดตช่วงของ Indicator Dots
      if (currentQuestionIndex - 1 < visibleDotsRange[0]) {
        setVisibleDotsRange([
          visibleDotsRange[0] - 10,
          visibleDotsRange[1] - 10,
        ]);
      }
    }
  };

  const handleSubmit = () => {
    setIsModalOpen(true); // เปิด Modal เมื่อกด Submit
  };

  const confirmSubmit = () => {
    setIsModalOpen(false); // ปิด Modal
    toast.success("Exam Submitted Successfully!"); // แสดง Toast Notification
    router.push(`/exam/${examID}`) ;
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }
  // คำนวณจำนวนคำถามที่ตอบแล้ว
  const answeredCount = answers.filter((answer) => answer !== null).length;

  return (
    <div className="flex flex-col h-screen p-6 bg-gradient-to-r from-gray-100 to-blue-200">
      <Toaster position="top-right" />

      {/* Modal สำหรับ Confirm Submit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmFetch={confirmSubmit}
        title="Confirm Submission"
        message="Are you sure you want to submit your exam? Once submitted, you cannot make any changes."
        confirmText="Submit"
        cancelText="Cancel"
      />

      {/* Progress Bar */}
      {totalQuestions > 0 && (
        <div className="w-full max-w-3xl mx-auto mb-6">
          <div className="w-full bg-gray-200 h-[6px] rounded-lg overflow-hidden">
            <div
              className="bg-blue-500 h-[6px] rounded-lg transition-all duration-500 ease-in-out"
              style={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
              }}
            />
          </div>
          <div className="text-right text-gray-700 text-sm mt-[2px]">
            {answeredCount}/{totalQuestions} answered
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <p className="text-sm font-medium text-gray-500 text-center">
          Question {currentQuestionIndex + 1}
        </p>

        <QuestionContent
          isLoading={isLoading}
          currentQuestion={currentQuestion}
          answers={answers}
          currentQuestionIndex={currentQuestionIndex}
          handleSelectOption={handleSelectOption}
        />
      </div>

      {/* Indicator Dots */}
      {totalQuestions > 0 && (
        <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
          {Array.from({ length: totalQuestions })
            .slice(visibleDotsRange[0], visibleDotsRange[1])
            .map((_, index) => {
              const actualIndex = visibleDotsRange[0] + index;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentQuestionIndex(actualIndex)}
                  className={`w-4 h-4 rounded-full transition-all ${
                    actualIndex === currentQuestionIndex
                      ? "bg-green-500"
                      : answers[actualIndex]
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                />
              );
            })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 max-w-3xl mx-auto gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isLoading}
          className={`px-6 py-3 rounded-lg ${
            currentQuestionIndex === 0 || isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1 || isLoading}
          className={`px-6 py-3 rounded-lg ${
            currentQuestionIndex === totalQuestions - 1 || isLoading
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
          disabled={answeredCount !== totalQuestions} // ปุ่ม Submit จะกดได้เมื่อทำครบทุกข้อ
          className={`px-8 py-3 rounded-lg font-bold ${
            answeredCount === totalQuestions
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
