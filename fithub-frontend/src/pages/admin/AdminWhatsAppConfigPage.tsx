import React, { useState } from 'react';
import { useToast } from '../../components/ToastProvider';
import { MessageSquareText, Shield, Settings, CheckCircle, AlertTriangle } from 'lucide-react'; // Import additional icons
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import { StatCard } from '../../components/StatCard'; // Import StatCard

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
  const [lastConfigured, setLastConfigured] = useState<Date | null>(null);
  const { showToast } = useToast();

  // Configuration status statistics
  const isConfigured = apiUrl && accessToken && phoneNumberId;
  const fieldsCompleted = [apiUrl, accessToken, phoneNumberId].filter(Boolean).length;
  const configurationProgress = Math.round((fieldsCompleted / 3) * 100);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await saveWhatsAppCredentials(apiUrl, accessToken, phoneNumberId);

    if (result.success) {
      showToast(result.message, 'success');
      setLastConfigured(new Date());
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
      
      {/* Configuration Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Configuration Status"
          value={isConfigured ? "Active" : "Incomplete"}
          icon={isConfigured ? CheckCircle : AlertTriangle}
          variant={isConfigured ? "success" : "warning"}
          description={isConfigured ? "Ready to send" : "Setup required"}
        />
        <StatCard
          title="Setup Progress"
          value={`${configurationProgress}%`}
          icon={Settings}
          variant="info"
          description={`${fieldsCompleted}/3 fields completed`}
        />
        <StatCard
          title="Security Status"
          value="Encrypted"
          icon={Shield}
          variant="default"
          description="Credentials protected"
        />
      </div>

      {lastConfigured && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-900">
                Configuration Updated Successfully
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Last configured on {lastConfigured.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-gray-50 shadow-sm rounded-lg p-8 max-w-2xl border">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 Security Notice</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              Securely configure the Meta WhatsApp Business API credentials. These credentials are sent to the
              backend once for storage and are never displayed again.
            </p>
          </div>
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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