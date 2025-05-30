import axiosBase from "axios";
import cookies from "js-cookie";

const axios = axiosBase.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axios.interceptors.request.use((config) => {
  const token = cookies.get("_nova_session");
  if (token) {
    config.headers["X-Nova-Session"] = `${token}`;
  }
  return config;
});

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response?.status === 401 ||
        error.response.data.message == "Invalid session") &&
      typeof window !== "undefined"
    ) {
      // Clear all localStorage
      cookies.remove("_nova_session");
      cookies.remove("_twitter_api_key");
      cookies.remove("_truthsocial_api_key");
      cookies.remove("isNew");
      localStorage.removeItem("loginStep");
      localStorage.removeItem("authToken");
      localStorage.removeItem("quick-buy-settings");

      // If you're using next/navigation
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axios;
