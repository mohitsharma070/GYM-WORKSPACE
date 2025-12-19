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
    <div className="p-6">
      <PageHeader
        icon={MessageSquareText}
        title="WhatsApp Configuration"
        subtitle="Configure Meta WhatsApp Business API credentials."
      />
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md">
        <p className="mb-4 text-sm text-gray-600">
          Securely configure the Meta WhatsApp Business API credentials. These credentials are sent to the
          backend once for storage and are never displayed again.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp API URL:
            </label>
            <input
              type="text"
              id="apiUrl"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g., https://graph.facebook.com/v19.0/"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Access Token:
            </label>
            <input
              type="password" // Use type="password" for security
              id="accessToken"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone Number ID:
            </label>
            <input
              type="text"
              id="phoneNumberId"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g., 10XXXXXXXXXXX"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-md hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}