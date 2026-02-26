import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/Api";
export default function Signup() {
  const { sendRequest, loading } = useApi();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [agree, setAgree] = useState(false);
  const validate = () => {
    //  Names: Only alphabets allowed
    const nameRegex = /^[a-zA-Z][a-zA-Z\s\-']{1,50}$/;
    if (!userData.name.trim() || !nameRegex.test(userData.name)) {
      toast.error("Name is required and should contain only letters.");
      return false;
    }

    //  Email: Standard RFC format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      toast.error(
        "Please enter a valid email address (e.g., name@domain.com).",
      );
      return false;
    }
    // Password Specific Validation
    if (userData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(userData.password)) {
      toast.error("Password must contain at least one uppercase letter (A-Z).");
      return false;
    }
    if (!/[a-z]/.test(userData.password)) {
      toast.error("Password must contain at least one lowercase letter (a-z).");
      return false;
    }
    if (!/[0-9]/.test(userData.password)) {
      toast.error("Password must contain at least one number (0-9).");
      return false;
    }
    if (!/[@$!%*?&]/.test(userData.password)) {
      toast.error(
        "Password must contain at least one special character (e.g., @, $, !, %, *, ?, &).",
      );
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    await sendRequest("api/auth/signup", "POST", userData, {}, false).then(
      (result) => {
        const data = result?.data;
        if (result && result.success) {
          toast.success(data?.message || "Successfully Registered");
          setUserData({
            name: "",
            email: "",
            password: "",
          });
          setTimeout(() => {
            navigate("/auth/signin", { replace: true });
          }, 2000);
        } else {
          const errorMessage =
            result?.error || data?.message || "An error occurred";
          toast.error(errorMessage);
          if (result.status === 409) {
            setTimeout(() => {
              navigate(`/auth/signin`, { replace: true });
            }, 2000);
          }
        }
      },
    );
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-border/50 rounded-xl flex flex-col p-6 gap-6 text-text bg-bgprimary/10 max-w-90"
    >
      <h3 className="text-2xl py-1">Sign Up</h3>
      <input
        type="text"
        name="fname"
        id="fname"
        value={userData.name}
        placeholder="Full Name"
        className="p-2 rounded-md border border-border/50"
        autoComplete="fname"
        required
        onChange={(e) =>
          setUserData((prev) => ({ ...prev, name: e.target.value }))
        }
      />
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
        className="p-2 rounded-md bg-linear-to-r from-primary to-secondary cursor-pointer"
      >
        Create Account
      </button>
      <small className="text-txlight/75 font-light">
        Already have an account{" "}
        <span
          className="text-primary font-bold cursor-pointer"
          onClick={() => navigate("/auth/signin")}
        >
          Click here
        </span>
      </small>
    </form>
  );
}
