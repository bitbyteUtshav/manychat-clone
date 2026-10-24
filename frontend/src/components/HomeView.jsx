import React from 'react';
import FacebookConnect from './FacebookConnect';

export default function HomeView({ automations, pages }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Total Subscribers</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">2,410</h3>
          <span className="text-xs text-emerald-600 font-semibold">↑ 12% this week</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Active Automations</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{automations.length} Flows</h3>
          <span className="text-xs text-blue-600 font-semibold">Running smoothly</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">Messages Handled</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">8,930</h3>
          <span className="text-xs text-purple-600 font-semibold">99.8% bot response</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">চ্যানেল কানেকশন</h3>
        <FacebookConnect />
        {pages.length > 0 && (
          <div className="mt-3 space-y-2">
            {pages.map((p, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                <span>{p.name}</span>
                <span className="text-emerald-600 font-semibold">Connected ✓</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
