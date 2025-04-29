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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const formData = new FormData();
      formData.append("token", token);

      const response = await fetch(`${baseUrl}getAllRooms.php`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Raw API Response (fetchRooms):", text);

      if (!text.trim()) throw new Error("Empty response from server");

      const data = JSON.parse(text);
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message || "Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Fetch Rooms Error:", error);
      toast.error(error.message || "Error fetching rooms");
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

      ["class_name", "floor_number", "room_number", "remarks"].forEach((field) => {
        if (selectedRoom[field] !== undefined) {
          formData.append(field, selectedRoom[field]);
        }
      });

      const response = await fetch(`${baseUrl}editRooms.php`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Raw API Response (handleUpdate):", text);

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

  const handleDelete = (roomId) => {
    // Show a toast with a confirmation prompt
    toast(
      (t) => (
        <div>
          <p>Are you sure you want to delete this room?</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss the toast
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
                  
  
                  if (!text.trim()) throw new Error("Empty response from server");
  
                  const data = JSON.parse(text);
  
                  if (data.success) {
                    toast.success("Room deleted successfully!");
                    fetchRooms();
                  } else {
                    toast.error(data.message || "Failed to delete room.");
                  }
                } catch (error) {
              
                  toast.error("Something went wrong.");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep the toast until dismissed
        position: "top-center",
      }
    );
  };
  
  const handleToggleStatus = (room) => {
    const actionText = room.is_enabled ? "disable" : "enable";
    // Show a toast with a confirmation prompt
    toast(
      (t) => (
        <div>
          <p>Are you sure you want to {actionText} this room?</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss the toast
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
                  
  
                  if (!text.trim()) throw new Error("Empty response from server");
  
                  const data = JSON.parse(text);
  
                  if (data.success) {
                    toast.success(`Room ${actionText}d successfully!`);
                    // Update UI instantly without waiting for fetchRooms()
                    setRooms((prevRooms) =>
                      prevRooms.map((r) =>
                        r.room_id === room.room_id ? { ...r, is_enabled: !r.is_enabled } : r
                      )
                    );
                  } else {
                    toast.error(data.message || `Failed to ${actionText} room.`);
                  }
                } catch (error) {
                  
                  toast.error("Something went wrong.");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Yes, {actionText.charAt(0).toUpperCase() + actionText.slice(1)}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep the toast until dismissed
        position: "top-center",
      }
    );
  };

  return (
    <div className="flex w-[1130px] min-h-screen bg-gray-50 justify-center">
      <div className="p-8 w-full max-w-5xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center tracking-tight">
          Admin - Manage Rooms
        </h2>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading rooms...</p>
        ) : (
          /* Table */
          <div className="shadow-lg rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-4 text-left font-medium">Class Name</th>
                  <th className="p-4 text-left font-medium">Floor Number</th>
                  <th className="p-4 text-left font-medium">Room Number</th>
                  <th className="p-4 text-left font-medium">Remarks</th>
                  <th className="p-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.room_id} className="border-b hover:bg-gray-100 transition-colors">
                    <td className="p-4 text-gray-700">{room.class_name}</td>
                    <td className="p-4 text-gray-700">{room.floor_number}</td>
                    <td className="p-4 text-gray-700">{room.room_number}</td>
                    <td className="p-4 text-gray-700">{room.remarks || 'No Remarks Added'}</td>
                    <td className="p-4 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditClick(room)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        {selectedRoom?.room_id === room.room_id ? "Close" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(room.room_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleToggleStatus(room)}
                        className={`px-4 py-1.5 rounded-lg text-white shadow-sm transition-all ${
                          room.is_enabled
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {room.is_enabled ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Form */}
        {selectedRoom && (
          <form
            onSubmit={handleUpdate}
            className="mt-8 p-6 bg-white shadow-lg rounded-lg space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800 text-center">
              Edit Room: {selectedRoom.room_number}
            </h3>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["class_name", "floor_number", "room_number", "remarks"].map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {key === "remarks" ? (
                    <textarea
                      value={selectedRoom[key] || ""}
                      onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                      rows="3"
                      placeholder="Enter remarks (e.g., Under maintenance)"
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedRoom[key] || ""}
                      onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updating}
              className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } transition-all`}
            >
              {updating ? "Updating..." : "Update Room"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditRoom;