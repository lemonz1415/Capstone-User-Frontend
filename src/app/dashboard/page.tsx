"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Select, SelectItem } from "@heroui/react";
import {
  getAllSkillQuery,
  getExamTestedStatQuery,
  getExamTestedSummarizeQuery,
  getAllExamLogIDQuery,
  getExamScoreQuery
} from "@/query/exam.query";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faChartBar,
  faCheckCircle,
  faPercentage,
} from "@fortawesome/free-solid-svg-icons";
import withAuth from "@/middlewares/withAuth";

// Register necessary chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatType {
  total_exam_tested: number;
  total_questions: number;
  score: number;
  total: number;
  average_score: string;
}

function Dashboard() {
  const router = useRouter();
  const [fetchData, setFetchData] = useState<any>();
  const [stat, setStat] = useState<StatType>();
  const [isLoading, setIsLoading] = useState(true);
  const [skill, setSkill] = useState("");

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        const response = await getExamTestedSummarizeQuery(skill);
        setFetchData(response.summary);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    fetchExamData();
  }, [skill]);

  useEffect(() => {
    const fetchStat = async () => {
      try {
        setIsLoading(true);
        const response = await getExamTestedStatQuery();
        setStat(response.stat);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchStat();
  }, []);

  const [skillOption, setSkillOtion] = useState<any>([]);
  useEffect(() => {
    const fetchSkillOption = async () => {
      try {
        setIsLoading(true);
        const response = await getAllSkillQuery();
        const formatSkill = [
          { key: "", label: "All" },
          ...response.skill.map((skill: any) => ({
            key: skill.skill_name,
            label: skill.skill_name,
          })),
        ];
        setSkillOtion(formatSkill);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchSkillOption();
  }, []);

  const dataFilterBySkill = (skill: string) => {
    return fetchData?.filter((item: any) => item.skills === skill);
  };

  const groupedData = () => {
    if (isLoading || !fetchData?.length) return {};

    const filteredData = fetchData[0]?.skills
      ? dataFilterBySkill(skill)
      : fetchData;
    const result = filteredData.reduce((acc: any, exam: any) => {
      // สร้าง key โดยรวม test และ submitted_date
      const date = new Date(exam.submitted_date);
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);

      const key = `${exam.test}, ${formattedDate}`; // ใช้วันที่ที่ได้จากการ format

      // แปลง percentage เป็นตัวเลข
      const correct = parseFloat(exam.percentage.replace("%", ""));

      // เก็บค่าลงใน accumulator โดยใช้ key เป็นตัวระบุ
      acc[key] = { correct };

      return acc;
    }, {});

    return result;
  };

  const labels = Object.keys(groupedData());
  const correctPercentages = labels.map((test) => groupedData()[test].correct);
  const isShowChart = Number(stat?.total_exam_tested) === 0;

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Correct Percentage",
        data: correctPercentages, // Correct percentages for each test
        backgroundColor: "rgba(49, 112, 236, 0.8)", // Color of bars
        borderColor: "rgba(49, 112, 236, 1)", // Border color
        borderWidth: 1,
      },
    ],
  };

  // Options for the Bar Chart
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Performance for ${skill === "" ? "All" : skill} Skill`,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`, // Display percentage value
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
        },
        grid: {
          offset: true,
        },
        barThickness: 30,
      },
    },
  };

  return ( 
    <div className=" bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl md:text-[34px] font-extrabold text-[#0066FF]">
          User Performance Dashboard
        </h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-100 mb-8">
        <h3 className="text-xl font-bold text-[#0066FF] mb-4 pb-2 border-b border-gray-200">Key Metrics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg border border-blue-300 text-center transform hover:scale-105 transition-all duration-300">
            <FontAwesomeIcon
              icon={faChartBar}
              className="text-blue-200 text-4xl mb-2"
            />
            <h3 className="text-lg text-blue-200 font-semibold mb-4">
              Total Exams
            </h3>
            <p className="text-6xl font-bold text-white">
              {stat?.total_exam_tested ? stat?.total_exam_tested : "-"}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-lg shadow-lg border border-indigo-300 text-center transform hover:scale-105 transition-all duration-300">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="text-purple-200 text-4xl mb-2"
            />
            <h3 className="text-lg text-purple-200 font-semibold mb-4">
              Total Questions
            </h3>
            <p className="text-6xl font-bold text-white">
              {stat?.total_questions ? stat?.total_questions : "-"}
            </p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-lg shadow-lg border border-emerald-300 text-center transform hover:scale-105 transition-all duration-300">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-emerald-200 text-4xl mb-2"
            />
            <h3 className="text-lg text-emerald-200 font-semibold mb-4">
              Correct Score
            </h3>
            <p className="text-6xl font-bold text-white">
              {stat?.score ? `${stat?.score}/${stat?.total}` : "-"}
            </p>
          </div>

          <div className={`bg-gradient-to-r ${Number(stat?.average_score) < 50 ? 'from-orange-500 to-red-600' : 'from-teal-500 to-teal-600'} p-6 rounded-lg shadow-lg border ${Number(stat?.average_score) < 50 ? 'border-orange-300' : 'border-blue-300'} text-center transform hover:scale-105 transition-all duration-300`}>
            <FontAwesomeIcon
              icon={faPercentage}
              className={`text-4xl mb-2 ${Number(stat?.average_score) < 50 ? 'text-orange-200' :'text-emerald-200'}`}
            />
            <h3 className={`text-lg font-semibold mb-4 ${Number(stat?.average_score) < 50 ? 'text-orange-200' :'text-emerald-200'}`}>
              Percentage Score
            </h3>
            <p
              className="text-6xl font-bold ml-2 text-white" 
            >
              {stat?.average_score ? `${stat?.average_score}%` : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-100 w-full">
          <h4 className="text-xl font-bold text-[#0066FF] mb-4 pb-2 border-b border-gray-200">
            Performance Overview
          </h4>
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select
              className="max-w-xs w-full"
              placeholder="Select Skill"
              color="primary"
              onChange={(e) => setSkill(e.target.value)}
            >
              {skillOption.map((skill: any) => (
                <SelectItem className="text-black" key={skill.key}>
                  {skill.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* ตรวจสอบว่า correctPercentage มีค่าเป็น 0 หรือไม่ */}
          {isShowChart ? (
            <div className="flex flex-col justify-center items-center h-[400px] w-full rounded-lg text-center">
              <p className="text-lg text-gray-600 mb-4">
                No exam tested found.
              </p>
              <p className="text-sm text-gray-500">
                Data will be updated once at least one exam set is completed.
              </p>
              <button
                onClick={() => router.push("/exam/new")}
                className="bg-blue-500 text-white mt-4 px-6 py-2 rounded-lg hover:bg-blue-600 hover:scale-105 transform transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
              >
                {/* ใช้ Font Awesome icon */}
                <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5" />
                <span>Start your first exam</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[400px] w-full rounded-lg">
              <Bar data={data} options={options} />
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default withAuth(Dashboard);
