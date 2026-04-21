import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        // Zustand persists as JSON under this key
        const raw = localStorage.getItem("gradewise-auth");
        if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("gradewise-auth");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;