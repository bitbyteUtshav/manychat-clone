import React from 'react';

export default function MainSettings({ tab }) {
  if (tab === 'General') {
    return (
      <div className="space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Meta App ID</label>
          <input type="text" readOnly value="1565616468665469" className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-500 font-mono" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Webhook URL (Meta Developer Console)</label>
          <input type="text" readOnly value="https://super-space-xylophone-jjp767gj9x4j25767-5000.app.github.dev/api/bot/webhook" className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-500 font-mono" />
        </div>
        <button onClick={() => alert('General settings saved!')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition">
          Save Changes
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 text-center space-y-2">
      <div className="text-3xl">🛠️</div>
      <h4 className="font-bold text-sm text-slate-700">{tab} সেকশন</h4>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">অ্যাডমিন সিস্টেমের {tab} সংক্রান্ত প্রিফারেন্স কনফিগার করুন।</p>
    </div>
  );
}
