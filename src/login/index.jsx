import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
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
       
        toast.success(data.message);
        navigate("/home");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('./assets/background.jpg')",
        backgroundBlendMode: "overlay"
      }}
    >
      <div className="w-full max-w-md p-8 m-4 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-indigo-800 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-3 text-lg font-light">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-6">
          <TextField
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            required={true}
            label={"Email"}
            hint={"Enter your email"}
            type={"email"}
            className="focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-300"
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
            className="focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-300"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.03] shadow-md hover:shadow-lg font-semibold text-lg"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link 
              to={"/register"} 
              className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;