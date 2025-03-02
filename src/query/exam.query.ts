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
            Authorization: `${accessToken}`, // เพิ่ม Access Token ใน Header
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
              Authorization: `${accessToken}`,
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

// export const getAllExamLogIDQuery = async () => {
//   try {
//     const response = await axios.get(`${HOST_URL}/api/exam/examID`);
//     return response?.data?.exams || [];
//   } catch (error) {
//     console.error("Error fetching exams:", error);
//     return [];
//   }
// };

export const getAllExamLogIDQuery = async () => {
    try {
      const response = await fetchWithAuth("/api/exam/examID", "GET");
      return response?.exams || []; 
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  };

// export const generateRandomExamQuery = async (user_id: number) => {
//   try {
//     const response = await axios.post(`${HOST_URL}/api/exam/random`, {
//       user_id,
//     });
//     return response?.data; // คืนค่า exam_id
//   } catch (error) {
//     console.error("Error generating random exam:", error);
//     throw error;
//   }
// };

  export const generateRandomExamQuery = async (user_id: number) => {
    return await fetchWithAuth("/api/exam/random", "POST", { user_id });
  };

// export const getQuestionDetailQuery = async (
//   exam_id: number,
//   index: number
// ) => {
//   try {
//     const response = await axios.post(`${HOST_URL}/api/exam/question`, {
//       exam_id,
//       index,
//     });
//     return response?.data?.question; // คืนค่าข้อมูลคำถาม
//   } catch (error) {
//     console.error("Error fetching question detail:", error);
//     throw error;
//   }
// };
  
export const getQuestionDetailQuery = async (exam_id: number, index: number) => {
    return await fetchWithAuth("/api/exam/question", "POST", { exam_id, index });
  };
  
// export const updateSelectedOptionQuery = async (
//   exam_id: number,
//   question_id: number,
//   option_id: number
// ) => {
//   try {
//     const response = await axios.put(`${HOST_URL}/api/exam/select`, {
//       exam_id,
//       question_id,
//       option_id,
//     });
//     return response?.data;
//   } catch (error) {
//     console.error("Error updating selected option:", error);
//     throw error;
//   }
// };

export const updateSelectedOptionQuery = async (
    exam_id: number,
    question_id: number,
    option_id: number
  ) => {
    return await fetchWithAuth("/api/exam/select", "PUT", { exam_id, question_id, option_id });
  };
  

// export const getCountQuestionByExamIDQuery = async (exam_id: number) => {
//   try {
//     const response = await axios.post(`${HOST_URL}/api/exam/question/count`, {
//       exam_id,
//     });
//     return response?.data?.question_count || 0; // คืนค่าจำนวนคำถาม
//   } catch (error) {
//     console.error("Error fetching question count:", error);
//     throw error;
//   }
// };

export const getCountQuestionByExamIDQuery = async (exam_id: number) => {
    try {
      const response = await fetchWithAuth(`/api/exam/${exam_id}/count`, "GET");
      return response?.question_count || 0; 
    } catch (error) {
      console.error("Error fetching question count:", error);
      throw error;
    }
  };
// export const getExamScoreQuery = async (exam_id: number) => {
//   try {
//     const response = await axios.put(`${HOST_URL}/api/exam/submit`, {
//       exam_id,
//     });
//     return response?.data; // คืนค่าข้อมูลคะแนน
//   } catch (error) {
//     console.error("Error fetching exam score:", error);
//     throw error;
//   }
// };
  
export const getExamScoreQuery = async (exam_id: number) => {
    return await fetchWithAuth(`/api/exam/${exam_id}/submit`, "PUT");
  };

// export const getExamTestedDetailQuery = async (body: { exam_id: number }) => {
//   try {
//     const response = await axios.post(`${HOST_URL}/api/exam/history`, body);
//     return response?.data || [];
//   } catch (error) {
//     console.error("Error fetching exam detail:", error);
//     throw error;
//   }
// };

export const getExamTestedDetailQuery = async (exam_id: number) => {
    return await fetchWithAuth(`/api/exam/${exam_id}/detail`, "GET");
  };

