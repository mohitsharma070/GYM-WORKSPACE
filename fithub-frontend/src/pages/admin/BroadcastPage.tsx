import React, { useState } from "react";
import { sendPromotionalNotification } from "../../api/notifications";
import { uploadImage } from "../../api/images";
import { Link } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ToastProvider";
import { TargetType } from "../../types/TargetType";
import type { PromotionalNotificationRequest } from "../../types/Notification";
import { Megaphone, Send, Eye, Users, MessageSquare, Image, Info, CheckCircle, AlertCircle, Activity, Target, Globe } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { normalizePhoneInput } from "../../utils/phone";

export default function BroadcastPage() {
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
    onSuccess: (result) => {
      setMessageContent("");
      setSpecificTargetInput("");
      setSelectedFile(null);
      setUploadedImageUrl(null);
      setShowConfirmationModal(false);
      // Improved error handling: treat any message containing 'Failed' or 'Exception' as error
      const lowerMsg = (result.message || '').toLowerCase();
      if (result.success && !lowerMsg.includes('failed') && !lowerMsg.includes('exception')) {
        showToast(result.message, "success");
      } else if (lowerMsg.includes('failed') || lowerMsg.includes('exception')) {
        showToast(result.message, "error");
      } else {
        showToast(result.message || "Failed to send broadcast.", "error");
      }
      queryClient.invalidateQueries({ queryKey: ["adminNotificationLogs"] });
    },
    onError: (error: any) => {
      setShowConfirmationModal(false);
      showToast(error?.message || "Failed to send broadcast.", "error");
    },
  });

  const handleConfirmSend = () => {
    let finalTargetIdentifiers: string[] | undefined = undefined;

    if (selectedTargetType === TargetType.SPECIFIC_PHONES) {
      finalTargetIdentifiers = specificTargetInput
        .split(",")
        .map((s) => normalizePhoneInput(s))
        .filter(Boolean);
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
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <PageHeader
        icon={Megaphone}
        title="Broadcast Notifications"
        subtitle="Send promotional messages and announcements to members and trainers."
      />

      {/* STATS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Message Length"
          value={messageCharCount}
          icon={MessageSquare}
          description={`${MAX_MESSAGE_LENGTH - messageCharCount} chars remaining`}
          variant={messageCharCount > 250 ? 'warning' : 'info'}
        />
        <StatCard
          title="Target Audience"
          value={
            selectedTargetType === TargetType.ALL_USERS ? 'All Users' :
            selectedTargetType === TargetType.ALL_MEMBERS ? 'All Members' :
            selectedTargetType === TargetType.ALL_TRAINERS ? 'All Trainers' :
            'Specific Users'
          }
          icon={
            selectedTargetType === TargetType.ALL_USERS ? Globe :
            selectedTargetType === TargetType.ALL_MEMBERS ? Users :
            selectedTargetType === TargetType.ALL_TRAINERS ? Activity :
            Target
          }
          description="Selected broadcast target"
          variant="success"
        />
        <StatCard
          title="Media Attachment"
          value={uploadedImageUrl ? 'Image Ready' : 'No Media'}
          icon={Image}
          description={uploadedImageUrl ? 'Image uploaded successfully' : 'Optional image attachment'}
          variant={uploadedImageUrl ? 'success' : 'default'}
        />
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">How Broadcast Works</h3>
            <p className="text-sm text-blue-700 mb-2">
              Your message will be sent via WhatsApp to the selected audience. Messages are delivered instantly and delivery status is tracked.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Instant delivery
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Delivery tracking
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={12} /> Rich media support
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl border border-blue-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                id="messageContent"
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 resize-none shadow-sm"
                rows={6}
                value={messageContent}
                onChange={(e) => {
                  const text = e.target.value;
                  setMessageContent(text);
                  setMessageCharCount(text.length);
                }}
                placeholder="Type your message here... ✨"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <div className="flex justify-between mt-3 text-sm">
                <div className="flex items-center space-x-4">
                  <span className={`font-medium ${
                    messageCharCount > 250 ? 'text-orange-600' : 
                    messageCharCount > 200 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {messageCharCount}/{MAX_MESSAGE_LENGTH} characters
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        messageCharCount > 250 ? 'bg-orange-500' :
                        messageCharCount > 200 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(messageCharCount / MAX_MESSAGE_LENGTH) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {messageCharCount > 250 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle size={14} />
                    <span className="font-medium">May be truncated</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={20} />
                </div>
                <label className="text-sm font-semibold text-gray-700">Target Audience</label>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="target-all-users"
                        name="target-type"
                        value={TargetType.ALL_USERS}
                        checked={selectedTargetType === TargetType.ALL_USERS}
                        onChange={() => setSelectedTargetType(TargetType.ALL_USERS)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="target-all-users" className="text-sm font-medium text-gray-700">All Users (Members)</label>
                        <p className="text-xs text-gray-500">Send to all registered members</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="target-all-members"
                        name="target-type"
                        value={TargetType.ALL_MEMBERS}
                        checked={selectedTargetType === TargetType.ALL_MEMBERS}
                        onChange={() => setSelectedTargetType(TargetType.ALL_MEMBERS)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="target-all-members" className="text-sm font-medium text-gray-700">All Members</label>
                        <p className="text-xs text-gray-500">Send to active gym members only</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="target-all-trainers"
                        name="target-type"
                        value={TargetType.ALL_TRAINERS}
                        checked={selectedTargetType === TargetType.ALL_TRAINERS}
                        onChange={() => setSelectedTargetType(TargetType.ALL_TRAINERS)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="target-all-trainers" className="text-sm font-medium text-gray-700">All Trainers</label>
                        <p className="text-xs text-gray-500">Send to all gym trainers and staff</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="target-specific-users"
                        name="target-type"
                        value={TargetType.SPECIFIC_PHONES}
                        checked={selectedTargetType === TargetType.SPECIFIC_PHONES}
                        onChange={() => setSelectedTargetType(TargetType.SPECIFIC_PHONES)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="target-specific-users" className="text-sm font-medium text-gray-700">Specific Users (Phone Numbers)</label>
                        <p className="text-xs text-gray-500">Send to specific phone numbers</p>
                      </div>
                    </div>
                  </div>
                </div>


                {selectedTargetType === TargetType.SPECIFIC_PHONES && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Enter phone numbers separated by commas (e.g., +1234567890, +1987654321)"
                      value={specificTargetInput}
                      onChange={(e) => setSpecificTargetInput(e.target.value)}
                      onBlur={(e) => {
                        const normalized = e.target.value
                          .split(",")
                          .map((s) => normalizePhoneInput(s))
                          .filter(Boolean)
                          .join(", ");
                        setSpecificTargetInput(normalized);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image className="text-gray-600" size={18} />
                <label className="text-sm font-medium text-gray-700">Image Attachment (Optional)</label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSelectedFile(file || null);
                    
                    if (file) {
                      imageUploadMutation.mutate(file);
                    } else {
                      setUploadedImageUrl(null);
                    }
                  }}
                  className="block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-600 file:text-white
                             hover:file:bg-blue-700 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
                
                {imageUploadMutation.isPending && (
                  <div className="flex items-center gap-2 mt-3 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm">Uploading image...</p>
                  </div>
                )}
                
                {imageUploadMutation.isError && (
                  <div className="flex items-center gap-2 mt-3 text-red-600">
                    <AlertCircle size={16} />
                    <p className="text-sm">Error uploading image. Please try again.</p>
                  </div>
                )}
                
                {uploadedImageUrl && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <p className="text-sm font-medium text-green-700">Image uploaded successfully</p>
                    </div>
                    <img src={uploadedImageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded-md shadow-sm border" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={sendNotificationMutation.isPending || imageUploadMutation.isPending || !messageContent.trim() || (selectedTargetType === TargetType.SPECIFIC_PHONES && !specificTargetInput.trim())}
            >
              {sendNotificationMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send size={22} />
                  Send Broadcast Message
                </>
              )}
            </button>
          </form>
          
          {sendNotificationMutation.isSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-sm font-medium text-green-800">Broadcast sent successfully!</p>
              </div>
              <p className="text-sm text-green-700 mb-3">Your message has been delivered to the selected audience.</p>
              <Link 
                to="/admin/notifications/logs" 
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                onClick={() => sendNotificationMutation.reset()}
              >
                <Eye size={16} />
                View Delivery Status
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSend}
        title="Confirm Broadcast"
        message={
          <>
            <p>You are about to send the following broadcast:</p>
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
