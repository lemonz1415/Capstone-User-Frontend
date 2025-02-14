"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Mock Data สำหรับข้อสอบและคำถาม
interface Question {
  id: string;
  questionText: string;
  choices: { [key: string]: string }; // ตัวเลือก A, B, C, D
  correctAnswer: string; // คำตอบที่ถูกต้อง
  userAnswer?: string; // คำตอบที่ผู้ใช้เลือก (อาจไม่มี)
}

interface ExamDetail {
  id: string;
  title: string;
  date: string;
  questions: Question[];
}

const mockExamDetail: ExamDetail = {
    id: "1",
    title: "Vocabulary and Grammar Exam",
    date: "2025-02-10",
    questions: [
      {
        id: "1",
        questionText: "Choose the correct synonym for 'happy'.",
        choices: { A: "Sad", B: "Joyful", C: "Angry", D: "Tired" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "2",
        questionText:
          "Choose the word that best completes the sentence: 'She is very __ about her future.'",
        choices: { A: "optimistic", B: "pessimistic", C: "confused", D: "angry" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "3",
        questionText: "What is the opposite of 'increase'?",
        choices: { A: "Expand", B: "Grow", C: "Reduce", D: "Enlarge" },
        correctAnswer: "C",
        userAnswer: "B",
      },
      {
        id: "4",
        questionText:
          "'He is a very __ person who always helps others.' Choose the word that best fits.",
        choices: { A: "selfish", B: "generous", C: "lazy", D: "greedy" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "5",
        questionText:
          "'The weather today is __.' Which word best completes the sentence?",
        choices: { A: "cloudy", B: "brightly", C: "happily", D: "quickly" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "6",
        questionText:
          "'The movie was so __ that everyone laughed throughout.' Choose the word that best fits.",
        choices: { A: "boring", B: "funny", C: "sad", D: "confusing" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "7",
        questionText:
          "'The __ cat slept on the sofa all day.' Choose the adjective that best describes the cat.",
        choices: { A: "lazy", B: "energetic", C: "angry", D: "quick" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "8",
        questionText:
          "'He is known for his __ behavior.' Which word best completes the sentence?",
        choices: { A: "kindness", B: "anger", C: "laziness", D: "greed" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "9",
        questionText: "'She __ to the market yesterday.' Choose the correct verb form.",
        choices: { A: "goes", B: "gone", C: "went", D: "going" },
        correctAnswer: "C",
        userAnswer: "B",
      },
      {
        id: "10",
        questionText: "'If I __ rich, I would travel the world.' Choose the correct verb form.",
        choices: { A: "am", B: "was", C: "were", D: "be" },
        correctAnswer: "C",
        userAnswer: "B",
      },
      {
        id: "11",
        questionText: "'He has been working here __ three years.' Choose the correct preposition.",
        choices: { A: "since", B: "for", C: "in", D: "at" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "12",
        questionText:
          "'The book __ by J.K. Rowling is very popular.' Choose the correct verb form.",
        choices: { A: "wrote", B: "written", C: "writing", D: "writes" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "13",
        questionText:
          "'She __ a letter when I arrived.' Choose the correct verb tense.",
        choices: { A: "was writing", B: "writes", C: "wrote", D: "is writing" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "14",
        questionText:
          "'He __ dinner before we got home.' Choose the correct verb tense.",
        choices: { A: "has cooked", B: "had cooked", C: "cooks", D: "is cooking" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "15",
        questionText:
          "'The train __ at the station at 5 PM tomorrow.' Choose the correct future tense.",
        choices: { A: "arrives", B: "will arrive", C: "arriving", D:"arrive"},
        correctAnswer:"B",
        userAnswer: "B"
    },
    {
        id: "16",
        questionText: "'She is very __ about her upcoming exam.' Choose the word that best fits.",
        choices: { A: "excited", B: "nervous", C: "confident", D: "angry" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "17",
        questionText: "'The cake __ by my mother was delicious.' Choose the correct verb form.",
        choices: { A: "bakes", B: "baked", C: "baking", D: "was bake" },
        correctAnswer: "B",
        userAnswer: "B",
      },
      {
        id: "18",
        questionText:
          "'He always __ his homework before dinner.' Choose the correct verb form.",
        choices: { A: "does", B: "do", C: "did", D: "doing" },
        correctAnswer: "A",
        userAnswer: "B",
      },
      {
        id: "19",
        questionText:
          "'The __ dog barked loudly at the stranger.' Choose the adjective that best describes the dog.",
        choices: { A: "quiet", B: "brave", C: "angry", D: "lazy" },
        correctAnswer: "C",
        userAnswer: "B",
      },
      {
        id: "20",
        questionText:
          "'They __ to the park every weekend.' Choose the correct verb form.",
        choices: { A: "goes", B: "go", C: "going", D:"gone"},
        correctAnswer:"B",
        userAnswer: "B",
    },
  ],
};

export default function ExamDetailPage() {
  const router = useRouter();

  const { title, date, questions } = mockExamDetail;

  // คำนวณคะแนนรวม
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(
    (q) => q.userAnswer === q.correctAnswer
  ).length;

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

      {/* Exam Title and Date */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-[#0066FF]">{title}</h1>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Date:</span> {date}
        </p>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Score:</span> {correctAnswers} /{" "}
          {totalQuestions}
        </p>
      </div>

      {/* Questions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Questions</h2>
        <ul className="space-y-4">
          {questions.map((question) => (
            <li key={question.id} className="border-b pb-4">
              {/* Question Text */}
              <p className="text-lg font-medium text-gray-800">
                Q{question.id}: {question.questionText}
              </p>

              {/* Choices */}
              <ul className="mt-2 space-y-1">
                {Object.entries(question.choices).map(([key, value]) => (
                  <li
                    key={key}
                    className={`px-4 py-2 rounded-lg ${
                      question.correctAnswer === key
                        ? "bg-green-100 text-green-800"
                        : question.userAnswer === key
                        ? "bg-red-100 text-red-800"
                        : ""
                    }`}
                  >
                    {key}. {value}
                  </li>
                ))}
              </ul>

              {/* User Answer and Correct Answer */}
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>Your Answer:</strong>{" "}
                  {question.userAnswer
                    ? question.choices[question.userAnswer]
                    : "-"}
                </p>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  {question.choices[question.correctAnswer]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
