"use client";
import React from "react";

const QuestionContent = React.memo(
  ({
    isLoading,
    currentQuestion,
    currentQuestionIndex,
    answers,
    handleSelectOption,
  }: {
    isLoading: boolean;
    currentQuestion: any;
    currentQuestionIndex: number;
    answers: (number | null)[];
    handleSelectOption: (option_id: number) => void;
  }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <>
        {/* คำถาม */}
        <p
          className="text-lg font-medium text-gray-800 break-words overflow-wrap line-clamp-3"
          style={{ wordWrap: "break-word" }}
        >
          {currentQuestion.question_text}
        </p>

        {/* ตัวเลือก */}
        <div className="grid grid-cols-2 gap-4 max-h-[250px] overflow-y-auto">
          {currentQuestion.options.map((option: any) => (
            <button
              key={option.option_id}
              onClick={() => handleSelectOption(option.option_id)}
              className={`p-4 rounded-lg transition-all ${
                answers[currentQuestionIndex] === option.option_id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                textAlign: "center",
              }}
            >
              {option.option_text}
            </button>
          ))}
        </div>
      </>
    );
  }
);

export default QuestionContent;
