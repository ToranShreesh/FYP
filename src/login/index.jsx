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
  className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 bg-cover bg-center bg-no-repeat"
  style={{ 
    backgroundImage: "url('./assets/background.jpg')",
    backgroundBlendMode: "overlay"
  }}
>
  <div className="w-full max-w-md p-8 m-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-teal-700 text-center">
        Welcome Back
      </h2>
      <p className="text-center text-gray-500 mt-2">
        Please login to your account
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
        className="focus-within:ring-2 focus-within:ring-teal-500"
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
        className="focus-within:ring-2 focus-within:ring-teal-500"
      />

      <button
        type="submit"
        className="w-full bg-teal-700 text-white py-3.5 rounded-xl hover:bg-teal-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg font-medium text-lg"
      >
        Login
      </button>
    </form>

    <div className="mt-8 text-center">
      <p className="text-gray-600">
        Don't have an account?{" "}
        <Link 
          to={"/register"} 
          className="text-teal-700 font-semibold hover:text-teal-800 hover:underline transition-colors"
        >
          Register Now
        </Link>
      </p>
    </div>
  </div>
</div>
  );
};

export default LoginPage;
