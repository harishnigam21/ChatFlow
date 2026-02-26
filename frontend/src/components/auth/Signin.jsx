import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/Api";
import toast from "react-hot-toast";
import { setLoginStatus, setUser } from "../../redux/slices/UserSlice";
export default function Signin() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const { sendRequest, loading } = useApi();
  const validate = () => {
    //  Email: Standard RFC format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      toast.error(
        "Please enter a valid email address (e.g., name@domain.com).",
      );
      return false;
    }
    if (userData.password.trim().length < 8) {
      toast.error("Invalid Password");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //form validation
    if (!validate()) {
      return;
    }
    //sending request to the backend to verify user
    await sendRequest("api/auth/signin", "POST", userData, {}, false).then((result) => {
      const data = result?.data;
      if (result && result.success) {
        toast.success(data?.message || "Successfully Authorized");
        data.actk &&
          window.localStorage.setItem("acTk", JSON.stringify(data.actk));
        if (data.user) {
          dispatch(setUser({ data: data.data }));
          dispatch(setLoginStatus({ data: true }));
          window.localStorage.setItem("userInfo", JSON.stringify(data.user));
        }
        setTimeout(() => {
          navigate(`/chat`, { replace: true });
        }, 1000);
      } else {
        const errorMessage =
          result?.error || data?.message || "An error occurred";
        toast.error(errorMessage);
        if (result.status === 403 || result.status === 404) {
          setTimeout(() => {
            navigate(`/auth/signup`, { replace: true });
          }, 2000);
        }
      }
    });
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-border/50 rounded-xl flex flex-col p-6 gap-6 text-text bg-bgprimary/10 max-w-90"
    >
      <h3 className="text-2xl py-1">Sign In</h3>
      <input
        type="email"
        name="email"
        id="email"
        value={userData.email}
        placeholder="Email Address"
        className="p-2 rounded-md border border-border/50"
        autoComplete="email"
        required
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, email: e.target.value }))
        }
      />
      <input
        type="password"
        name="password"
        id="password"
        value={userData.password}
        placeholder="Password"
        className="p-2 rounded-md border border-border/50"
        autoComplete="new-password"
        required
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, password: e.target.value }))
        }
      />
      <div className="flex gap-4 flex-row-reverse items-center">
        <label htmlFor="agree" className="text-sm">
          Agree to the terms of use & privacy policy.
        </label>
        <input
          checked={agree}
          type="checkbox"
          name="agree"
          id="agree"
          onChange={(e) => setAgree(e.target.checked)}
        />
      </div>
      <button
        disabled={!agree}
        type="submit"
        className="p-2 rounded-md bg-linear-to-r from-primary to-secondary cursor-pointer flex justify-center items-center gap-4"
      >
        <span>SignIn Now</span>
        {loading && <span className="spinner"></span>}
      </button>
      <small className="text-txlight/75 font-light">
        Create an account{" "}
        <span
          className="text-primary font-bold cursor-pointer"
          onClick={() => navigate("/auth/signup")}
        >
          Click here
        </span>
      </small>
    </form>
  );
}
