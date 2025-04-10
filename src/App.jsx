import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./login";
import RegisterPage from "./register";
import { Toaster } from "react-hot-toast";
import "./global.css";
import { CartContext } from "./context/cartContext";
import AdminDashboard from "./admin/dashboard";


function App() {
  const token = localStorage.getItem("token");

  const router = createBrowserRouter([
    {
      path: "/",
      element: token ? <Login/>:  <Login />,
    },
   
    
    
    
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/admin",
      element: <AdminDashboard />,
    },
   
   
    {
      path: "*",
      element: <div>Page Not Found</div>,
    },
  ]);

  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
