import { useEffect, useState } from "react";
import FacilityCard from "../components/FacilityCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { baseUrl } from "../constants";

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${baseUrl}getFacility.php`);
        const data = await response.json();

        if (data.success) {
          setFacilities(data.facilities); // Set facilities without ratings initially
        } else {
          console.error("Failed to fetch facilities:", data.message);
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-gray-100">
        {/* Hero Section */}
        <div className="relative h-[490px]">
          <img
            src="./assets/facility.png"
            alt="Facilities Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold uppercase">Facilities</h1>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="container mx-auto py-12">
          {loading ? (
            <p className="text-center text-gray-700 text-xl">Loading facilities...</p>
          ) : facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((facility) => (
                <FacilityCard key={facility.facility_id} facility_id={facility.facility_id} facility_name={facility.facility_name} facility_image_url={facility.facility_image_url} description={facility.description} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-xl">No facilities available.</p>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Facilities;
