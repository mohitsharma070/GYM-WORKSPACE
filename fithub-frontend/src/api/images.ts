import { API_BASE_NOTIFICATION } from "../utils/config";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_NOTIFICATION}/api/images/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Failed to upload image.";
    // Always show a clear message for large files
    if (res.status === 413) {
      errorMessage = "Image is too large. Please select a smaller file.";
    } else {
      try {
        const errorBody = await res.json();
        errorMessage = errorBody.message || errorMessage;
      } catch {
        if (res.status === 500) {
          errorMessage = "Image is too large. Please select a smaller file.";
        }
      }
    }
    throw new Error(errorMessage);
  }

  const result = await res.json();
  // Assuming the backend returns an object with an imageUrl property
  if (result && result.imageUrl) {
    // Use the imageUrl as returned by the backend (should already include /uploads/)
    return `${API_BASE_NOTIFICATION}${result.imageUrl}`;
  } else {
    throw new Error("Image upload successful, but no imageUrl returned.");
  }
}