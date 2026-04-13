import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// attach token to every request automatically
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;