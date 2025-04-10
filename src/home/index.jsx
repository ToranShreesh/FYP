import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Search from "../components/Search";
import HomeRooms from "../components/HomeRooms";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } 
  }, [token, navigate]);

  

  return (
    <>
      <Navbar />
      <div className="relative">
        <img
          className="w-full block"
          src="./assets/background.png"
          alt="Background"
        />
        <div className="mt-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-4xl">WELCOME TO HOTEL POKHARA</h1>
          <button className="mt-4 px-4 py-2 bg-blue-600 rounded">
            EXPLORE
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <Search />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "100px",
        }}
      >
        <HomeRooms image="/assets/room1.png" title="Classic Double Room" price="Rs 2500 per night" />
        <HomeRooms image="/assets/room2.png" title="Family Suite with Balcony View" price="Rs 3000 per night" />
        <HomeRooms image="/assets/room3.png" title="Deluxe Suite with Balcony View" price="Rs 3050 per night" />
      </div>
      <Footer />
    </>
  );
};

export default Home;
