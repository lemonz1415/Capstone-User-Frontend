"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllExamLogIDQuery, getExamScoreQuery } from "@/query/exam.query";
import withAuth from "@/middlewares/withAuth";
interface Exam {
  exam_id: string;
  user_id: string;
  create_at: string;
  finish_at: string | null;
  attempt_at: string | null;
  time_taken: string | null;
  is_completed: boolean;
}
import { useAuth } from "@/contexts/auth.context";
import { convertDateToEN } from "@/utils/util.function";

function ExamListPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]); // State สำหรับเก็บข้อมูล Exam
  const [scores, setScores] = useState<{
    [key: string]: { correct: number; total: number };
  }>({}); // เก็บ Score ของแต่ละ Exam
  const [isLoading, setIsLoading] = useState(true); // State สำหรับ Loading
  const isNoExams = !isLoading && exams.length === 0;
  const { userId } = useAuth();

  // คำนวณจำนวนข้อสอบที่ยังไม่เสร็จ (is_completed = false)
  const inProgressCount = exams.filter((exam) => !exam.is_completed).length; // นับข้อสอบที่ยังไม่เสร็จ

  // Fetch ข้อมูล Exam เมื่อ Component ถูก Mount
  useEffect(() => {
    const fetchExams = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const data = await getAllExamLogIDQuery(userId); // เรียก API ดึงข้อมูล Exam

        // จัดเรียงข้อมูลตามวันที่ create_at (ใหม่ -> เก่า)
        const sortedData = data.sort((a: any, b: any) => {
          const aDate = a.is_completed
            ? new Date(a.finish_at).getTime()
            : new Date(a.attempt_at || a.create_at).getTime();
          const bDate = b.is_completed
            ? new Date(b.finish_at).getTime()
            : new Date(b.attempt_at || b.create_at).getTime();
          return bDate - aDate;
        });

        setExams(sortedData);

        // Fetch คะแนนสำหรับ Exam ที่เสร็จแล้ว
        const completedExams = data.filter((exam: Exam) => exam.is_completed);
        const scoresData = await Promise.all(
          completedExams.map(async (exam: Exam) => {
            try {
              const scoreData = await getExamScoreQuery(parseInt(exam.exam_id));
              return { exam_id: exam.exam_id, scoreData };
            } catch (error) {
              console.error(
                `Error fetching score for exam ${exam.exam_id}:`,
                error
              );
              return {
                exam_id: exam.exam_id,
                scoreData: { correct: 0, total: "N/A" },
              };
            }
          })
        );

        // แปลงข้อมูลคะแนนให้อยู่ในรูปแบบ Object
        const scoresObject = scoresData.reduce(
          (acc, { exam_id, scoreData }) => {
            acc[exam_id] = scoreData;
            return acc;
          },
          {} as { [key: string]: { correct: number; total: number } }
        );

        setScores(scoresObject);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleNewExam = () => {
    if (inProgressCount < 5) {
      router.push("/exam/new"); // Route ไปยังหน้าสร้าง Exam ใหม่
    }
  };

  const handleAction = (exam: Exam) => {
    if (exam.is_completed) {
      router.push(`/exam/${exam.exam_id}`); // ดูรายละเอียด
    } else {
      router.push(`/exam/${exam.exam_id}/question`); // ทำต่อ
    }
  };

  return (
    <div className="container mx-auto py-10">
      {/* หัวข้อและปุ่ม New Exam */}
      <div className="flex justify-between items-center mb-10 relative">
        {/* หัวข้อ */}
        <h1 className="text-xl md:text-[34px] font-extrabold text-[#0066FF]">
          Your Exams
        </h1>

        {/* ปุ่ม New Exam พร้อม Tooltip */}
        <div className="relative group">
          <button
            onClick={handleNewExam}
            disabled={inProgressCount >= 5}
            className={`font-bold py-2 px-4 rounded-lg shadow-md transition-all ${
              inProgressCount >= 5
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            + New Exam
          </button>

          {/* Tooltip */}
          {inProgressCount >= 5 && (
            <div className="absolute top-[110%] left-[-325%] bg-red-500 text-white text-sm rounded-md px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              You cannot create a new exam. You can have no more than 5
              in-progress exams.
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <p className="text-center text-gray-500">Loading exams...</p>
      )}

      {/* กรณีไม่มีข้อมูล Exam */}
      {isNoExams && (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-20 space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-700">
            No Exams Found
          </h2>
          <p className="text-gray-500 max-w-md">
            You don't have any exams available at the moment. Start by creating
            a new exam and begin your journey to success!
          </p>
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
          {exams.map((exam: Exam, index) => (
            <div
              key={exam.exam_id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative"
            >
              {/* Status */}
              <div
                className={`absolute top-4 right-4 px-[10px] py-[5px] rounded-lg text-white font-bold ${
                  exam.is_completed ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {exam.is_completed ? "Completed" : "In Progress"}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[#0066FF] mb-2">Exam</h2>

              {/* Date and Time */}
              <p className="text-gray-600 mb-2">
                {exam.is_completed ? (
                  <>
                    <span className="font-semibold">Submitted:</span>{" "}
                    {exam.finish_at ? convertDateToEN(exam.finish_at) : "-"}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Created At:</span>{" "}
                    {convertDateToEN(exam.create_at)}
                  </>
                )}
              </p>

              {/* Status and Score */}
              {exam.is_completed ? (
                <p className="bg-green-100 text-green-800 font-bold py-[5px] px-[10px] rounded-lg inline-block mt-[10px]">
                  Score: {scores[exam.exam_id]?.correct || 0} /{" "}
                  {scores[exam.exam_id]?.total || "N/A"}
                </p>
              ) : (
                <p className="bg-yellow-100 text-yellow-800 font-bold py-[5px] px-[10px] rounded-lg inline-block mt-[10px]">
                  Score: -
                </p>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleAction(exam)}
                className={`w-full mt-4 ${
                  exam.is_completed
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white font-bold py-2 px-4 rounded-lg transition-all`}
              >
                {exam.is_completed ? "View Details" : "Continue"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(ExamListPage);
