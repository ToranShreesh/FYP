import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const EditRoomClass = () => {
  const [roomClasses, setRoomClasses] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
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
      id: Date.now() + Math.random(), // Unique ID
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
    console.log("Submitting:", selectedRoom); 
    setUpdating(true);
  
    try {
      // Step 1: Update Room Class Details
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
  
      // Step 2: Upload Images (if any)
      if (selectedRoom.newImages.length > 0 || removedImages.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append("token", localStorage.getItem("token"));
        imageFormData.append("room_class_name", selectedRoom.class_name);
  
        // Append New Images
        selectedRoom.newImages.forEach((file) => {
          imageFormData.append("images[]", file.file);
        });
  
        // Append Removed Image IDs
        removedImages.forEach((imageId) => {
          imageFormData.append("removed_images[]", imageId);
        });
  
        const imageResponse = await fetch(`${baseUrl}editRoomCLass.php`, {
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
      toast.error("Something went wrong.");
    }
  
    setUpdating(false);
  };
  

  const handleDelete = async (roomClassName) => {
    if (!window.confirm("Are you sure you want to delete this room class?")) return;

    try {
      const response = await fetch(`${baseUrl}editRoomClass.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_class_name: roomClassName,
          delete: "1",
          token: localStorage.getItem("token"),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Room class deleted successfully!");
        fetchRoomClasses();
      } else {
        toast.error(data.message || "Failed to delete room class.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  

  return (
    <div className="flex w-[1100px] justify-center min-h-screen">
  <div className="p-6 w-full max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold mb-4 text-center">Admin - Manage Room Classes</h2>
    {loading ? (
      <p className="text-center">Loading room classes...</p>
    ) : (
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Class Name</th>
            <th className="border p-2">Base Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roomClasses.map((room) => (
            <tr key={room.id}>
              <td className="border p-2">{room.class_name}</td>
              <td className="border p-2">${room.base_price}</td>
              <td className="border p-2 flex gap-3 justify-center">
                <button
                  onClick={() => handleEditClick(room)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {selectedRoom?.class_name === room.class_name ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(room.class_name)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {selectedRoom && (
      <form onSubmit={handleUpdate} className="mt-4 space-y-4 p-4 border rounded bg-gray-100">
        <h3 className="text-xl font-bold text-center">Edit Room Class: {selectedRoom.class_name}</h3>
        {Object.keys(selectedRoom).map((key) => {
          if (key === "id" || key === "images") return null;
          return (
            <div key={key} className="flex flex-col">
              <label className="font-semibold">{key.replace("_", " ").toUpperCase()}</label>
              {key === "drinks" || key === "smoking" ? (
               <select
               value={selectedRoom[key]} // ✅ Directly use the stored value
               onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
               className="w-full p-2 border rounded"
             >
               <option value="1">Yes</option>  {/* ✅ 1 = Yes */}
               <option value="0">No</option> {/* ✅ 0 = No */}
             </select>
              ) : (
                <input
                  type="text"
                  placeholder={key}
                  value={selectedRoom[key] || ""}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, [key]: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              )}
            </div>
          );
        })}
        <div>
          <h4 className="font-semibold text-center">Existing Images</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedRoom.images?.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={`${baseUrl}${img.src.replace("./", "")}`}
                  alt="room"
                  className="w-24 h-24 object-cover border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <h4 className="font-semibold text-center mt-4">Upload Images</h4>
          <div className="flex flex-col items-center">
            {selectedRoom.newImages?.map((image) => (
              <div key={image.id} className="flex items-center gap-2 mb-2">
                <span>{image.file.name}</span>
                <button
                  type="button"
                  onClick={() => handleaddRemoveImage(image)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              + Add Image
            </button>
          </div>
        </div>
        <button type="submit" disabled={updating} className="w-full px-4 py-2 rounded text-white bg-green-500">
          {updating ? "Updating..." : "Update Room Class"}
        </button>
      </form>
    )}
  </div>
</div>

  );
};

export default EditRoomClass;
