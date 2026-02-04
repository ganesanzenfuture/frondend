// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /* ================= REQUEST INTERCEPTOR ================= */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* ================= RESPONSE INTERCEPTOR ================= */
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;
//     const message = error.response?.data?.message;

//     // 🔐 Redirect ONLY if token is invalid / expired
//     if (
//       status === 401 &&
//       (
//         message === "Invalid token" ||
//         message === "Token expired" ||
//         message === "Unauthorized"
//       )
//     ) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;import axios from "axios";
import axios from "axios";   // 🔥 THIS LINE WAS MISSING
const api = axios.create({
  baseURL: "https://zenfuture.in/api",                 // ✅ CORRECT
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (
      status === 401 &&
      (
        message === "Invalid token" ||
        message === "Token expired" ||
        message === "Unauthorized"
      )
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
