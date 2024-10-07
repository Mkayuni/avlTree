import axios from 'axios';

// Create an axios instance with default settings
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Backend base URL
  timeout: 10000,                    // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
