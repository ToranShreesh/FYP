import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const AddRoom = () => {
  const [form, setForm] = useState({
    class_name: "",
    floor_number: "",
    room_number: "",
  });

  const [roomClasses, setRoomClasses] = useState([]);

  useEffect(() => {
    const fetchRoomClasses = async () => {
      try {
        const response = await fetch(baseUrl + "getAllRoomClass.php");
        const data = await response.json();
        if (data.success) {
          setRoomClasses(data.room_classes);
        } else {
          toast.error("Failed to fetch room classes");
        }
      } catch (error) {
        toast.error("Something went wrong while fetching room classes");
      }
    };

    fetchRoomClasses();
  }, []);

  const validateForm = () => {
    if (!form.class_name || !form.floor_number || !form.room_number) {
      toast.error("All fields are required.");
      return false;
    }

    if (form.floor_number < 0 || form.room_number < 0) {
      toast.error("Floor number and room number must be non-negative.");
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("class_name", form.class_name);
      formData.append("floor_number", form.floor_number);
      formData.append("room_number", form.room_number);
      formData.append("token", localStorage.getItem("token"));

      const response = await fetch(baseUrl + "addRoom.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Room added successfully!");
        setForm({
          class_name: "",
          floor_number: "",
          room_number: "",
        });
      } else {
        toast.error(data.message || "Failed to add room.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
  <div className="bg-white rounded-3xl shadow-2xl w-[1130px] overflow-hidden">
    {/* Header Section */}
    <div className="bg-gradient-to-br from-indigo-900 to-teal-400 text-white p-8 text-center">
      <h2 className="text-4xl font-extrabold font-serif tracking-wide">
        Add a New Room
      </h2>
      <p className="mt-2 text-sm font-light opacity-90">
        Assign a room to a luxurious class for an exceptional guest experience.
      </p>
    </div>

    {/* Form Section */}
    <div className="p-10">
      <form className="space-y-8" onSubmit={onSubmit}>
        {/* Room Class Name */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Room Class Name
          </label>
          <select
            value={form.class_name}
            onChange={(e) => setForm({ ...form, class_name: e.target.value })}
            className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none transition-all duration-300"
            required
          >
            <option value="" disabled>
              Select Room Class
            </option>
            {roomClasses.map((roomClass) => (
              <option
                key={roomClass.room_class_id}
                value={roomClass.class_name}
              >
                {roomClass.class_name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Number and Room Number */}
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Floor Number
            </label>
            <input
              type="number"
              value={form.floor_number}
              onChange={(e) =>
                setForm({ ...form, floor_number: e.target.value })
              }
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none placeholder-gray-400 transition-all duration-300"
              placeholder="Enter floor number"
              required
              min={0}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Room Number
            </label>
            <input
              type="number"
              value={form.room_number}
              onChange={(e) =>
                setForm({ ...form, room_number: e.target.value })
              }
              className="w-full text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:border-teal-400 outline-none placeholder-gray-400 transition-all duration-300"
              placeholder="Enter room number"
              required
              min={0}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-indigo-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Add Room</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  );
};

export default AddRoom;