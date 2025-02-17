"use client";

import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { getExamTestedDetailQuery } from "@/query/exam.query";

// Data Type Definitions
interface Option {
  option_id: number;
  option_text: string;
  is_correct: 1 | 0;
}

interface ExamDetail2 {
  exam_id: number;
  question_id: number;
  skill_name: string;
  question_text: string;
  selected_option_id: number | null;
  options: Option[];
}

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examID = Number(params?.examID);

  const [examDetail, setExamDetail] = useState<ExamDetail2[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false); // Status of exam completion

  useEffect(() => {
    const fetchExamDetail = async () => {
      setIsLoading(true);
      const data = await getExamTestedDetailQuery({ exam_id: examID });
      setExamDetail(data?.exam_detail);
      setIsCompleted(data?.is_completed);
      setIsLoading(false);
    };
    fetchExamDetail();
  }, [examID]);

  // Calculation of the score
  const totalQuestions = examDetail?.length || 0;
  const correctAnswers =
    examDetail?.filter(
      (q) =>
        q.selected_option_id !== null &&
        q.options.find(
          (option) =>
            option.option_id === q.selected_option_id && option.is_correct === 1
        )
    )?.length || 0;

  return (
    <div className="container mx-auto py-10">
      {/* Back Button */}
      <button
        onClick={() => router.push("/exam")}
        className="flex items-center text-blue-500 hover:text-blue-700 font-semibold mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Exams
      </button>

      {/* Exam Title and Score */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-[#0066FF] mb-4">
          Vocabulary and Grammar Exam
        </h1>
        {isCompleted && (
          <p className="text-gray-600 mt-2">
            <span className="font-semibold text-xl">Score:</span> <span className="text-xl">{correctAnswers} /{" "}
            {totalQuestions}</span> 
          </p>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Questions</h2>
        <ul className="space-y-4">
          {examDetail?.map((question, index) => (
            <li key={question.question_id} className="border-b pb-4">
              <p className="text-lg font-medium text-gray-800">
                Q{index + 1}: {question.question_text}
              </p>

              <ul className="mt-2 space-y-1">
                {question.options.map((option) => (
                  <li
                    key={option.option_id}
                    className={`px-4 py-2 rounded-lg text-gray-400 ${
                      isCompleted
                        ? option.is_correct === 1
                          ? "bg-green-100 text-green-700"
                          : question.selected_option_id === option.option_id
                          ? "bg-red-100 text-red-700"
                          : ""
                        : ""
                    }`}
                  >
                    {option.option_text}
                  </li>
                ))}
              </ul>

              {isCompleted && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <strong>Your Answer:</strong>{" "}
                    {question.options.find(
                      (option) =>
                        option.option_id === question.selected_option_id
                    )?.option_text || "-"}
                  </p>
                  <p>
                    <strong>Correct Answer:</strong>{" "}
                    {
                      question.options.find((option) => option.is_correct === 1)
                        ?.option_text
                    }
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
