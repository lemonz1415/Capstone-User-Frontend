import axios from "axios";
import { refreshAccessToken } from "@/query/auth.query";

const HOST_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchWithAuth = async (url: string, method: string, data?: any) => {
    try {
      let accessToken = localStorage.getItem("accessToken");
  
      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }
  
      try {
        // ส่งคำขอด้วย Access Token ปัจจุบัน
        const response = await axios({
          url: `${HOST_URL}${url}`,
          method,
          headers: {
            Authorization: accessToken, // เพิ่ม Access Token ใน Header
            "Content-Type": "application/json",
          },
          data,
        });
  
        return response.data;
      } catch (error: any) {
        // หาก Access Token หมดอายุ ให้ลอง Refresh Access Token
        if (error.response?.status === 401) { 
  
          accessToken = await refreshAccessToken(); // ขอ Access Token ใหม่
  
          // ส่งคำขออีกครั้งด้วย Access Token ใหม่
          const retryResponse = await axios({
            url: `${HOST_URL}${url}`,
            method,
            headers: {
              Authorization: accessToken,
              "Content-Type": "application/json",
            },
            data,
          });
  
          return retryResponse.data;
        }
  
        throw error; // หากเป็น Error อื่น ให้โยนกลับไป
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      throw error;
    }
  };

export const getAllExamLogIDQuery = async (user_id: number) => {
    try {
      const response = await fetchWithAuth(`/api/exam/${user_id}/all`, "GET");
      return response?.exams || []; 
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  };

export const generateRandomExamQuery = async (user_id: number) => {
    return await fetchWithAuth("/api/exam/random", "POST", { user_id });
  };

export const generateCustomExamQuery = async (user_id: number, skills: any[]) => {
    try {
      
      // กรองเฉพาะฟิลด์ skill_id และ question_count
    const formattedSkills = skills
    .filter((skill) => skill.question_count > 0) // ส่งเฉพาะ Skill ที่มีจำนวนคำถาม > 0
    .map((skill) => ({
      skill_id: skill.skill_id,
      question_count: skill.question_count,
    }));

      const response = await fetchWithAuth("/api/exam/custom", "POST", {
        user_id, 
        skills: formattedSkills,
      });
      return response?.exam_id || null; 
    } catch (error) {
      console.error("Error generating custom exam:", error);
      throw error;
    }
  };

export const updateSelectedOptionQuery = async (
    exam_id: number,
    question_id: number,
    option_id: number
  ) => {
    return await fetchWithAuth("/api/exam/select", "PUT", { exam_id, question_id, option_id });
  };

export const getCountQuestionByExamIDQuery = async (exam_id: number) => {
    try {
      const response = await fetchWithAuth(`/api/exam/${exam_id}/count`, "GET");
      return response?.question_count || 0; 
    } catch (error) {
      console.error("Error fetching question count:", error);
      throw error;
    }
  };

export const getExamScoreQuery = async (exam_id: number) => {
    return await fetchWithAuth(`/api/exam/${exam_id}/submit`, "PUT");
  };

export const getExamTestedDetailQuery = async (exam_id: number) => {
    return await fetchWithAuth(`/api/exam/${exam_id}/detail`, "GET");
  };

export const getAllSkillsQuery = async () => {
    try {
      const response = await fetchWithAuth("/api/dashboard/skill", "GET");
      return response?.skill || [];
    } catch (error) {
      console.error("Error fetching skills:", error);
      throw error;
    }
  };