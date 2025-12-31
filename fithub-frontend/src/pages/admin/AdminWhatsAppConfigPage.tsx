
import { MessageSquareText, Shield, Settings, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import WhatsAppCredentialForm from '../../components/WhatsAppCredentialForm';

export default function AdminWhatsAppConfigPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={MessageSquareText}
        title="WhatsApp Configuration"
        subtitle="Configure Meta WhatsApp Business API credentials."
      />
      {/* Configuration Statistics Dashboard (optional, can be enhanced to use backend status) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Configuration Status"
          value="Status Unknown"
          icon={AlertTriangle}
          variant="warning"
          description="Status from backend not implemented"
        />
        <StatCard
          title="Setup Progress"
          value={`-`}
          icon={Settings}
          variant="info"
          description={`N/A`}
        />
        <StatCard
          title="Security Status"
          value="Encrypted"
          icon={Shield}
          variant="default"
          description="Credentials protected"
        />
      </div>
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
        <WhatsAppCredentialForm />
      </div>
    </div>
  );
}