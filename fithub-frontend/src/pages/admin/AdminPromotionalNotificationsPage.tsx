import React, { useState } from "react";
import { sendPromotionalNotification } from "../../api/notifications"; // Updated import
import { uploadImage } from "../../api/images"; // Import uploadImage
import { Link } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal"; // Import ConfirmationModal
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Ensure useMutation is imported for image upload
import { useToast } from "../../components/ToastProvider"; // Import useToast
import { TargetType } from "../../types/TargetType"; // Import TargetType enum
import type { PromotionalNotificationRequest } from "../../types/Notification"; // Import PromotionalNotificationRequest type

export default function AdminPromotionalNotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast(); // Initialize useToast
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for confirmation modal
  const [messageContent, setMessageContent] = useState(""); // Changed from message to messageContent
  const [messageCharCount, setMessageCharCount] = useState(0); // State for character count
  const MAX_MESSAGE_LENGTH = 300; // Define max message length
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType>(TargetType.ALL_USERS); // Use TargetType enum
  const [specificTargetInput, setSpecificTargetInput] = useState("");

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const imageUploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (imageUrl) => {
      setUploadedImageUrl(imageUrl);
      showToast("Image uploaded successfully!", "success");
    },
    onError: (error: any) => {
      showToast(error?.message || "Failed to upload image.", "error");
    },
  });
  const sendNotificationMutation = useMutation({
    mutationFn: (data: PromotionalNotificationRequest) => sendPromotionalNotification(data), // Use PromotionalNotificationRequest
    onSuccess: () => {
      setMessageContent(""); // Reset messageContent
      setSpecificTargetInput("");
      setSelectedFile(null); // Reset selected file
      setUploadedImageUrl(null); // Reset uploaded image URL
      setShowConfirmationModal(false); // Close modal on success
      showToast("Promotional notification sent successfully!", "success"); // Use toast
      queryClient.invalidateQueries({ queryKey: ["adminNotificationLogs"] });
    },
    onError: (error: any) => {
      setShowConfirmationModal(false); // Close modal on error
      showToast(error?.message || "Failed to send promotional notification.", "error"); // Use toast
    },
  });

  const handleConfirmSend = () => {
    let finalTargetIdentifiers: string[] | undefined = undefined;

    if (selectedTargetType === TargetType.SPECIFIC_PHONES) {
      finalTargetIdentifiers = specificTargetInput.split(",").map((s) => s.trim()).filter(Boolean);
    }

    sendNotificationMutation.mutate({
      messageContent, // Use messageContent
      targetType: selectedTargetType,
      targetIdentifiers: finalTargetIdentifiers,
      imageUrl: uploadedImageUrl || undefined, // Pass imageUrl if available
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) { // Use messageContent
      showToast("Message cannot be empty.", "error");
      return;
    }

    if (selectedTargetType === TargetType.SPECIFIC_PHONES && !specificTargetInput.trim()) { // Use TargetType enum
      showToast("Specific users input cannot be empty if 'Specific Users' is selected.", "error");
      return;
    }

    if (selectedFile && !uploadedImageUrl) {
      // If a file is selected but not yet uploaded (or upload failed), attempt to upload it now.
      imageUploadMutation.mutate(selectedFile, {
        onSuccess: (imageUrl) => {
          setUploadedImageUrl(imageUrl);
          setShowConfirmationModal(true); // Open modal after successful upload
        },
        onError: (error) => {
          showToast(error?.message || "Failed to upload image before sending notification.", "error");
        }
      });
      return; // Exit handleSubmit, it will be re-triggered after image upload success
    }
    
    setShowConfirmationModal(true); // Open confirmation modal
  }; // Closing brace for handleSubmit
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[var(--color-text)]">Admin Promotional Notifications</h1>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="messageContent"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              rows={5}
              value={messageContent}
              onChange={(e) => {
                const text = e.target.value;
                setMessageContent(text);
                setMessageCharCount(text.length);
              }}
              placeholder="Enter your promotional message here..."
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              WhatsApp messages support basic formatting. Max {MAX_MESSAGE_LENGTH} characters recommended. Current: {messageCharCount}
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <div className="mt-1 space-y-2">
              <div>
                <input
                  type="radio"
                  id="target-all-users"
                  name="target-type"
                  value={TargetType.ALL_USERS} // Use enum value
                  checked={selectedTargetType === TargetType.ALL_USERS} // Use enum value
                  onChange={() => setSelectedTargetType(TargetType.ALL_USERS)} // Use enum value
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="target-all-users" className="text-sm text-gray-700">All Users (Members)</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="target-all-members"
                  name="target-type"
                  value={TargetType.ALL_MEMBERS} // Use enum value
                  checked={selectedTargetType === TargetType.ALL_MEMBERS} // Use enum value
                  onChange={() => setSelectedTargetType(TargetType.ALL_MEMBERS)} // Use enum value
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="target-all-members" className="text-sm text-gray-700">All Members</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="target-all-trainers"
                  name="target-type"
                  value={TargetType.ALL_TRAINERS} // Use enum value
                  checked={selectedTargetType === TargetType.ALL_TRAINERS} // Use enum value
                  onChange={() => setSelectedTargetType(TargetType.ALL_TRAINERS)} // Use enum value
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="target-all-trainers" className="text-sm text-gray-700">All Trainers</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="target-specific-users"
                  name="target-type"
                  value={TargetType.SPECIFIC_PHONES} // Use enum value
                  checked={selectedTargetType === TargetType.SPECIFIC_PHONES} // Use enum value
                  onChange={() => setSelectedTargetType(TargetType.SPECIFIC_PHONES)} // Use enum value
                  className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="target-specific-users" className="text-sm text-gray-700">Specific Users (comma-separated phone numbers)</label>
              </div>
            </div>

            {selectedTargetType === TargetType.SPECIFIC_PHONES && ( // Use enum value
              <input
                type="text"
                id="specific-target-input"
                className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                value={specificTargetInput}
                onChange={(e) => setSpecificTargetInput(e.target.value)}
                placeholder="Enter comma-separated phone numbers (e.g., +15551234567)"
                required={true}
              />
            )}
          </div>
          {/* Image Upload Section */}
          <div className="mb-6">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Optional Image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setSelectedFile(file);
                setUploadedImageUrl(null); // Clear previous URL if new file selected
                if (!file) {
                    // If no file selected, clear uploaded image url and error
                    imageUploadMutation.reset();
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-[var(--color-primary)] file:text-white
                         hover:file:bg-[var(--color-accent)]"
            />
            {imageUploadMutation.isPending && <p className="mt-2 text-sm text-gray-500">Uploading image...</p>}
            {imageUploadMutation.isError && <p className="mt-2 text-sm text-red-600">Error uploading image.</p>}
            {uploadedImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                <img src={uploadedImageUrl} alt="Preview" className="max-w-xs h-auto rounded-md shadow-md" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors"
            disabled={sendNotificationMutation.isPending || imageUploadMutation.isPending || !messageContent.trim() || (selectedTargetType === TargetType.SPECIFIC_PHONES && !specificTargetInput.trim())} // Use messageContent and enum
          >
            {sendNotificationMutation.isPending ? "Sending..." : "Send Promotional Notification"}
          </button>
        </form>
        {sendNotificationMutation.isSuccess && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-600 mb-2">Notification sent successfully!</p>
            <Link 
              to="/admin/notifications/logs" 
              className="text-[var(--color-primary)] hover:underline text-sm font-medium"
              onClick={() => sendNotificationMutation.reset()} // Reset state to allow sending new notification
            >
              View Notification Logs
            </Link>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSend}
        title="Confirm Promotional Notification"
        message={
          <>
            <p>You are about to send the following promotional notification:</p>
            <p className="mt-2 font-semibold">Message:</p>
            <p className="p-2 border rounded-md bg-gray-50">{messageContent}</p> // Use messageContent
            <p className="mt-2 font-semibold">Target:</p>
            <p className="p-2 border rounded-md bg-gray-50">
              {selectedTargetType === TargetType.SPECIFIC_PHONES ? `Specific Users: ${specificTargetInput}` : // Use enum
               selectedTargetType === TargetType.ALL_USERS ? "All Users (Members)" : // Use enum
               selectedTargetType === TargetType.ALL_MEMBERS ? "All Members" : // Use enum
               "All Trainers"}
            </p>
            {uploadedImageUrl && (
              <>
                <p className="mt-2 font-semibold">Image:</p>
                <img src={uploadedImageUrl} alt="Preview" className="max-w-xs h-auto rounded-md shadow-md" />
              </>
            )}
          </>
        }
        confirmText={sendNotificationMutation.isPending ? "Sending..." : "Send Now"}
        cancelText="Cancel"
        isConfirming={sendNotificationMutation.isPending}
      />
    </div>
  );
}