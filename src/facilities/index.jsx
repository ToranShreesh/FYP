import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FacilityCard from "../components/FacilityCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { baseUrl } from "../constants";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const Facilities = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${baseUrl}getFacility.php`);
        const data = await response.json();

        if (data.success) {
          setFacilities(data.facilities);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Back Button */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[600px] bg-cover bg-center bg-fixed">
        <img
          src="/assets/facility.png"
          alt="Facilities Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-serif font-bold uppercase tracking-tight drop-shadow-md">
              Our Facilities
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-light max-w-3xl mx-auto drop-shadow-md">
              Discover the exceptional amenities that make Hotel Pokhara a haven of luxury and comfort.
            </p>
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 text-center mb-6">
            Explore Our Amenities
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-12"></div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : facilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility.facility_id}
                  facility_id={facility.facility_id}
                  facility_name={facility.facility_name}
                  facility_image_url={facility.facility_image_url}
                  description={facility.description}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-xl font-medium">
              No facilities available at this time.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Facilities;