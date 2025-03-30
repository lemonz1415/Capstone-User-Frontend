"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";
import withAuth from "@/middlewares/withAuth";
import { fetchUserInfoQuery } from "@/query/auth.query";
import { getAllExamLogIDQuery, getExamScoreQuery } from "@/query/exam.query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faPen,
  faUser,
  faEnvelope,
  faCalendarAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import ProfileBackground from "../../../public/images/auth-page-bg.jpg";
import {
  convertDateToENWithoutTime,
  convertDateToEN,
} from "@/utils/util.function";
import Image from "next/image";

interface User {
  user_id: number;
  firstname: string;
  lastname: string;
  email: string;
  create_at: string;
  update_at: string;
  DOB: string;
  role: string;
}

interface Exam {
  exam_id: number;
  is_completed: boolean;
  create_at: string;
  finish_at: string;
  attempt_at?: string;
}

interface Score {
  total: number;
  correct: number;
}

const ProfileBG = () => (
  <div className="absolute inset-0 h-[250px]">
    <Image
      src={ProfileBackground}
      alt="Heading Background"
      fill
      style={{ objectFit: "cover" }}
    />
  </div>
);

function ProfilePage() {
  const router = useRouter();
  const { userId, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [scores, setScores] = useState<Record<number, Score>>({});
  type FilterType = "all" | "completed" | "inProgress";
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamStatistics = async () => {
      if (!userId) return;

      try {
        const data = await getAllExamLogIDQuery(userId);
        setExams(data);

        // คำนวณสถิติต่างๆ
        const completedExams = data.filter((exam: Exam) => exam.is_completed);
        const inProgressExams = data.filter((exam: Exam) => !exam.is_completed);

        // ดึงคะแนนสำหรับข้อสอบที่ทำเสร็จแล้ว
        const scoresData = await Promise.all(
          completedExams.map(async (exam: Exam) => {
            try {
              const scoreData = await getExamScoreQuery(exam.exam_id);
              return { exam_id: exam.exam_id, scoreData };
            } catch (error) {
              console.error(
                `Error fetching score for exam ${exam.exam_id}:`,
                error
              );
              return {
                exam_id: exam.exam_id,
                scoreData: { correct: 0, total: 0 },
              };
            }
          })
        );

        const scoresObject = scoresData.reduce(
          (acc, { exam_id, scoreData }) => {
            acc[exam_id] = scoreData;
            return acc;
          },
          {}
        );

        setScores(scoresObject);
      } catch (error) {
        console.error("Error fetching exam statistics:", error);
      }
    };

    fetchExamStatistics();
  }, [userId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLoggedIn && userId) {
        try {
          setLoading(true);
          const data = await fetchUserInfoQuery(userId);
          setUserInfo(data);
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserInfo();
  }, [isLoggedIn, userId]);

  // คำนวณคะแนนเฉลี่ย
  const calculateAverageScore = () => {
    const completedExamIds = exams
      .filter((exam) => exam.is_completed)
      .map((exam) => exam.exam_id);

    if (completedExamIds.length === 0) return 0;

    let totalScore = 0;
    let validExams = 0;

    completedExamIds.forEach((examId) => {
      if (scores[examId]) {
        const scoreData = scores[examId];
        // คำนวณเปอร์เซ็นต์หรือใช้คะแนนตามที่ต้องการ
        const examScore = (scoreData.correct / scoreData.total) * 100;
        totalScore += examScore;
        validExams++;
      }
    });
    return validExams > 0 ? totalScore / validExams : 0;
  };
  const averageScore = calculateAverageScore();

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
  };

  const getFilteredExams = () => {
    if (!exams) return [];

    let filteredExams = [];

    switch (filterType) {
      case "completed":
        // กรองเฉพาะข้อสอบที่ทำเสร็จแล้ว และเรียงตาม finish_at
        filteredExams = exams
          .filter((exam) => exam.is_completed)
          .sort(
            (a, b) =>
              new Date(b.finish_at).getTime() - new Date(a.finish_at).getTime()
          );
        break;

      case "inProgress":
        // กรองเฉพาะข้อสอบที่กำลังทำ และเรียงตาม attempt_at หรือ create_at
        filteredExams = exams
          .filter((exam) => !exam.is_completed)
          .sort(
            (a, b) =>
              new Date(b.attempt_at || b.create_at).getTime() -
              new Date(a.attempt_at || a.create_at).getTime()
          );
        break;

      case "all":
      default:
        // แสดงทั้งหมด และเรียงตามกิจกรรมล่าสุด (ไม่ว่าจะเป็น finish_at หรือ attempt_at)
        filteredExams = exams.sort((a, b) => {
          const aDate = a.is_completed
            ? new Date(a.finish_at).getTime()
            : new Date(a.attempt_at || a.create_at).getTime();
          const bDate = b.is_completed
            ? new Date(b.finish_at).getTime()
            : new Date(b.attempt_at || b.create_at).getTime();
          return bDate - aDate;
        });
        break;
    }

    return filteredExams;
  };

  if (loading) return <div>Loading...</div>;

  if (!userInfo) return <div>No user information found</div>;

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col">
      {/* Header Background */}
      <div className="min-h-64 w-full">
        <ProfileBG />
      </div>

      <div className="container mx-auto px-4 -mt-20 ">
        {/* Profile Photo - วางทับระหว่าง background กับ container */}
        <div className="relative flex flex-col justify-center items-center">
          <div className="w-32 h-32 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-lg z-10">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-blue-600"
              size="7x"
            />
          </div>
          <div className="text-center mt-4 ">
            <h2 className="text-2xl font-bold text-gray-800">
              {userInfo.firstname} {userInfo.lastname}
            </h2>
            <p className="text-gray-400">{userInfo.email}</p>
            <div className="mt-2">
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2.5 py-0.5 rounded">
                {userInfo.role || "Tester"}
              </span>
            </div>
          </div>
        </div>

        {/* White Container with Profile Info */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 w-full mx-auto my-8">
          {/* Header with title and edit button */}
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-grey-200">
            <h2 className="text-xl font-bold text-blue-700">
              User Information
            </h2>
            {/* <button
              className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
              onClick={() => {}}
            >
              <span>
                <FontAwesomeIcon icon={faPen} className="text-sm mr-1" />
                Edit Info
              </span>
            </button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-4 rounded-lg -mt-1">
                <FontAwesomeIcon
                  icon={faUser}
                  size="xl"
                  className="text-blue-500"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm">
                  First Name
                </h3>
                <p className="text-gray-800 font-medium">
                  {userInfo.firstname || "-"}
                </p>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-4 rounded-lg -mt-1">
                <FontAwesomeIcon
                  icon={faUser}
                  size="xl"
                  className="text-blue-500"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm">Last Name</h3>
                <p className="text-gray-800 font-medium">
                  {userInfo.lastname || "-"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-4 rounded-lg -mt-1">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  size="xl"
                  className="text-blue-500"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm">Email</h3>
                <p className="text-gray-800 font-medium">
                  {userInfo.email || "-"}
                </p>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-4 rounded-lg -mt-1">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  size="xl"
                  className="text-blue-500"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-500 text-sm">
                  Date of Birth
                </h3>
                <p className="text-gray-800 font-medium">
                  {userInfo.DOB
                    ? convertDateToENWithoutTime(userInfo.DOB)
                    : "-"}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-4 rounded-lg -mt-1">
                  <FontAwesomeIcon
                    icon={faClock}
                    size="xl"
                    className="text-blue-500"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 text-sm">
                    Member Since
                  </h3>
                  <p className="text-gray-800 font-medium">
                    {convertDateToENWithoutTime(userInfo.create_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Statistics Section */}
      <div className="container bg-white rounded-xl shadow-md p-6 md:p-8 w-full mx-auto my-8 px-4 -mt-1">
        {/* Header with title */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-grey-200">
          <h2 className="text-xl font-bold text-blue-700">Exam Statistics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Exams */}
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <span className="text-3xl font-bold text-blue-600">
              {exams?.length || 0}
            </span>
            <p className="text-blue-700 mt-2">Total Exams</p>
          </div>

          {/* Completed */}
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <span className="text-3xl font-bold text-green-600">
              {exams?.filter((exam) => exam.is_completed).length || 0}
            </span>
            <p className="text-green-700 mt-2">Completed</p>
          </div>

          {/* Average Score */}
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <span className="text-3xl font-bold text-purple-600">
              {averageScore.toFixed(2)}%
            </span>
            <p className="text-gray-700 mt-2">Average Score</p>
          </div>

          {/* In Progress */}
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <span className="text-3xl font-bold text-yellow-600">
              {exams?.filter((exam) => !exam.is_completed).length || 0}
            </span>
            <p className="text-yellow-700 mt-2">In Progress</p>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-blue-700 mb-4 pb-2 border-b border-gray-200">
            Recent Exams
          </h3>

          {/* ตัวกรอง */}
          <div className="inline-flex p-1 mb-4">
            <button
              className={`px-5 py-2 text-sm font-medium ${
                filterType === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } rounded-l-2xl transition-all duration-200`}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>
            <button
              className={`px-5 py-2 text-sm font-medium ${
                filterType === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-all duration-200`}
              onClick={() => handleFilterChange("completed")}
            >
              Completed
            </button>
            <button
              className={`px-5 py-2 text-sm font-medium ${
                filterType === "inProgress"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } rounded-r-2xl transition-all duration-200`}
              onClick={() => handleFilterChange("inProgress")}
            >
              In Progress
            </button>
          </div>

          {exams && exams.length > 0 ? (
            <div className="space-y-3">
              {getFilteredExams()
                .slice(0, 5)
                .map((exam) => (
                  <div
                    key={exam.exam_id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg
                    hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      if (exam.is_completed) {
                        router.push(`/exam/${exam.exam_id}`);
                      } else {
                        router.push(`/exam/${exam.exam_id}/question`);
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-900">Exam</p>
                      <p className="text-sm text-gray-500">
                        Submitted:{" "}
                        {exam.finish_at ? convertDateToEN(exam.finish_at) : "-"}
                      </p>
                    </div>
                    <div>
                      {exam.is_completed ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Completed{" "}
                          {scores[exam.exam_id] &&
                            `(${scores[exam.exam_id].correct}/${
                              scores[exam.exam_id].total
                            })`}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              {/* "View All Exams" */}
              <div className="mt-4">
                <button
                  onClick={() => router.push("/exam")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-center px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  View All Exams
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No exams found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
