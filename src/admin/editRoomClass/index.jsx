import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const EditRoomClass = () => {
  const [roomClasses, setRoomClasses] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRoomClasses();
  }, []);

  const fetchRoomClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}getAllRoomClass.php`);
      const data = await response.json();
      if (data.success) {
        setRoomClasses(data.room_classes);
      } else {
        toast.error("Failed to fetch room classes");
      }
    } catch (error) {
      toast.error("Error fetching room classes");
    }
    setLoading(false);
  };

  const handleEditClick = (room) => {
    setSelectedRoom((prev) => (prev?.class_name === room.class_name ? null : { ...room, newImages: [] }));
    setRemovedImages([]);
  };

  const handleShowDetails = (room) => {
    setShowDetails(room);
  };

  const handleCloseDetails = () => {
    setShowDetails(null);
  };

  const handleRemoveImage = (img) => {
    if (!img.id) {
      console.warn("Image ID missing:", img);
      return;
    }
  
    setRemovedImages((prev) => [...prev, img.id]);
    setSelectedRoom((prevRoom) => ({
      ...prevRoom,
      images: prevRoom.images.filter((image) => image.id !== img.id),
    }));
  };

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
    }));
  
    setSelectedRoom((prevRoom) => ({
      ...prevRoom,
      newImages: [...(prevRoom.newImages || []), ...files],
    }));
  };

  const handleaddRemoveImage = (img) => {
    setSelectedRoom((prevRoom) => ({
      ...prevRoom,
      newImages: prevRoom.newImages.filter((image) => image.id !== img.id),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRoom || updating) return;
  
    setUpdating(true);
  
    try {
      const formData = new FormData();
      formData.append("token", localStorage.getItem("token"));
      formData.append("room_class_name", selectedRoom.class_name);
  
      const fields = ["class_name", "base_price", "description", "amenities", "occupancy", "room_size", "drinks", "smoking", "bed_type"];
      fields.forEach((field) => {
        if (selectedRoom[field] !== undefined) {
          let value = selectedRoom[field];
          if (field === "drinks" || field === "smoking") {
            value = value === "1" ? "No" : "Yes";
          }
          formData.append(field, value);
        }
      });
  
      const response = await fetch(`${baseUrl}editRoomClass.php`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (!data.success) {
        toast.error(data.message || "Failed to update room class.");
        setUpdating(false);
        return;
      }
  
      toast.success("Room class updated successfully!");
  
      if (selectedRoom.newImages.length > 0 || removedImages.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append("token", localStorage.getItem("token"));
        imageFormData.append("room_class_name", selectedRoom.class_name);
  
        selectedRoom.newImages.forEach((file) => {
          imageFormData.append("images[]", file.file);
        });
  
        removedImages.forEach((imageId) => {
          imageFormData.append("removed_images[]", imageId);
        });
  
        const imageResponse = await fetch(`${baseUrl}editRoomClass.php`, {
          method: "POST",
          body: imageFormData,
        });
  
        const imageData = await imageResponse.json();
        if (!imageData.success) {
          toast.error(imageData.message || "Failed to upload images.");
        } else {
          toast.success("Images uploaded successfully!");
        }
      }
  
      fetchRoomClasses();
      setSelectedRoom(null);
    } catch (error) {
      
    }
  
    setUpdating(false);
  };

  const handleDelete = (roomClassName) => {
    // Show a toast with a confirmation prompt
    toast(
      (t) => (
        <div>
          <p>Are you sure you want to delete <strong>{roomClassName}</strong>?</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss the toast
                const token = localStorage.getItem("token");
                if (!token) {
                  toast.error("Please log in to continue");
                  return;
                }
  
                try {
                  const formData = new FormData();
                  formData.append("room_class_name", roomClassName);
                  formData.append("delete", "1");
                  formData.append("token", token);
  
                  const response = await fetch(`${baseUrl}editRoomClass.php`, {
                    method: "POST",
                    body: formData,
                  });
  
                  const data = await response.json();
                  if (data.success) {
                    toast.success("Room class deleted successfully!");
                    fetchRoomClasses();
                  } else {
                    toast.error(data.message || "Failed to delete room class.");
                  }
                } catch (error) {
                  toast.error("Error deleting room class.");
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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex w-[1130px] min-h-screen bg-gray-50 justify-center relative">
      <div className={`p-8 w-full max-w-5xl mx-auto ${showDetails ? "blur-sm" : ""}`}>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center tracking-tight">
          Admin - Manage Room Classes
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading room classes...</p>
        ) : (
          <div className="shadow-lg rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-4 text-left font-medium">Class Name</th>
                  <th className="p-4 text-left font-medium">Base Price</th>
                  <th className="p-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomClasses.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-gray-100 transition-colors">
                    <td 
                      className="p-4 text-gray-700 cursor-pointer hover:underline" 
                      onClick={() => handleShowDetails(room)}
                    >
                      {room.class_name}
                    </td>
                    <td className="p-4 text-gray-700">Rs{room.base_price}</td>
                    <td className="p-4 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditClick(room)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        {selectedRoom?.class_name === room.class_name ? "Close" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(room.class_name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRoom && (
          <form
            onSubmit={handleUpdate}
            className="mt-8 p-6 bg-white shadow-lg rounded-lg space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800 text-center">
              Edit Room Class: {selectedRoom.class_name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(selectedRoom).map((key) => {
              if (key === "id" || key === "images" || key === "room_class_id") return null;
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {key === "drinks" || key === "smoking" ? (
                    <select
                      value={selectedRoom[key]}
                      onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={key}
                      value={selectedRoom[key] || ""}
                      onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  )}
                </div>
              );
            })}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-700 text-center">Existing Images</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {selectedRoom.images?.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`${baseUrl}${img.src.replace("./", "")}`}
                      alt="room"
                      className="w-28 h-28 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-medium text-gray-700 text-center mt-6">Upload New Images</h4>
              <div className="flex flex-col items-center gap-3">
                {selectedRoom.newImages?.map((image) => (
                  <div key={image.id} className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{image.file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleaddRemoveImage(image)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAddNewImages}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-sm transition-all"
                >
                  + Add Image
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              } transition-all`}
            >
              {updating ? "Updating..." : "Update Room Class"}
            </button>
          </form>
        )}
      </div>

      {showDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              {showDetails.class_name} Details
            </h3>
            <div className="space-y-3">
              <p><strong>Base Price:</strong> ${showDetails.base_price}</p>
              <p><strong>Description:</strong> {showDetails.description || "N/A"}</p>
              <p><strong>No. of Guests:</strong> {showDetails.no_of_guests || "N/A"}</p>
              <p><strong>Room Size:</strong> {showDetails.room_size || "N/A"}</p>
              <p><strong>Bed Type:</strong> {showDetails.bed_type || "N/A"}</p>
              <p><strong>Smoking:</strong> {showDetails.smoking === "1" ? "No" : "Yes"}</p>
              <p><strong>Drinks:</strong> {showDetails.drinks === "1" ? "No" : "Yes"}</p>
            </div>
            <button
              onClick={handleCloseDetails}
              className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRoomClass;