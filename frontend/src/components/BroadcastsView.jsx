import React, { useState } from 'react';

export default function BroadcastsView() {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Eid Special Promo',
      message: 'আমাদের ঈদ কালেকশনে ২০% ছাড় চলছে! ভিজিট করুন আমাদের শপে।',
      target: 'All Subscribers',
      sentCount: 1240,
      status: 'Completed',
      date: '2026-04-10'
    },
    {
      id: 2,
      name: 'New Product Launch',
      message: 'নতুন প্রিমিয়াম ক্যাটালগ রিলিজ হয়েছে। এখনই অর্ডার করুন।',
      target: 'Messenger Leads',
      sentCount: 850,
      status: 'Completed',
      date: '2026-04-18'
    }
  ]);

  const [campaignName, setCampaignName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Subscribers');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!campaignName.trim() || !messageBody.trim()) {
      alert('অনুগ্রহ করে ক্যাম্পেইনের নাম এবং মেসেজ টাইপ করুন।');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const newCampaign = {
        id: Date.now(),
        name: campaignName,
        message: messageBody,
        target: targetAudience,
        sentCount: Math.floor(Math.random() * 500) + 100,
        status: 'Sent Successfully',
        date: new Date().toISOString().split('T')[0]
      };

      setCampaigns([newCampaign, ...campaigns]);
      setCampaignName('');
      setMessageBody('');
      setIsSending(false);
      alert('🎉 ব্রডকাস্ট ক্যাম্পেইন সফলভাবে পাঠানো হয়েছে!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1. ব্রডকাস্ট ফর্ম */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">নতুন ব্রডকাস্ট ক্যাম্পেইন তৈরি করুন</h3>
          <p className="text-xs text-slate-400 mt-0.5">আপনার সকল সাবস্ক্রাইবার বা নির্দিষ্ট অডিয়েন্সকে একসাথে মেসেজ পাঠান</p>
        </div>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">ক্যাম্পেইনের নাম</label>
              <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Eid Special Offer" 
                className="w-full text-xs border border-slate-200 px-3 py-2.5 rounded-xl outline-none focus:border-blue-500 transition" 
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">টার্গেট অডিয়েন্স</label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-xs border border-slate-200 px-3 py-2.5 rounded-xl outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="All Subscribers">All Subscribers (2,410)</option>
                <option value="Messenger Leads">Messenger Leads Only</option>
                <option value="Instagram Users">Instagram Users Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">মেসেজ বডি</label>
            <textarea 
              rows="3" 
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="আপনার অফার বা বার্তা এখানে লিখুন..." 
              className="w-full text-xs border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 transition"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            {isSending ? (
              <span>⏳ মেটায় পাঠানো হচ্ছে...</span>
            ) : (
              <span>🚀 Broadcast Now</span>
            )}
          </button>
        </form>
      </div>

      {/* 2. ব্রডকাস্ট হিস্ট্রি ও স্ট্যাটাস তালিকা */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-800">সাম্প্রতিক ব্রডকাস্ট ক্যাম্পেইনসমূহ ({campaigns.length})</h3>
          <span className="text-xs text-slate-400">রিয়েল-টাইম ট্র্যাক রেকর্ড</span>
        </div>

        <div className="divide-y divide-slate-100">
          {campaigns.map((item) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.message}</p>
                <p className="text-[11px] text-slate-400">Target: {item.target} • Sent Date: {item.date}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">{item.sentCount} Users</span>
                  <span className="text-[10px] text-emerald-600 font-medium">100% Delivered</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
