import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to continue");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("token", token);

      const response = await fetch(`${baseUrl}facility.php`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Fetch facilities raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("JSON Parse Error:", error);
        toast.error("Invalid server response");
        setLoading(false);
        return;
      }

      console.log("Fetch facilities parsed response:", data);

      if (data.success) {
        setFacilities(data.facilities);
      } else {
        toast.error(data.message || "Failed to fetch facilities");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching facilities");
    }
    setLoading(false);
  };

  const handleEditClick = (facility) => {
    setSelectedFacility((prev) =>
      prev?.facility_id === facility.facility_id ? null : { ...facility, newImage: null }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFacility((prev) => ({ ...prev, newImage: file }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFacility || updating) return;
    setUpdating(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to continue");
      setUpdating(false);
      return;
    }

    if (!selectedFacility.facility_name.trim()) {
      toast.error("Facility name is required");
      setUpdating(false);
      return;
    }

    if (!selectedFacility.newImage && !selectedFacility.facility_image_url) {
      toast.error("Image URL or file is required");
      setUpdating(false);
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("action", "edit");
    formData.append("facility_id", selectedFacility.facility_id);
    formData.append("facility_name", selectedFacility.facility_name);
    formData.append("description", selectedFacility.description);
    if (selectedFacility.newImage) {
      formData.append("facility_image", selectedFacility.newImage);
    } else {
      formData.append("facility_image_url", selectedFacility.facility_image_url);
    }

    console.log("Edit FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    try {
      const response = await fetch(`${baseUrl}facility.php`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("HTTP Error:", response.status, response.statusText);
        toast.error("Server error: " + response.statusText);
        setUpdating(false);
        return;
      }

      const text = await response.text();
      console.log("Edit raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("JSON Parse Error:", error);
        toast.error("Invalid server response");
        setUpdating(false);
        return;
      }

      console.log("Edit parsed response:", data);

      if (data.success) {
        await fetchFacilities();
        toast.success("Facility updated successfully!");
        setSelectedFacility(null);
      } else {
        toast.error(data.message || "Failed to update facility");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Something went wrong");
    }
    setUpdating(false);
  };

  const handleDelete = (facilityId, facilityName) => {
    toast(
      (t) => (
        <div>
          <p>Are you sure you want to delete <strong>{facilityName}</strong>?</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const token = localStorage.getItem("token");
                if (!token) {
                  toast.error("Please log in to continue");
                  return;
                }

                const formData = new FormData();
                formData.append("token", token);
                formData.append("action", "delete");
                formData.append("facility_id", facilityId);

                console.log("Delete FormData contents:");
                for (let [key, value] of formData.entries()) {
                  console.log(`${key}:`, value);
                }

                try {
                  const response = await fetch(`${baseUrl}facility.php`, {
                    method: "POST",
                    body: formData,
                  });

                  if (!response.ok) {
                    console.error("HTTP Error:", response.status, response.statusText);
                    toast.error("Server error: " + response.statusText);
                    return;
                  }

                  const text = await response.text();
                  console.log("Delete raw response:", text);

                  let data;
                  try {
                    data = JSON.parse(text);
                  } catch (error) {
                    console.error("JSON Parse Error:", error);
                    toast.error("Invalid server response");
                    return;
                  }

                  console.log("Delete parsed response:", data);

                  if (data.success) {
                    toast.success("Facility deleted successfully!");
                    await fetchFacilities();
                  } else {
                    toast.error(data.message || "Failed to delete facility");
                  }
                } catch (error) {
                  console.error("Delete error:", error);
                  toast.error("Something went wrong");
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
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  return (
    <div className="flex w-[1130px] min-h-screen bg-gray-50 justify-center">
      <div className="p-8 w-full max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center tracking-tight">
          Admin - Manage Facilities
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading facilities...</p>
        ) : (
          <div className="shadow-lg rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Description</th>
                  <th className="p-4 text-left font-medium">Image</th>
                  <th className="p-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr
                    key={facility.facility_id}
                    className="border-b hover:bg-gray-100 transition-colors"
                  >
                    <td className="p-4 text-gray-700">{facility.facility_name}</td>
                    <td className="p-4 text-gray-700">{facility.description}</td>
                    <td className="p-4 text-gray-700">
                      <img
                        src={`${baseUrl}${facility.facility_image_url.replace("./", "")}`}
                        alt={facility.facility_name}
                        className="w-28 h-28 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/112?text=Image+Not+Found";
                          console.error(`Failed to load image: ${facility.facility_image_url}`);
                        }}
                      />
                    </td>
                    <td className="p-4 flex gap-3 justify-center">
                      <button
                        onClick={() => handleEditClick(facility)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        {selectedFacility?.facility_id === facility.facility_id
                          ? "Close"
                          : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(facility.facility_id, facility.facility_name)}
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

        {selectedFacility && (
          <form
            onSubmit={handleUpdate}
            className="mt-8 p-6 bg-white shadow-lg rounded-lg space-y-6"
          >
            <h3 className="text-2xl font-semibold text-gray-800 text-center">
              Edit Facility: {selectedFacility.facility_name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  NAME
                </label>
                <input
                  type="text"
                  value={selectedFacility.facility_name || ""}
                  onChange={(e) =>
                    setSelectedFacility({
                      ...selectedFacility,
                      facility_name: e.target.value,
                    })
                  }
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  value={selectedFacility.description || ""}
                  onChange={(e) =>
                    setSelectedFacility({
                      ...selectedFacility,
                      description: e.target.value,
                    })
                  }
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  IMAGE
                </label>
                <div className="flex items-center gap-3">
                  {selectedFacility.newImage ? (
                    <span className="text-gray-600">{selectedFacility.newImage.name}</span>
                  ) : (
                    <img
                      src={`${baseUrl}${selectedFacility.facility_image_url.replace("./", "")}`}
                      alt="Current Facility"
                      className="w-28 h-28 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/112?text=Image+Not+Found";
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    Change Image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
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
              {updating ? "Updating..." : "Update Facility"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageFacilities;