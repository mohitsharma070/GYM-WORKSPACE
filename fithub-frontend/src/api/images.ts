import { API_BASE_USER } from "../utils/config";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_USER}/api/images/upload`, {
    method: "POST",
    headers: {
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "Failed to upload image.");
  }

  const result = await res.json();
  // Assuming the backend returns an object with an imageUrl property
  if (result && result.imageUrl) {
    return result.imageUrl;
  } else {
    throw new Error("Image upload successful, but no imageUrl returned.");
  }
}