import React from 'react';

export default function InboxSettings({ tab }) {
  return (
    <div className="space-y-4 max-w-xl">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-xs text-slate-800">{tab} কনফিগারেশন</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">Auto Assign New Live Chats</span>
          <input type="checkbox" defaultChecked className="rounded text-blue-600" />
        </div>
      </div>
    </div>
  );
}
