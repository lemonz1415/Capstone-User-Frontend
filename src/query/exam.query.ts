import axios from "axios";

const HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllExamLogIDQuery = async () => {
  try {
    const response = await axios.get(`${HOST_URL}/api/exam/examID`);
    return response?.data?.exams || [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
};

export const generateRandomExamQuery = async (user_id: number) => {
  try {
    const response = await axios.post(`${HOST_URL}/api/exam/random`, {
      user_id,
    });
    return response?.data; // คืนค่า exam_id
  } catch (error) {
    console.error("Error generating random exam:", error);
    throw error;
  }
};

export const getQuestionDetailQuery = async (
  exam_id: number,
  index: number
) => {
  try {
    const response = await axios.post(`${HOST_URL}/api/exam/question`, {
      exam_id,
      index,
    });
    return response?.data?.question; // คืนค่าข้อมูลคำถาม
  } catch (error) {
    console.error("Error fetching question detail:", error);
    throw error;
  }
};

export const updateSelectedOptionQuery = async (
  exam_id: number,
  question_id: number,
  option_id: number
) => {
  try {
    const response = await axios.put(`${HOST_URL}/api/exam/select`, {
      exam_id,
      question_id,
      option_id,
    });
    return response?.data;
  } catch (error) {
    console.error("Error updating selected option:", error);
    throw error;
  }
};

export const getCountQuestionByExamIDQuery = async (exam_id: number) => {
  try {
    const response = await axios.get(`${HOST_URL}/api/exam/question/count`, {
      params: { exam_id }, // ส่ง exam_id ผ่าน Query Parameters
    });
    return response?.data?.question_count || 0; // คืนค่าจำนวนคำถาม
  } catch (error) {
    console.error("Error fetching question count:", error);
    throw error;
  }
};

export const getExamTestedDetailQuery = async (body: { exam_id: number }) => {
  try {
    const response = await axios.post(`${HOST_URL}/api/exam/history`, body);
    return response?.data?.exam_detail || [];
  } catch (error) {
    console.error("Error fetching exam detail:", error);
    throw error;
  }
};
