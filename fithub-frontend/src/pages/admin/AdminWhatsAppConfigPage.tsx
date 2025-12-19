import React, { useState } from 'react';
import { useToast } from '../../components/ToastProvider';

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

const AdminWhatsAppConfigPage: React.FC = () => {
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin: WhatsApp API Configuration</h1>
      <p className="mb-4 text-gray-700">
        Securely configure the Meta WhatsApp Business API credentials. These credentials are sent to the
        backend once for storage and are never displayed again.
      </p>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="apiUrl" className="block text-gray-700 text-sm font-bold mb-2">
            WhatsApp API URL:
          </label>
          <input
            type="text"
            id="apiUrl"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="e.g., https://graph.facebook.com/v19.0/"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="accessToken" className="block text-gray-700 text-sm font-bold mb-2">
            WhatsApp Access Token:
          </label>
          <input
            type="password" // Use type="password" for security
            id="accessToken"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumberId" className="block text-gray-700 text-sm font-bold mb-2">
            WhatsApp Phone Number ID:
          </label>
          <input
            type="text"
            id="phoneNumberId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="e.g., 10XXXXXXXXXXX"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Credentials'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminWhatsAppConfigPage;
