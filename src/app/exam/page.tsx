"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllExamLogIDQuery } from "@/query/exam.query";

interface Exam {
  exam_id: string;
  user_id: string;
  create_at: string;
  attempt_at: string | null;
  time_taken: string | null;
}

export default function ExamListPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]); // State สำหรับเก็บข้อมูล Exam
  const [isLoading, setIsLoading] = useState(true); // State สำหรับ Loading
  const isNoExams = !isLoading && exams.length === 0;
  // Fetch ข้อมูล Exam เมื่อ Component ถูก Mount
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      const data = await getAllExamLogIDQuery(); // เรียก API
      setExams(data); // เก็บข้อมูลที่ได้ใน State
      setIsLoading(false);
    };

    fetchExams();
  }, []);

  const handleNewExam = () => {
    router.push("/exam/new"); // Route ไปยังหน้าสร้าง Exam ใหม่
  };

  const handleViewExam = (id: string) => {
    router.push(`/exam/${id}`); // Route ไปยังหน้ารายละเอียดของ Exam
  };

  return (
    <div className="container mx-auto py-10">
      {/* หัวข้อและปุ่ม New Exam */}
      <div className="flex justify-between items-center mb-8">
        {/* หัวข้อ */}
        <h1 className="text-xl md:text-[34px] font-extrabold text-[#0066FF]">
          Your Exams
        </h1>
  
        {/* ปุ่มสร้าง Exam ใหม่ */}
        <button
          onClick={handleNewExam}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
        >
          + New Exam
        </button>
      </div>
  
      {/* Loading State */}
      {isLoading && (
        <p className="text-center text-gray-500">Loading exams...</p>
      )}
  
      {/* กรณีไม่มีข้อมูล Exam */}
      {isNoExams && (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-20 space-y-6">
          {/* Icon */}
          <div className="bg-blue-100 text-blue-500 p-6 rounded-full shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
  
          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-700">No Exams Found</h2>
  
          {/* Description */}
          <p className="text-gray-500 max-w-md">
            You don't have any exams available at the moment. Start by creating a new exam and begin your journey to success!
          </p>
  
          {/* Button */}
          <button
            onClick={handleNewExam}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            + Create New Exam
          </button>
        </div>
      )}
  
      {/* รายการ Exams */}
      {!isLoading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative"
            >
              {/* Title */}
              <h2 className="text-xl font-bold text-[#0066FF] mb-2">
                Exam {exam.exam_id}
              </h2>
  
              {/* Date */}
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Created At:</span>{" "}
                {new Date(exam.create_at).toLocaleDateString("en-GB")}
              </p>
  
              {/* View Details Button */}
              <button
                onClick={() => handleViewExam(exam.exam_id)}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  }
