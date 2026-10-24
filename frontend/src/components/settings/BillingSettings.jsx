import React from 'react';

export default function BillingSettings() {
  return (
    <div className="space-y-4 max-w-xl">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-amber-900">Free Plan Active</h4>
          <p className="text-[11px] text-amber-700 mt-0.5">আপনি বর্তমানে ফ্রি ডেমো সাবস্ক্রিপশন ব্যবহার করছেন।</p>
        </div>
        <button className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm">
          Upgrade Pro
        </button>
      </div>
    </div>
  );
}
