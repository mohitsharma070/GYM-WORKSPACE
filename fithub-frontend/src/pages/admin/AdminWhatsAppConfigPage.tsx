import React, { useState } from 'react';
import { useToast } from '../../components/ToastProvider';
import { MessageSquareText } from 'lucide-react'; // Import the icon
import PageHeader from '../../components/PageHeader'; // Import PageHeader

// Placeholder API function to send credentials to the backend
// In a real scenario, this would call a secure admin API endpoint
// that encrypts and stores the credentials.
async function saveWhatsAppCredentials(
  apiUrl: string,
  accessToken: string,
  phoneNumberId: string
): Promise<{ success: boolean; message: string }> {
  console.log("Simulating saving credentials to backend...", { apiUrl, accessToken: '**********', phoneNumberId });
  // Simulate API call success/failure
  return new Promise((resolve) => {
    setTimeout(() => {
      if (apiUrl && accessToken && phoneNumberId) {
        resolve({ success: true, message: 'WhatsApp credentials saved successfully on backend.' });
      } else {
        resolve({ success: false, message: 'Failed to save WhatsApp credentials: All fields are required.' });
      }
    }, 1000);
  });
}

export default function AdminWhatsAppConfigPage() {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [phoneNumberId, setPhoneNumberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await saveWhatsAppCredentials(apiUrl, accessToken, phoneNumberId);

    if (result.success) {
      showToast(result.message, 'success');
      // Clear fields for security after successful submission
      setApiUrl('');
      setAccessToken('');
      setPhoneNumberId('');
    } else {
      showToast(result.message, 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={MessageSquareText}
        title="WhatsApp Configuration"
        subtitle="Configure Meta WhatsApp Business API credentials."
      />
      <div className="bg-white shadow-sm rounded-lg p-8 max-w-2xl">
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            Securely configure the Meta WhatsApp Business API credentials. These credentials are sent to the
            backend once for storage and are never displayed again.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp API URL
            </label>
            <input
              type="text"
              id="apiUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g., https://graph.facebook.com/v19.0/"
              required
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Access Token
            </label>
            <input
              type="password" // Use type="password" for security
              id="accessToken"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your access token"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number ID
            </label>
            <input
              type="text"
              id="phoneNumberId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g., 10XXXXXXXXXXX"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Credentials'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}