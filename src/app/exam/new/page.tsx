"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRandom,
  faCogs,
  faPlay,
  faArrowLeft,
  faTimes,
  faSpinner,
  faExclamationTriangle,
  faBook,
  faSpellCheck,
  faFileAlt,
  faMinus,
  faPlus,
  faClock,
  faAlignLeft,
  faArrowRightArrowLeft,
  faPenNib,
  faVolumeUp,
  faLightbulb,
  faChevronUp,
  faChevronDown,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/modal";
import {
  generateRandomExamQuery,
  generateCustomExamQuery,
  getAllExamLogIDQuery,
  getAllSkillsQuery
} from "@/query/exam.query";
import withAuth from "@/middlewares/withAuth";
import { useAuth } from "@/contexts/auth.context";

interface Skill {
  skill_id: number;
  skill_name: string;
  icon: any;
  question_count: number;
  description: string;
  example: {
    question: string;
    choices: string[] | null;
  };
  showExample: boolean;
}

function NewExamPage() {

  const iconMap = {
    Vocabulary: faBook,
    Tenses: faClock,
    Grammar: faSpellCheck,
    "Reading Comprehension": faFileAlt,
    "Sentence Structure": faAlignLeft,
    "Phrasal Verbs": faArrowRightArrowLeft,
    "Word Formation": faLightbulb,
    "Pronunciation & Spelling": faVolumeUp,
    "Error Identification": faExclamationTriangle,
    "Writing Mechanics": faPenNib,
  };

  const descriptionMap = {
    Vocabulary:
      "Improve your vocabulary skills by learning new words and their meanings.",
    Tenses:
      "Practice verb tenses to enhance your understanding of English grammar.",
    Grammar:
      "Learn and practice English grammar rules to construct correct sentences.",
    "Reading Comprehension":
      "Enhance your reading skills by understanding passages and answering related questions.",
    "Sentence Structure":
      "Understand how sentences are structured to convey meaning effectively.",
    "Phrasal Verbs":
      "Learn common phrasal verbs and their usage in everyday English.",
    "Word Formation":
      "Practice forming words using prefixes, suffixes, and roots.",
    "Pronunciation & Spelling":
      "Improve your pronunciation and spelling skills for better communication.",
    "Error Identification":
      "Identify grammatical errors in sentences and correct them.",
    "Writing Mechanics":
      "Learn the mechanics of writing, including punctuation and formatting.",
  };

  const exampleMap = {
    Vocabulary: {
      question: 'Choose the correct synonym for the word "happy".',
      choices: ["sad", "joyful", "angry", "excited"],
    },
    Tenses: {
      question:
        "Fill in the blank with the correct verb tense - He ___ (go) to the store yesterday.",
      choices: null,
    },
    Grammar: {
      question:
        "Identify the subject and predicate in the sentence - The cat sleeps on the mat.",
      choices: null,
    },
    "Reading Comprehension": {
      question: "What is the main idea of the passage?",
      choices: null,
    },
    "Sentence Structure": {
      question:
        "Rearrange the words to form a meaningful sentence - quickly / dog / ran / the.",
      choices: null,
    },
    "Phrasal Verbs": {
      question: "Choose the correct meaning for the phrasal verb - give up.",
      choices: [
        "to stop doing something",
        "to start doing something",
        "to continue doing something",
        "to change something",
      ],
    },
    "Word Formation": {
      question: "Form a noun from the verb - decide.",
      choices: null,
    },
    "Pronunciation & Spelling": {
      question: "Spell the word correctly - accomodation or accommodation?",
      choices: ["accomodation", "accommodation"],
    },
    "Error Identification": {
      question:
        "Identify the grammatical error in this sentence - She don’t like apples.",
      choices: null,
    },
    "Writing Mechanics": {
      question: "Add punctuation marks to this sentence - where are you going",
      choices: null,
    },
  };

  const router = useRouter();
  const [examType, setExamType] = useState<"random" | "custom">("random");
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExamID, setGeneratedExamID] = useState<number | null>(null); // เก็บ exam_id ที่สร้าง
  const [isBlocked, setIsBlocked] = useState(false); // บล็อกการเข้าถึง
  const { userId } = useAuth();

  const totalQuestions = skills.reduce(
    (sum, skill) => sum + skill.question_count,
    0
  );

  // Fetch ข้อมูลเพื่อเช็คจำนวนข้อสอบที่ยังไม่เสร็จ
  useEffect(() => {
    const fetchExamStatus = async () => {
      try {
        if (!userId) {
          console.error("User ID not found");
          return;
        }
        const data = await getAllExamLogIDQuery(userId); // เรียก API ดึงข้อมูล Exam
        const inProgressExams = data.filter((exam: any) => !exam.is_completed); // นับข้อสอบที่ยังไม่เสร็จ

        if (inProgressExams.length >= 5) {
          setIsBlocked(true); // บล็อกการเข้าถึงหากมี inProgress >= 5
        }
      } catch (error) {
        console.error("Error fetching exam status:", error);
      }
    };

    fetchExamStatus();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData: Skill[] = await getAllSkillsQuery(); 
        const mappedSkills = skillsData.map((skill) => ({
          ...skill,
          icon: iconMap[skill.skill_name as keyof typeof iconMap] || faQuestionCircle, 
          question_count: 0, 
          description: descriptionMap[skill.skill_name as keyof typeof descriptionMap] || "",
          example: exampleMap[skill.skill_name as keyof typeof exampleMap] || { question: "", choices: null },
          showExample: false, 
        }));
        setSkills(mappedSkills); 
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };
  
    fetchSkills();
  }, []);

  const handleQuestionCountChange = (skill_id: number, value: string) => {
    // ลบเลข 0 นำหน้าและแปลงเป็นตัวเลข
    const numValue = parseInt(value.replace(/^0+/, "")) || 0;

    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.skill_id === skill_id
          ? { ...skill, question_count: numValue }
          : skill
      )
    );
  };

  const handleInputBlur = (skill_id: number) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.skill_id === skill_id
          ? { ...skill, question_count: skill.question_count || 0 }
          : skill
      )
    );
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
  };

  const handleIncrement = (skill_id: number) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.skill_id === skill_id
          ? { ...skill, question_count: skill.question_count + 1 }
          : skill
      )
    );
  };

  const handleDecrement = (skill_id: number) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.skill_id === skill_id && skill.question_count > 0
          ? { ...skill, question_count: skill.question_count - 1 }
          : skill
      )
    );
  };

  const toggleExample = (skill_id: number) => {
    setSkills((prevSkills) =>
      prevSkills.map((skill) =>
        skill.skill_id === skill_id
          ? { ...skill, showExample: !skill.showExample }
          : skill
      )
    );
  };

  const handleStartExam = async () => {
    setIsLoading(true); // แสดงสถานะ Loading

    try {
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      if (examType === "random") {
        const result = await generateRandomExamQuery(userId);

        if (result?.success && result.exam_id) {
          setGeneratedExamID(result.exam_id);
          setIsModalOpen(true);
        } else {
          console.error("Failed to generate exam");
        }
      } else if (examType === "custom") {
        const result = await generateCustomExamQuery(userId, skills);
      if (result) {
        setGeneratedExamID(result);
        setIsModalOpen(true);
      } else {
        console.error("Failed to generate custom exam");
      }
    }
    } catch (error) {
      console.error("Error starting exam:", error);
    } finally {
      setIsLoading(false); // ปิดสถานะ Loading
    }
  };

  const handleConfirmStart = () => {
    if (generatedExamID) {
      router.push(`/exam/${generatedExamID}/question`); // Redirect ไปยังหน้าคำถามข้อแรก
    }
  };

  const handleCancel = () => {
    router.push("/exam"); // กลับไปยังหน้ารวม Exam
  };

  if (isBlocked) {
    return (
      <div className="container mx-auto py-10 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-8xl mb-4"
          />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-[34px] font-extrabold text-[#FF0000] mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          You cannot create a new exam until you complete or submit your current
          In Progress exams.
        </p>

        {/* Button */}
        <button
          onClick={handleCancel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
        >
          Go Back to Exams
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Modal Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmFetch={handleConfirmStart}
        title="Preview Exam Settings"
        message={
          <>
            <p>
              You are about to start a new exam with the following settings:
            </p>
            <ul className="list-disc list-inside mt-4 text-left">
              <li>
                <strong>Exam Type:</strong>{" "}
                {examType === "random" ? "Random" : "Custom"}
              </li>
              {examType === "random" && (
                <li>
                  <strong>Number of Questions:</strong> {numberOfQuestions}
                </li>
              )}
              {examType === "custom" && (
                <div className="mt-4">
                <ul className="list-disc list-inside">
                  {/* Custom Skills Header */}
                  <li>
                    <strong>Custom Skills:</strong>
                    {/* Nested List for Skills */}
                    <ul className="list-disc list-inside ml-6 mt-2">
                      {skills
                        .filter((skill) => skill.question_count > 0) // แสดงเฉพาะ Skill ที่มีจำนวนคำถาม > 0
                        .map((skill) => (
                          <li key={skill.skill_id} className="text-sm text-gray-600">
                             <strong>{skill.skill_name}:</strong> {skill.question_count} questions
                          </li>
                        ))}
                    </ul>
                  </li>
                </ul>
              </div>
              )}
            </ul>
            <p className="mt-6">Are you sure you want to proceed?</p>
          </>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        actionType="default"
        isPreview={true}
      />

      {/* Back Button */}
      <div className="relative flex items-center mb-8">
        <button
          onClick={() => router.push("/exam")}
          className="absolute left-0 flex items-center text-blue-500 font-semibold"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Exams
        </button>

        <h1 className="mx-auto text-4xl font-bold text-[#0066FF]">
          Start a New Exam
        </h1>
      </div>

      {/* เลือกประเภทของ Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Random Exam */}
        <button
          onClick={() => setExamType("random")}
          className={`p-6 rounded-lg shadow-lg border text-left ${
            examType === "random"
              ? "border-blue-500 bg-blue-100"
              : "border-gray-200 bg-white"
          } cursor-pointer transition-all hover:shadow-xl`}
        >
          <FontAwesomeIcon
            icon={faRandom}
            className="text-blue-500 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Random Exam</h2>
          <p className="text-gray-600">
            Let the system randomly generate questions for you.
          </p>
        </button>

        {/* Custom Exam */}
        <button
          onClick={() => setExamType("custom")}
          className={`p-6 rounded-lg shadow-lg border text-left ${
            examType === "custom"
              ? "border-blue-500 bg-blue-100"
              : "border-gray-200 bg-white"
          } cursor-pointer transition-all hover:shadow-xl`}
        >
          <FontAwesomeIcon
            icon={faCogs}
            className="text-blue-500 text-3xl mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Custom Exam</h2>
          <p className="text-gray-600">
            Customize the number and type of questions you want to do.
          </p>
        </button>
      </div>

      {/* Select Number of Questions */}
      {examType === "random" && (
        <div className="mb-8">
          <label
            htmlFor="numberOfQuestions"
            className="block text-lg font-medium text-gray-700 mb-4"
          >
            Select Number of Questions:
          </label>
          {/* Button Group for Number Selection */}
          <div className="flex space-x-4">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => setNumberOfQuestions(num)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  numberOfQuestions === num
                    ? "bg-blue-500 text-white shadow-lg scale-[1.05]"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:shadow-md"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Skill Selection */}
      {examType === "custom" && (
        <div className="mb-8">
          <label
            htmlFor="skillsSelection"
            className="block text-lg font-medium text-gray-700 mb-4"
          >
            Select Number of Questions for Each Skill:
          </label>

          {/* Container สำหรับ Scroll */}
          <div className="relative border border-gray-300 rounded-lg overflow-y-auto max-h-80">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
              {skills.map((skill) => (
                <div
                  key={skill.skill_id}
                  className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg border border-gray-300 flex flex-col"
                >
                  {/* Icon, Skill Name, and Description */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-[80px] h-[80px] bg-blue-600 rounded-full flex items-center justify-center mr-4">
                        <FontAwesomeIcon
                          icon={skill.icon}
                          size="2xl"
                          className="text-white text-xl"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {skill.skill_name}
                        </p>
                        <p className="text-sm text-gray-500 max-w-[350px]">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                    {/* Show/Hide Example Button */}
                    <button
                      onClick={() => toggleExample(skill.skill_id)}
                      className="text-blue-500 text-sm flex items-center hover:underline cursor-pointer"
                    >
                      {skill.showExample ? "Hide Example" : "Show Example"}
                      <FontAwesomeIcon
                        icon={skill.showExample ? faChevronUp : faChevronDown}
                        className="ml-2"
                      />
                    </button>
                  </div>

                  {/* Example Question */}
                  {skill.showExample && (
                    <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200 my-4 transition-all duration-300">
                      <p className="text-sm text-gray-500 italic">
                        {skill.example.question}
                      </p>
                      {skill.example.choices && (
                        <ul className="mt-2 space-y-2">
                          {skill.example.choices.map((choice, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {index + 1}. {choice}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-end mt-auto space-x-1">
                    {/* Decrement Button */}
                    <button
                      onClick={() => handleDecrement(skill.skill_id)}
                      disabled={skill.question_count === 0}
                      className={`px-3 py-2 rounded-lg border ${
                        skill.question_count === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>

                    {/* Count Input */}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      value={skill.question_count}
                      onFocus={handleInputFocus}
                      onBlur={() => handleInputBlur(skill.skill_id)}
                      onChange={(e) =>
                        handleQuestionCountChange(
                          skill.skill_id,
                          e.target.value
                        )
                      }
                      className="w-[50px] h-[40px] text-center border-gray-500 rounded-md text-gray-600"
                    />

                    {/* Increment Button */}
                    <button
                      onClick={() => handleIncrement(skill.skill_id)}
                      className="px-3 py-2 rounded-lg border bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ปุ่ม Start และ Cancel */}
      <div className="flex justify-center space-x-4">
        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          } transition-all`}
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Cancel
        </button>

        {/* Start Button */}
        <button
          onClick={handleStartExam}
          disabled={
            isLoading || (examType === "custom" && totalQuestions === 0)
          }
          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white ${
            isLoading || (examType === "custom" && totalQuestions === 0)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } transition-all`}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              Start Exam
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default withAuth(NewExamPage);
