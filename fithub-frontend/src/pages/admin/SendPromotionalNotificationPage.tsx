import React, { useState } from 'react';
import { sendPromotionalNotification } from '../../api/notifications';
import { uploadImage } from '../../api/images'; // Import uploadImage
import type { PromotionalNotificationRequest } from '../../types/Notification';
import { TargetType } from '../../types/TargetType'; // Correct import for TargetType
import { useToast } from '../../components/ToastProvider';
import { useMutation } from "@tanstack/react-query"; // Import useMutation

const SendPromotionalNotificationPage: React.FC = () => {
  const [targetType, setTargetType] = useState<TargetType>(TargetType.ALL_USERS);
  const [targetIdentifiers, setTargetIdentifiers] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const imageUploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (url) => {
      setUploadedImageUrl(url);
      showToast("Image uploaded successfully!", "success");
    },
    onError: (error: any) => {
      showToast(error?.message || "Failed to upload image.", "error");
    },
  });
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!messageContent.trim()) {
      showToast('Message content cannot be empty.', 'error');
      return;
    }

    let finalImageUrl: string | undefined = undefined; // Initialize as undefined

    if (selectedFile) {
      if (imageUploadMutation.isPending) {
        showToast("Please wait for the image to finish uploading.", "info");
        return;
      }
      if (!uploadedImageUrl) {
        // If file is selected but not yet uploaded, trigger upload
        imageUploadMutation.mutate(selectedFile);
        return; // Exit handleSubmit, it will be re-triggered after image upload success
      }
      finalImageUrl = uploadedImageUrl;
    }

    setIsLoading(true);

    const requestBody: PromotionalNotificationRequest = {
      targetType,
      messageContent,
      imageUrl: finalImageUrl,
    };

    if (targetType === TargetType.SPECIFIC_PHONES) {
      requestBody.targetIdentifiers = targetIdentifiers.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (requestBody.targetIdentifiers.length === 0) {
        showToast('Please enter at least one phone number for specific targeting.', 'error');
        setIsLoading(false);
        return;
      }
    }

    try {
      await sendPromotionalNotification(requestBody);
      showToast('Promotional notification sent successfully!', 'success');
      // Optionally reset form
      setTargetType(TargetType.ALL_USERS);
      setTargetIdentifiers('');
      setMessageContent('');
      setSelectedFile(null); // Reset selected file
      setUploadedImageUrl(null); // Reset uploaded image URL
    } catch (error: any) {
      console.error('Failed to send promotional notification:', error);
      showToast(error.message || 'Failed to send promotional notification.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Send Promotional Notification</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="targetType" className="block text-gray-700 text-sm font-bold mb-2">
            Target Audience:
          </label>
          <select
            id="targetType"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType)}
            required
          >
            {Object.values(TargetType).map((type: TargetType) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {targetType === TargetType.SPECIFIC_PHONES && (
          <div className="mb-4">
            <label htmlFor="targetIdentifiers" className="block text-gray-700 text-sm font-bold mb-2">
              Specific Phone Numbers (comma-separated):
            </label>
            <textarea
              id="targetIdentifiers"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              placeholder="e.g., +1234567890, +1987654321"
              value={targetIdentifiers}
              onChange={(e) => setTargetIdentifiers(e.target.value)}
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="messageContent" className="block text-gray-700 text-sm font-bold mb-2">
            Message Content:
          </label>
          <textarea
            id="messageContent"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            placeholder="Enter your promotional message here..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="imageUpload" className="block text-gray-700 text-sm font-bold mb-2">
            Image Upload (Optional):
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-500 file:text-white
                         hover:file:bg-blue-700"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              setSelectedFile(file);
              setUploadedImageUrl(null); // Clear uploaded URL if new file selected
              if (!file) {
                imageUploadMutation.reset(); // Reset mutation state if no file selected
              }
            }}
          />
          {imageUploadMutation.isPending && <p className="text-sm text-gray-600 mt-1">Uploading image...</p>}
          {imageUploadMutation.isError && <p className="text-sm text-red-600 mt-1">Error uploading image.</p>}
          {uploadedImageUrl && (
            <div className="mt-2">
              <p className="text-sm font-bold mb-1">Uploaded Image Preview:</p>
              <img src={uploadedImageUrl} alt="Preview" className="max-w-xs h-auto rounded-md shadow" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={isLoading || imageUploadMutation.isPending}
          >
            {isLoading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendPromotionalNotificationPage;
