import React, { useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const AddRoomClass = () => {
  const [form, setForm] = useState({
    className: "",
    basePrice: "",
    description: "",
    amenities: [],
    no_of_guests: "", // This will be a string in the form, but we'll parse it to an int on submission
    roomSize: "",
    drinks: "No",
    smoking: "No",
    bedType: "",
  });

  const [images, setImages] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity],
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((item) => item !== amenity),
    }));
  };

  const handleAddImage = () => {
    setImages((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    setImages((prev) =>
      prev.map((image) => (image.id === id ? { ...image, file } : image))
    );
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.className || !form.basePrice || !form.description || !form.no_of_guests) {
      toast.error("All required fields must be filled.");
      return;
    }

    // Parse no_of_guests to an integer
    const noOfGuestInt = parseInt(form.no_of_guests, 10);
    if (isNaN(noOfGuestInt) || noOfGuestInt < 1) {
      toast.error("Number of Guests must be a valid positive integer.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("class_name", form.className);
      formData.append("base_price", form.basePrice);
      formData.append("description", form.description);
      formData.append("amenities", JSON.stringify(form.amenities));
      formData.append("no_of_guests", noOfGuestInt); // Send as an integer
      formData.append("room_size", form.roomSize);
      formData.append("drinks", form.drinks === "Yes" ? 1 : 0);
      formData.append("smoking", form.smoking === "Yes" ? 1 : 0);
      formData.append("bed_type", form.bedType);
      formData.append("token", localStorage.getItem("token"));

      images.forEach((image) => {
        if (image.file) formData.append("images[]", image.file);
      });

      const response = await fetch(baseUrl + "addRoomClass.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        toast.success("Room class added successfully!");
        setForm({
          className: "",
          basePrice: "",
          description: "",
          amenities: [],
          no_of_guests: "",
          roomSize: "",
          drinks: "No",
          smoking: "No",
          bedType: "",
        });
        setImages([]);
      } else {
        toast.error(data.message || "Failed to add room class.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-[1130px] overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white p-8 text-center">
        <h2 className="text-4xl font-extrabold foynt-serif tracking-wide">
          Add a New Room Class
        </h2>
        <p className="mt-2 text-sm font-light opacity-90">
          Design a luxurious room class for an unforgettable guest experience.
        </p>
      </div>

      {/* Main Content */}
      <div className="p-10">
        <div className="space-y-8">
          {/* Class Name and Base Price */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Class Name</h3>
              <input
                type="text"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value })}
                placeholder="e.g., Presidential Suite"
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Base Price (per night)</h3>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                placeholder="e.g., 500"
                min={1}
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g., A luxurious suite with panoramic city views and a private balcony"
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300 resize-none h-20"
              required
            />
          </div>

          {/* Number of Guests and Room Size */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Number of Guests</h3>
              <input
                type="number"
                value={form.no_of_guests}
                onChange={(e) => setForm({ ...form, no_of_guests: e.target.value })}
                placeholder="e.g., 4"
                min={1}
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Room Size</h3>
              <input
                type="text"
                value={form.roomSize}
                onChange={(e) => setForm({ ...form, roomSize: e.target.value })}
                placeholder="e.g., 600 sq ft"
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Bed Type, Smoking, and Drinks */}
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bed Type</h3>
              <input
                type="text"
                value={form.bedType}
                onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                placeholder="e.g., King Bed"
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Smoking</h3>
              <select
                value={form.smoking}
                onChange={(e) => setForm({ ...form, smoking: e.target.value })}
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none transition-all duration-300"
              >
                <option value="Yes">Smoking Allowed</option>
                <option value="No">No Smoking</option>
              </select>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Drinks</h3>
              <select
                value={form.drinks}
                onChange={(e) => setForm({ ...form, drinks: e.target.value })}
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none transition-all duration-300"
              >
                <option value="Yes">Drinks Available</option>
                <option value="No">No Drinks</option>
              </select>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Amenities</h3>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="e.g., Spa Access, Smart TV"
                className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none placeholder-gray-400 transition-all duration-300"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Add
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {form.amenities.length > 0 && (
                <ul className="space-y-2">
                  {form.amenities.map((amenity, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                    >
                      <span className="text-gray-700">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-all duration-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Images</h3>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {images.map((image) => (
                <div key={image.id} className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(image.id, e)}
                    className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-amber-400 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium transition-all duration-300"
            >
              + Add Another Image
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={onSubmit}
              className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Create Room Class
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoomClass;