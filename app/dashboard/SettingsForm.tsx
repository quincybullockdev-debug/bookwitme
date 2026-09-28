// runs in the browser for form inputs
"use client";

import { useState, useEffect } from "react";
import {
  updateBusinessProfile,
  toggleSmsEnabled,
  updateCashAppTag,
} from "./actions";

export default function SettingsForm({ business }: { business: any }) {
  // form state, pre-filled with the business's current values
  const [name, setName] = useState(business.name || "");
  const [cashappTag, setCashappTag] = useState(business.cashapp_tag || "");
  const [smsEnabled, setSmsEnabled] = useState(business.sms_enabled || false);

  // saves all 3 settings at once
  async function handleSave() {
    await updateBusinessProfile(business.id, name);
    await toggleSmsEnabled(business.id, smsEnabled);
    await updateCashAppTag(business.id, cashappTag);
  }

  return (
    <div>
      <h3>Settings</h3>
      <input
        placeholder="Business name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Cash App tag"
        value={cashappTag}
        onChange={(e) => setCashappTag(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={smsEnabled}
          onChange={(e) => setSmsEnabled(e.target.checked)}
        />
        SMS notifications enabled
      </label>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}
