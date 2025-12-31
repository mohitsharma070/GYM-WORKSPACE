import React, { useState } from "react";
import { Button } from "./Button";

function WhatsAppCredentialForm() {
  const [apiUrl, setApiUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/whatsapp/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiUrl, accessToken, phoneNumberId }),
      });
      if (res.ok) {
        setMessage("Credentials updated successfully!");
        setApiUrl("");
        setAccessToken("");
        setPhoneNumberId("");
      } else {
        setMessage("Failed to update credentials.");
      }
    } catch (err) {
      setMessage("Error updating credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded shadow">
      <div>
        <label className="block mb-1 font-medium">API URL</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Access Token</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Phone Number ID</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Phone Number ID"
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Credentials"}
      </Button>
      {message && <p className="text-center text-sm mt-2">{message}</p>}
    </form>
  );
}

export default WhatsAppCredentialForm;
