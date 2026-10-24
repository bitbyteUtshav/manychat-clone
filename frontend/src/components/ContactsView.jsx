import React from 'react';

export default function ContactsView({ contacts }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-800">সকল লিড ও কন্টাক্ট ({contacts.length})</h3>
        <input type="text" placeholder="Search contact..." className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg outline-none" />
      </div>
      <div className="divide-y divide-slate-100">
        {contacts.map(c => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">{c.name.charAt(0)}</div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                <p className="text-xs text-slate-400">Channel: {c.channel} • Active {c.lastActive}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
