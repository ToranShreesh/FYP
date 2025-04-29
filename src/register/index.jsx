import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import { useState } from "react";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (registerForm.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onRegister = async (e) => {
    try {
      e.preventDefault();
      if (!validateForm()) return;
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", registerForm.name);
      formData.append("email", registerForm.email);
      formData.append("password", registerForm.password);

      const response = await fetch(baseUrl + "auth/register.php", {
        body: formData,
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", registerForm.name);
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/assets/background.jpg')",
        backgroundBlendMode: "overlay"
      }}
    >
      <div className="w-full max-w-md p-8 m-4 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-indigo-800 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Create Account
          </h2>
          <p className="text-gray-500 mt-3 text-lg font-light">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={onRegister} className="space-y-6" aria-label="Registration form">
          <TextField
            id="name"
            value={registerForm.name}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
            required={true}
            label={"Full Name"}
            hint={"Enter your full name"}
            type={"text"}
            className="focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-300"
          />
          <TextField
            id="email"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
            required={true}
            label={"Email"}
            hint={"Enter your email"}
            type={"email"}
            className="focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-300"
          />
          <TextField
            id="password"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
            required={true}
            label={"Password"}
            hint={"Enter your password"}
            type={"password"}
            className="focus-within:ring-2 focus-within:ring-indigo-400 transition-all duration-300"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.03] shadow-md hover:shadow-lg font-semibold text-lg ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link 
              to={"/login"} 
              className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;