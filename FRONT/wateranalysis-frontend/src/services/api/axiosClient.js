import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api-orehm.univ-fianarantsoa.mg/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
