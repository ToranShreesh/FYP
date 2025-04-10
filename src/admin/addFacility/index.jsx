import React, { useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const AddFacility = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
  
    if (!form.name || !form.description) {
      toast.error("All fields are required.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("token", localStorage.getItem("token"));
  
      if (image) {
        formData.append("image", image);
      }
  
      const response = await fetch(baseUrl + "addFacility.php", {
        method: "POST",
        body: formData,
      });
  
      const textResponse = await response.text(); // Get raw response
      console.log("Raw API Response:", textResponse); // 🔍 Debugging log
  
      const data = JSON.parse(textResponse); // Try parsing JSON
      console.log("Parsed JSON:", data);
  
      if (data.success) {
        toast.success("Facility added successfully!");
        setForm({ name: "", description: "" });
        setImage(null);
      } else {
        toast.error(data.message || "Failed to add facility.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast.error("Something went wrong. Please check the console.");
    }
  };
  
  

  return ( 
    <div className="bg-white rounded-3xl shadow-2xl w-[1130px] overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-teal-400 text-white p-8 text-center">
        <h2 className="text-4xl font-extrabold font-serif tracking-wide">
          Add a Facility
        </h2>
        <p className="mt-2 text-sm font-light opacity-90">
          Enhance your hotel with a new facility for an exceptional guest experience.
        </p>
      </div>
  
      {/* Form Section */}
      <div className="p-10">
        <form className="space-y-8" onSubmit={onSubmit}>
          {/* Facility Name */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Facility Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none placeholder-gray-400 transition-all duration-300"
              placeholder="Enter facility name"
              required
            />
          </div>
  
          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none placeholder-gray-400 transition-all duration-300 resize-none h-20"
              placeholder="Enter facility description"
              required
            />
          </div>
  
          {/* Upload Image */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none transition-all duration-300"
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-indigo-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Add Facility</span>
            </button>
          </div>
        </form>
      </div>
    </div>


  );
};

export default AddFacility;
