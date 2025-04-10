import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const EditRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}getAllRooms.php`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error("Failed to fetch rooms");
      }
    } catch (error) {
      toast.error("Error fetching rooms");
    }
    setLoading(false);
  };

  const handleEditClick = (room) => {
    if (selectedRoom?.room_id === room.room_id) {
      setSelectedRoom(null); // Close form if same room is clicked
    } else {
      setSelectedRoom(room); // Open form for selected room
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRoom || updating) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in.");
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("room_id", selectedRoom.room_id);
      formData.append("action", "edit");

      ["class_name", "floor_number", "room_number"].forEach((field) => {
        if (selectedRoom[field] !== undefined) {
          formData.append(field, selectedRoom[field]);
        }
      });

      const response = await fetch(`${baseUrl}editRooms.php`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Raw API Response:", text);

      if (!text.trim()) throw new Error("Empty response from server");

      const data = JSON.parse(text);

      if (data.success) {
        toast.success("Room updated successfully!");
        fetchRooms();
        setSelectedRoom(null);
      } else {
        toast.error(data.message || "Failed to update room.");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Something went wrong.");
    }
    setUpdating(false);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("room_id", roomId);
      formData.append("action", "delete");
      formData.append("token", token);

      const response = await fetch(`${baseUrl}editRooms.php`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (data.success) {
        toast.success("Room deleted successfully!");
        fetchRooms();
      } else {
        toast.error(data.message || "Failed to delete room.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong.");
    }
  };

  const handleToggleStatus = async (room) => {
    if (!window.confirm(`Are you sure you want to ${room.is_enabled ? "disable" : "enable"} this room?`)) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token is missing. Please log in.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("room_id", room.room_id);
      formData.append("action", room.is_enabled ? "disable" : "enable");
      formData.append("token", token); 
  
      const response = await fetch(`${baseUrl}editRooms.php`, {
        method: "POST",
        body: formData,
      });
  
      const text = await response.text();
      console.log("Raw API Response:", text);
  
      if (!text.trim()) throw new Error("Empty response from server");
  
      const data = JSON.parse(text);
  
      if (data.success) {
        toast.success(`Room ${room.is_enabled ? "disabled" : "enabled"} successfully!`);
  
        // Update UI instantly without waiting for fetchRooms()
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.room_id === room.room_id ? { ...r, is_enabled: !r.is_enabled } : r
          )
        );
      } else {
        toast.error(data.message || "Failed to update room status.");
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      toast.error("Something went wrong.");
    }
  };
  

  return (
    <div className="flex w-[1100px] justify-center min-h-screen">
  <div className="p-6 w-full max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold mb-4 text-center">Admin - Manage Rooms</h2>
    {loading ? (
      <p className="text-center">Loading rooms...</p>
    ) : (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Class Name</th>
            <th className="border p-2">Floor Number</th>
            <th className="border p-2">Room Number</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.room_id}>
              <td className="border p-2">{room.class_name}</td>
              <td className="border p-2">{room.floor_number}</td>
              <td className="border p-2">{room.room_number}</td>
              <td className="border p-2 flex gap-3 justify-center">
                <button
                  onClick={() => handleEditClick(room)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {selectedRoom?.room_id === room.room_id ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(room.room_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleToggleStatus(room)}
                  className={`px-3 py-1 rounded text-white ${room.is_enabled ? "bg-red-500" : "bg-green-500"}`}
                >
                  {room.is_enabled ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {selectedRoom && (
      <form onSubmit={handleUpdate} className="mt-4 space-y-4 p-4 border rounded bg-gray-100">
        <h3 className="text-xl font-bold text-center">Edit Room: {selectedRoom.room_number}</h3>
        {["class_name", "floor_number", "room_number"].map((key) => (
          <div key={key} className="flex flex-col">
            <label className="font-semibold">{key.replace("_", " ").toUpperCase()}</label>
            <input
              type="text"
              value={selectedRoom[key] || ""}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button type="submit" disabled={updating} className="w-full px-4 py-2 rounded text-white bg-green-500">
          {updating ? "Updating..." : "Update Room"}
        </button>
      </form>
    )}
  </div>
</div>

  );
};

export default EditRoom;
