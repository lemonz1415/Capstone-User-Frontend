import axios from "axios";

const HOST_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUserQuery = async (userData: {
  firstname: string;
  lastname: string;
  email: string;
  dob: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${HOST_URL}/api/auth/register`, userData);
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
      localStorage.setItem("accessToken", response.data.accessToken);
  
      return response.data.accessToken; // คืนค่า Access Token ใหม่
    } catch (error: any) {
        console.error("Error refreshing access token:", error);
    
        if (error.response?.status === 403 || error.response?.status === 400) {
          console.log("Refresh token expired. Showing session expired modal...");
        }
    
        throw error;
      }
    };


