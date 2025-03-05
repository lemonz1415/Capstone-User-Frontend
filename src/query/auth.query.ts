import axios from "axios";
import { useAuth } from "@/contexts/auth.context";
import { useModal } from "@/contexts/modal.context";

const HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUserQuery = async (userData: {
  firstname: string;
  lastname: string;
  email: string;
  dob: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      `${HOST_URL}/api/auth/register`,
      userData
    );
    return response?.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const loginUserQuery = async (userData: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${HOST_URL}/api/auth/login`, userData);
    return response?.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  const { login, logout } = useAuth(); // ใช้ฟังก์ชัน logout จาก Auth Context
  const { openModal } = useModal();
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token found. Please log in again.");
    }

    const response = await axios.post(
      `${HOST_URL}/api/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `${refreshToken}`, // ส่ง Refresh Token ใน Header
          "Content-Type": "application/json",
        },
      }
    );

    // เก็บ Access Token ใหม่ใน localStorage
    login(response.data.accessToken, refreshToken);
    return response.data.accessToken; // คืนค่า Access Token ใหม่
  } catch (error: any) {
    console.error("Error refreshing access token:", error);

    if (error.response?.status === 401 || error.response?.status === 400) {
      // แสดง Modal แจ้งเตือน Session หมดอายุ
      openModal(
        "Session Expired",
        "Your session has expired. Please log in again.",
        "Go to Login",
        undefined,
        () => {
          logout();
          window.location.href = "/auth/login"; // Redirect ไปยังหน้า Login
        },
        true // ส่งค่า isExpired เป็น true เพื่อกำหนดรูปแบบการแสดงผลของ Modal
      );
    }

    throw error;
  }
};

export const verifyEmailOtpQuery = async (email: string, code: string) => {
  try {
    const response = await axios.put(`${HOST_URL}/api/auth/verify`, {
      email,
      code,
    });
    return response?.data;
  } catch (error) {
    console.error("Error during email verification:", error);
    throw error;
  }
};

//   export const resendOtpQuery = async (email: string) => {
//     try {
//       // เนื่องจาก backend ไม่มี API สำหรับ resend OTP โดยตรง
//       // เราจะใช้ register API อีกครั้งโดยส่งเฉพาะ email
//       const response = await axios.post(`${HOST_URL}/api/auth/register`, { email, resend: true });
//       return response?.data;
//     } catch (error) {
//       console.error("Error resending OTP:", error);
//       throw error;
//     }
//   };

export const fetchUserInfoQuery = async (user_id: any) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    const response = await axios.post(
      `${HOST_URL}/api/auth/me`,
      { user_id: user_id }, // request body
      {
        // config object
        headers: {
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data?.user?.[0] || null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};
