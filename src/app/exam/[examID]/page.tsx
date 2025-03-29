"use client";

import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLightbulb,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import {
  getAIExplanation,
  getAISuggestion,
  getAllExamLogIDQuery,
  getExamTestedDetailQuery,
} from "@/query/exam.query";
import withAuth from "@/middlewares/withAuth";
import { convertDateToEN } from "@/utils/util.function";
import classNames from "classnames";
import { useAuth } from "@/contexts/auth.context";
import Modal from "@/components/modal";

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

function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examID = Number(params?.examID);
  const { getUserId } = useAuth();

  const [examDetail, setExamDetail] = useState<ExamDetail2[] | undefined>();
  const [examIdList, setExamIdList] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false); // Status of exam completion
  const [finishAt, setFinishAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      setIsLoading(true);
      try {
        const [examData, examAll] = await Promise.all([
          getExamTestedDetailQuery(examID),
          getAllExamLogIDQuery(Number(getUserId())),
        ]);

        if (examData) {
          setExamDetail(examData.exam_detail);
          setIsCompleted(examData.is_completed);
          if (examData.exam_detail?.length) {
            setFinishAt(examData.exam_detail[0].finish_at);
          }
        }

        setExamIdList(examAll.map((e: any) => e.exam_id));
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
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

  const [aiLoading, setAiLoading] = useState<boolean[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (examDetail) {
      setAiLoading(new Array(examDetail.length).fill(false));
    }
  }, [examDetail]);

  const onAIExplain = async (question: any, index: number) => {
    setAiLoading((prevLoading) => {
      const newLoading = [...prevLoading];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      const message = {
        question: question.question_text,
        choices: question.options.map((option: any) => ({
          option: option.option_text,
          is_correct: option.is_correct,
        })),
      };

      const response = await getAIExplanation(message);

      setAnswers((prevAnswers) => {
        const newAnswers = [...prevAnswers];
        newAnswers[index] = response;
        return newAnswers;
      });
    } catch (error) {
      console.error("Error fetching AI explanation:", error);
    } finally {
      setAiLoading((prevLoading) => {
        const newLoading = [...prevLoading];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  const [aiSuggestionLoading, setAISuggestionLoading] = useState<boolean[]>([]);
  const [suggestionAnswers, setSuggestionAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (examDetail) {
      setAISuggestionLoading(new Array(examDetail.length).fill(false));
    }
  }, [examDetail]);

  const onAISuggest = async (question: any, index: number) => {
    setAISuggestionLoading((prevLoading) => {
      const newLoading = [...prevLoading];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      const message = {
        question: question.question_text,
        choices: question.options.map((option: any) => ({
          option: option.option_text,
          is_correct: option.is_correct,
        })),
      };

      const response = await getAISuggestion(message);

      setSuggestionAnswers((prevAnswers) => {
        const newAnswers = [...prevAnswers];
        newAnswers[index] = response;
        return newAnswers;
      });
    } catch (error) {
      console.error("Error fetching AI explanation:", error);
    } finally {
      setAISuggestionLoading((prevLoading) => {
        const newLoading = [...prevLoading];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  //ACCESS CHECKING ...
  const [isCanAccess, setIsCanAccess] = useState<boolean>(true);
  useEffect(() => {
    if (!isLoading) {
      const isOwnExam = examIdList.includes(examID);
      setIsCanAccess(isOwnExam);
    }
  }, [examIdList, isLoading, examID]);

  return (
    <div className="container mx-auto py-10">
      <Modal
        isOpen={!isCanAccess}
        title="Access Denied"
        message="You do not have permission to access this page."
        onClose={() => router.push("/exam")}
        onConfirmFetch={() => router.push("/exam")}
      />
      {isCanAccess && (
        <>
          <button
            onClick={() => router.push("/exam")}
            className="flex items-center text-blue-500 hover:text-blue-700 font-semibold mb-6"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Exams
          </button>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-bold text-[#0066FF] mb-4">
              Examination Answers
            </h1>
            {isCompleted && (
              <div className="mt-4 text-gray-600">
                <p className="mt-2">
                  <span className="font-semibold text-xl">Submitted:</span>{" "}
                  <span className="text-xl">
                    {finishAt && convertDateToEN(finishAt)}
                  </span>
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-xl">Score:</span>{" "}
                  <span className="text-xl">
                    {correctAnswers} / {totalQuestions}
                  </span>
                </p>
              </div>
            )}
          </div>

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
                          question.options.find(
                            (option) => option.is_correct === 1
                          )?.option_text
                        }
                      </p>
                    </div>
                  )}
                  <div className="mt-2">
                    <button
                      onClick={() => onAIExplain(question, index)}
                      className={classNames(
                        "flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
                        {
                          "opacity-50 pointer-events-none":
                            aiLoading[index] ||
                            aiLoading.some((loading) => loading === true),
                        }
                      )}
                      disabled={aiLoading[index]}
                    >
                      {aiLoading[index] ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-2"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                      )}
                      <span>
                        {aiLoading[index]
                          ? "Loading..."
                          : "Generate Explanation with AI"}
                      </span>
                    </button>

                    {answers[index] && (
                      <div className="answer mt-4 p-4 bg-gray-100 rounded-lg text-black">
                        <strong>AI Explanation:</strong>
                        <p>{answers[index]}</p>
                      </div>
                    )}

                    <button
                      onClick={() => onAISuggest(question, index)}
                      className={classNames(
                        "flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 mt-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105",
                        {
                          "opacity-50 pointer-events-none":
                            aiSuggestionLoading[index] ||
                            aiSuggestionLoading.some(
                              (loading) => loading === true
                            ),
                        }
                      )}
                      disabled={aiSuggestionLoading[index]}
                    >
                      {aiSuggestionLoading[index] ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin mr-2"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                      )}
                      <span>
                        {aiSuggestionLoading[index]
                          ? "Loading..."
                          : "Get AI Suggestion"}
                      </span>
                    </button>

                    {suggestionAnswers[index] && (
                      <div className="answer mt-4 p-4 bg-gray-100 rounded-lg text-black">
                        <strong>AI Suggestion:</strong>
                        <p>{suggestionAnswers[index]}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default withAuth(ExamDetailPage);
