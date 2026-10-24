import React, { useState } from 'react';

export default function InboxView({ messages }) {
  const [replyText, setReplyText] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
      <div className="border-r border-slate-200 overflow-y-auto">
        <div className="p-3 border-b border-slate-100 font-semibold text-xs text-slate-500">Conversations</div>
        {messages.map((msg, idx) => (
          <div key={idx} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xs text-slate-800">{msg.sender}</span>
              <span className="text-[10px] text-slate-400">{msg.time}</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="col-span-2 flex flex-col justify-between p-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-slate-800">Tanvir Ahmed</span>
          <span className="text-xs text-emerald-600 font-medium">● Online</span>
        </div>
        <div className="flex-col space-y-3 py-4 overflow-y-auto">
          <div className="bg-slate-100 p-3 rounded-xl max-w-xs text-xs text-slate-700">ভাই আপনার পণ্যের দাম কত?</div>
          <div className="bg-blue-600 text-white p-3 rounded-xl max-w-xs text-xs ml-auto">আমাদের ক্যাটালগ লিংক চেক করুন অথবা বলুন কোন আইটেমটি চাচ্ছেন!</div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text" 
            value={replyText} 
            onChange={(e) => setReplyText(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 text-xs border border-slate-200 px-3 py-2 rounded-xl outline-none"
          />
          <button onClick={() => { if(replyText) { alert(`Sent: ${replyText}`); setReplyText(''); }}} className="bg-blue-600 text-white text-xs px-4 py-2 rounded-xl font-semibold">Send</button>
        </div>
      </div>
    </div>
  );
}
