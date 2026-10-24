import React from 'react';

export default function ChannelsSettings({ tab }) {
  return (
    <div className="space-y-4 max-w-xl">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-blue-900">{tab} চ্যানেল কানেকশন</h4>
          <p className="text-[11px] text-blue-700 mt-0.5">অটোমেশন ও লাইভ চ্যাটের জন্য {tab} অ্যাকাউন্ট ম্যানেজ করুন।</p>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg">Connected</span>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">{tab} Access Token</label>
        <input type="password" value="EAAQ..._dummy_channel_token" readOnly className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-500 font-mono" />
      </div>
    </div>
  );
}
