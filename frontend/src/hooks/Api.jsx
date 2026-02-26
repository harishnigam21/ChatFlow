import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setLoginStatus } from "../redux/slices/UserSlice";
//custom hook to fetch API
const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  //handles all necessary action for status codes
  const handleGlobalStatus = useCallback(
    (statusCode) => {
      switch (statusCode) {
        case 401:
        case 403:
          dispatch(setLoginStatus(false));
          navigate("/msg/login", { replace: true });
          break;
        case 404:
          navigate("/msg/not-found", { replace: true });
          break;
        case 421:
          navigate("/msg/refresh", { replace: true });
          break;
        case 400:
          navigate("/msg/bad-request", { replace: true });
          break;
        case 500:
          navigate("/msg/server-error", { replace: true });
          break;
        default:
          break;
      }
    },
    [navigate, dispatch],
  );
  //useCallback to rerender on changes when applying it on useEffect dependencies
  const sendRequest = useCallback(
    async (
      url,
      method = "GET",
      body = null,
      customHeaders = {},
      redirect = true,
    ) => {
      setLoading(true);
      setError(null);
      setStatus(null);
      const updateUrl = `${import.meta.env.VITE_BACKEND_HOST}/${url}`;
      const headers = {
        Authorization: localStorage.getItem("acTk")
          ? `Bearer ${JSON.parse(localStorage.getItem("acTk"))}` || ""
          : "",
        ...customHeaders,
      };
      if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }
      try {
        const options = {
          method,
          headers,
          credentials: "include",
          // Not sending body for GET or DELETE requests
          body:
            body instanceof FormData
              ? body
              : body
                ? JSON.stringify(body)
                : null,
        };

        const response = await fetch(updateUrl, options);
        setStatus(response.status);

        // 1. Handle critical redirects
        redirect && handleGlobalStatus(response.status);

        // 2. Parse the JSON
        const result = await response.json();

        // 3. Handle non-ok responses (400, 401, etc.)
        if (!response.ok) {
          return {
            success: false,
            data: result, // We still pass data so you can read the error message
            status: response.status,
            error: result.message || "Request failed",
          };
        }

        setData(result);
        return { success: true, data: result, status: response.status };
      } catch (err) {
        console.error("API Error Caught:", err.message);
        const internalErrorStatus = 500;
        setStatus(internalErrorStatus);
        setError(err.message || "An unexpected error occurred");
        toast.error("An unexpected error occurred !");
        // Force navigation to server-error page so the UI doesn't look "broken"
        if (redirect) {
          handleGlobalStatus(internalErrorStatus);
        }
        return {
          success: false,
          data: null,
          error: err.message,
          status: internalErrorStatus,
        };
      } finally {
        setLoading(false);
      }
    },
    [handleGlobalStatus],
  );

  return { data, loading, error, status, sendRequest };
};

export default useApi;
