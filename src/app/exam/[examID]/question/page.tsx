"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  updateSelectedOptionQuery,
  getExamScoreQuery,
  getExamTestedDetailQuery,
} from "@/query/exam.query";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/modal";
import QuestionContent from "@/components/question_content";
import withAuth from "@/middlewares/withAuth";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function QuestionPage() {
  const router = useRouter();
  const params = useParams();
  const examID = parseInt(params.examID as string);

  const [questions, setQuestions] = useState<any[]>([]); // เก็บข้อมูลคำถามทั้งหมด
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // เก็บ Index ของคำถามปัจจุบัน
  const [answers, setAnswers] = useState<(number | null)[]>([]); // เก็บคำตอบของผู้ใช้
  const [isInProgress, setIsInProgress] = useState(true); // เก็บสถานะ is_inprogress
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // สถานะ Loading
  const [error, setError] = useState<string | null>(null); // ข้อผิดพลาด
  const [isModalOpen, setIsModalOpen] = useState(false); // State สำหรับ Modal
  const [visibleDotsRange, setVisibleDotsRange] = useState<[number, number]>([
    0, 10,
  ]); // ช่วงคำถามที่แสดง (เริ่มต้นที่ข้อ 1-10)

  // Fetch ข้อมูลเมื่อ Component ถูก Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch ข้อมูลคำถามและคำตอบทั้งหมด
        const data = await getExamTestedDetailQuery(examID);
        // อัปเดตข้อมูลคำถามและคำตอบ
        setQuestions(data.exam_detail || []);
        const initialAnswers = data.exam_detail.map(
          (question: any) => question.selected_option_id || null
        );
        setAnswers(initialAnswers);

        // อัปเดตสถานะ is_inprogress
        setIsInProgress(data.is_inprogress);
        setIsCompleted(data.is_completed);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        toast.error("Failed to load initial data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [examID]);

  // ฟังก์ชันสำหรับเลือกคำตอบ
  const handleSelectOption = async (option_id: number) => {
    try {
      setAnswers((prev) =>
        prev.map((ans, index) =>
          index === currentQuestionIndex ? option_id : ans
        )
      );
      const response = await updateSelectedOptionQuery(
        examID,
        questions[currentQuestionIndex]?.question_id,
        option_id
      );
      if (response?.is_inprogress !== undefined) {
        setIsInProgress(response.is_inprogress);
      }
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to save answer. Please try again.");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1 && !isLoading) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // อัปเดตช่วงของ Indicator Dots
      if (nextIndex >= visibleDotsRange[1]) {
        setVisibleDotsRange([
          visibleDotsRange[0] + 10,
          visibleDotsRange[1] + 10,
        ]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isLoading) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // อัปเดตช่วงของ Indicator Dots
      if (prevIndex < visibleDotsRange[0]) {
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

  const confirmSubmit = async () => {
    try {
      setIsModalOpen(false); // ปิด Modal
      toast.loading("Submitting exam...");

      // เรียก API เพื่อ Submit ข้อสอบ
      await getExamScoreQuery(examID);

      toast.dismiss();
      toast.success("Exam Submitted Successfully!");

      // Redirect ไปยังหน้ารายละเอียดข้อสอบ
      setTimeout(() => {
        router.push(`/exam/${examID}`);
      }, 1000);
    } catch (error) {
      toast.dismiss();
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam. Please try again.");
    }
  };

  // ดักจับ Event ปุ่ม Arrow Keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext(); // กดลูกศรขวาเพื่อไปข้อถัดไป
      } else if (event.key === "ArrowLeft") {
        handlePrevious(); // กดลูกศรซ้ายเพื่อย้อนกลับข้อก่อนหน้า
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, isLoading]); // ดักจับการเปลี่ยนแปลงของ currentQuestionIndex และ isLoading

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
      <Modal
        isOpen={isCompleted}
        icon={faXmark}
        onClose={() => router.push("/exam")}
        onConfirmFetch={() => router.push("/exam")}
        title="Exam Already Submitted"
        message="You cannot make any changes to it."
        confirmText="OK"
      />
      {/* Progress Bar */}
      {questions.length > 0 && (
        <div className="w-full max-w-3xl mx-auto mb-6">
          <div className="w-full bg-gray-200 h-[6px] rounded-lg overflow-hidden">
            <div
              className="bg-blue-500 h-[6px] rounded-lg transition-all duration-500 ease-in-out"
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
              }}
            />
          </div>
          <div className="text-right text-gray-700 text-sm mt-[2px]">
            {answeredCount}/{questions.length} answered
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <p className="text-sm font-medium text-gray-500 text-center">
          Question {currentQuestionIndex + 1}
        </p>

        {questions[currentQuestionIndex] && (
          <QuestionContent
            isLoading={isLoading}
            currentQuestion={questions[currentQuestionIndex]}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            handleSelectOption={handleSelectOption}
          />
        )}
      </div>

      {/* Indicator Dots */}
      {questions.length > 0 && (
        <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
          {Array.from({ length: questions.length })
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
      <div className="flex justify-between items-center mt-4 max-w-3xl mx-auto gap-4">
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
          disabled={currentQuestionIndex === questions.length - 1 || isLoading}
          className={`px-6 py-3 rounded-lg ${
            currentQuestionIndex === questions.length - 1 || isLoading
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
          disabled={
            answeredCount !== questions.length || isInProgress || isCompleted
          } // ปุ่ม Submit จะกดได้เมื่อทำครบทุกข้อและ is_inprogress เป็น false
          className={`px-8 py-3 rounded-lg font-bold ${
            answeredCount === questions.length && !isInProgress && !isCompleted
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

export default withAuth(QuestionPage);
