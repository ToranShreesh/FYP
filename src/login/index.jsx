import Button from "../components/Button";
import TextField from "../components/TextField";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const onLogin = async (e) => {
    try {
      e.preventDefault();

      const formData = new FormData();
      formData.append("email", loginForm.email);
      formData.append("password", loginForm.password);

      const response = await fetch(baseUrl + "auth/login.php", {
        body: formData,
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        toast.success(data.message);
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-teal-700 text-center mb-6">
          Login to your account
        </h2>
        <form onSubmit={onLogin} className="space-y-4">
          <TextField
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            required={true}
            label={"Email"}
            hint={"Enter your email"}
            type={"email"}
          />
          <TextField
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            required={true}
            label={"Password"}
            hint={"Enter your password"}
            type={"password"}
          />
          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to={"/register"} className="text-teal-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
