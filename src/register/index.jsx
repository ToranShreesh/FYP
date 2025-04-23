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

  const navigate = useNavigate();

  const onRegister = async (e) => {
    try {
      e.preventDefault();

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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-teal-700 text-center mb-6">
          Create an Account
        </h2>
        <form onSubmit={onRegister} className="space-y-4">
          <TextField
            value={registerForm.name}
            required={true}
            label={"Full Name"}
            hint={"Enter your full name"}
            type={"text"}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
          />
          <TextField
            value={registerForm.email}
            required={true}
            label={"Email"}
            hint={"Enter your email"}
            type={"email"}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
          />
          <TextField
            value={registerForm.password}
            required={true}
            label={"Password"}
            hint={"Enter your password"}
            type={"password"}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
          />
          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={"/login"}
            className="text-teal-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
