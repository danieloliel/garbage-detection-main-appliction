import axios from "axios";
import axiosRetry from "axios-retry";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

axiosRetry(axiosInstance, { retries: 3 });

export default axiosInstance;
