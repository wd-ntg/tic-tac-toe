import axios, { AxiosInstance } from 'axios';

// Tạo một instance của Axios với cấu hình cơ bản
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://localhost:9000', // URL gốc cho tất cả các yêu cầu
  timeout: 10000, // Giới hạn thời gian chờ cho mỗi yêu cầu là 10 giây
  headers: {
    'Content-Type': 'application/json', // Đặt kiểu dữ liệu mặc định cho các yêu cầu là JSON
  }
});

// Không cần thêm interceptors để xử lý token

export default axiosInstance;
