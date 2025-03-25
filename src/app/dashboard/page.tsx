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
  getExamTestedStatQuery,
  getExamTestedSummarizeQuery,
} from "@/query/exam.query";

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

  const skillSelect = [
    { key: "", label: "All" },
    { key: "Grammar", label: "Grammar" },
    { key: "Vocabulary", label: "Vocabulary" },
  ];

  const dataFilterBySkill = (skill: string) => {
    return fetchData?.filter((item: any) => item.skills === skill);
  };

  const groupedData = () => {
    if (isLoading || !fetchData?.length) return {};

    const filteredData = fetchData[0]?.skill
      ? dataFilterBySkill(skill)
      : fetchData;

    return filteredData.reduce((acc: any, item: any) => {
      if (!acc[item.test]) {
        acc[item.test] = {
          correct: parseFloat(item.percentage),
        };
      }
      return acc;
    }, {});
  };

  const labels = Object.keys(groupedData());
  const correctPercentages = labels.map((test) => groupedData()[test].correct);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Correct Percentage",
        data: correctPercentages, // Correct percentages for each test
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Color of bars
        borderColor: "rgba(54, 162, 235, 1)", // Border color
        borderWidth: 1,
      },
    ],
  };

  console.log(data);

  // Options for the Bar Chart
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Performance for Each Test",
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
        beginAtZero: true, // Start y-axis at 0
        max: 100, // Max value for y-axis
        ticks: {
          stepSize: 20, // Interval between ticks
        },
      },
    },
  };

  return (
    <div className="flex flex-col p-6 bg-blue-50 h-screen">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-800">Dashboard User</h2>
      </div>

      {/* Cards for Total Exams, Total Questions, Correct Score, Percentage Score */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Card 1: Total Exams */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg border border-blue-300 text-center transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg text-white font-semibold">Total Exams</h3>
          <p className="text-3xl font-bold text-white">
            {stat?.total_exam_tested ? stat?.total_exam_tested : "-"}
          </p>
        </div>

        {/* Card 2: Total Questions */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg border border-blue-300 text-center transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg text-white font-semibold">Total Questions</h3>
          <p className="text-3xl font-bold text-white">
            {stat?.total_questions ? stat?.total_questions : "-"}
          </p>
        </div>

        {/* Card 3: Correct Score / Total Score */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg border border-blue-300 text-center transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg text-white font-semibold">
            Correct Score / Total Score
          </h3>
          <p className="text-3xl font-bold text-white">
            {stat?.score ? `${stat?.score}/${stat?.total}` : "-"}
          </p>
        </div>

        {/* Card 4: Percentage Score */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg border border-blue-300 text-center transform hover:scale-105 transition-all duration-300">
          <h3 className="text-lg text-white font-semibold">Percentage Score</h3>
          <p
            className={`text-3xl font-bold ${
              Number(stat?.average_score) < 50
                ? "text-red-500"
                : "text-green-300"
            }`}
          >
            {stat?.average_score ? `${stat?.average_score}%` : "-"}
          </p>
        </div>
      </div>

      {/* Charts and Graphs */}
      <div className="grid grid-cols-4 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg border border-blue-200 w-full">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">
            Bar Chart
          </h4>
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select
              className="max-w-xs w-full"
              placeholder="Select Skill"
              color="primary"
              onChange={(e) => setSkill(e.target.value)}
            >
              {skillSelect.map((skill) => (
                <SelectItem className="text-black" key={skill.key}>
                  {skill.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="h-64 w-full rounded-lg">
            <Bar data={data} options={options} /> {/* Render Bar Chart here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
