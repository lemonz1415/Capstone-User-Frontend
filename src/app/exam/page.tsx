"use client";

import { useRouter } from "next/navigation";

interface Exam {
    id: string;
    title: string;
    date: string; 
  };

const mockExams: Exam[] = [
  {
    id: "1",
    title: "Random Exam 1",
    date: "2025-02-10",
  },
  {
    id: "2",
    title: "Custom Template Exam 1",
    date: "2025-02-11",
  },
  {
    id: "3",
    title: "Random Exam 2",
    date: "2025-02-12",
  },
];

export default function ExamListPage() {
  const router = useRouter();

  // จัดเรียงรายการตามวันที่ (ล่าสุดขึ้นก่อน)
  const sortedExams = [...mockExams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleNewExam = () => {
    router.push("/exam/new"); // Route ไปยังหน้าสร้าง Exam ใหม่
  };

  const handleViewExam = (id: String) => {
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

      {/* รายการ Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative"
          >

            {/* Title */}
            <h2 className="text-xl font-bold text-[#0066FF] mb-2">{exam.title}</h2>

            {/* Date */}
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Date:</span> {exam.date}
            </p>

            {/* View Details Button */}
            <button
              onClick={() => handleViewExam(exam.id)}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

