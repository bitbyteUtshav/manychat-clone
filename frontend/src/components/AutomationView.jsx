import React, { useState } from 'react';

export default function AutomationView() {
  const [subTab, setSubTab] = useState('My Automations');
  const [viewMode, setViewMode] = useState('list'); // 'list' অথবা 'canvas'
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Dynamic Canvas States
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSaved, setIsSaved] = useState(true);
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const [currentFlowTitle, setCurrentFlowTitle] = useState('Default Reply');

  // অটোমেশন ডেমো ডাটা
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Default Reply',
      status: 'LIVE',
      runs: 0,
      ctr: 'n/a',
      modified: '1d'
    }
  ]);

  // ক্যানভাসের ভিজ্যুয়াল নোডসমূহ
  const [nodes, setNodes] = useState([
    { id: 'node-1', type: 'Trigger', title: 'When...', desc: 'User sends a Direct Message', color: 'border-emerald-500' },
    { id: 'node-2', type: 'Messenger', title: 'Default Reply', desc: 'ধন্যবাদ মেসেজ দেওয়ার জন্য! দ্রুত উত্তর দেওয়া হবে।', color: 'border-blue-500' },
    { id: 'node-3', type: 'Action', title: 'Successfully', desc: 'ধন্যবাদ আমাদের সাথে থাকার জন্য!', color: 'border-purple-500' }
  ]);

  // ১. জুম হ্যান্ডলারসমূহ
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // ২. নোড যোগ করা
  const handleAddNode = (nodeType, title) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      title: title,
      desc: 'নতুন ধাপ কনফিগার করুন',
      color: nodeType === 'Trigger' ? 'border-emerald-500' : nodeType === 'Messenger' ? 'border-blue-500' : 'border-amber-500'
    };
    setNodes([...nodes, newNode]);
    setShowAddNodeModal(false);
    setIsSaved(false);
  };

  // ৩. নোড রিমুভ / ডিলিট করা
  const handleDeleteNode = (id) => {
    setNodes(nodes.filter(node => node.id !== id));
    setIsSaved(false);
  };

  // ৪. নতুন অটোমেশন তৈরি করা মাত্রই সেটি DRAFT হিসেবে লিস্টে যুক্ত হয়ে যাবে
  const handleCreateNewAutomation = () => {
    const newId = Date.now();
    const newTitle = `New Custom Flow #${automations.length + 1}`;
    
    const newAuto = {
      id: newId,
      name: newTitle,
      status: 'DRAFT', // সেভ না করলে এটি ড্রাফট হিসেবেই থাকবে
      runs: 0,
      ctr: 'n/a',
      modified: 'Just now'
    };

    setAutomations([newAuto, ...automations]);
    setCurrentFlowId(newId);
    setCurrentFlowTitle(newTitle);
    setNodes([
      { id: `node-${Date.now()}`, type: 'Trigger', title: 'When...', desc: 'Start trigger condition', color: 'border-emerald-500' }
    ]);
    setViewMode('canvas');
    setIsSaved(false);
  };

  // ৫. ফ্লো এডিট করার জন্য ওপেন করা
  const handleEditAutomation = (item) => {
    setCurrentFlowId(item.id);
    setCurrentFlowTitle(item.name);
    setViewMode('canvas');
    setIsSaved(true);
  };

  // ৬. সেভ করার পর স্ট্যাটাস LIVE বা Saved আপডেট করা
  const handleSaveFlow = () => {
    setIsSaved(true);
    
    // লিস্টের ড্রাফট ফ্লোটিকে আপডেট করে লাইভ বা সেভড করে দেওয়া
    setAutomations(automations.map(item => {
      if (item.id === currentFlowId) {
        return { ...item, name: currentFlowTitle, status: 'LIVE', modified: 'Just now' };
      }
      return item;
    }));

    alert('🎉 অটোমেশন সফলভাবে সেভ করা হয়েছে!');
    setViewMode('list');
  };

  // ৭. সেভ না করে ব্যাক করলে ড্রাফট হিসেবে থেকে যাবে
  const handleBackToList = () => {
    setViewMode('list');
  };

  return (
    <div className="space-y-4">
      {viewMode === 'list' ? (
        /* ================= 1. AUTOMATION LIST VIEW ================= */
        <div className="space-y-5">
          {/* Sub Navigation */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl max-w-md gap-1">
            {['My Automations', 'Basic', 'Sequences'].map(tab => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  subTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold text-slate-800">My Automations</h2>

          {/* Action Header */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <button
              onClick={handleCreateNewAutomation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              <span className="text-sm">+</span> New Automation
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search all Automations"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Toolbar Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button onClick={handleCreateNewAutomation} className="border border-dashed border-slate-300 text-blue-600 hover:bg-blue-50 font-semibold text-xs px-3 py-2 rounded-xl transition">
              + New Folder
            </button>
            <button onClick={() => setAutomations([])} className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1">
              🗑 Trash All
            </button>
          </div>

          {/* Automation Cards List */}
          <div className="space-y-3">
            {automations.map(item => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded-md uppercase ${item.status === 'LIVE' ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {item.status}
                  </span>
                  <div>
                    <h4
                      onClick={() => handleEditAutomation(item)}
                      className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    <div className="flex gap-4 text-[11px] text-slate-400 mt-1">
                      <span>Runs: {item.runs}</span>
                      <span>CTR: {item.ctr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs text-slate-400">{item.modified}</span>
                  <button
                    onClick={() => handleEditAutomation(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= 2. VISUAL FLOWCHART CANVAS ================= */
        <div className="relative bg-slate-100 border border-slate-200 rounded-2xl min-h-[600px] flex flex-col justify-between overflow-hidden">
          
          {/* Canvas Top Bar */}
          <div className="bg-white p-3 border-b border-slate-200 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1 ${isSaved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSaved ? '✓ Saved' : '● Unsaved (Draft)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPreviewModal(true)}
                className="bg-blue-50 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-blue-100 transition flex items-center gap-1"
              >
                💬 Preview
              </button>
              <button 
                onClick={handleSaveFlow}
                className="font-bold text-xs px-4 py-1.5 rounded-xl transition bg-blue-600 text-white hover:bg-blue-700 shadow-md"
              >
                Save
              </button>
            </div>
          </div>

          {/* Interactive Flow Nodes Container */}
          <div className="p-6 flex-1 overflow-x-auto flex items-center justify-center gap-8 relative min-h-[400px] transition-transform duration-200 ease-out"
               style={{ transform: `scale(${zoomLevel})` }}>
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                {index > 0 && (
                  <div className="flex items-center">
                    <div className="w-8 sm:w-12 h-0.5 bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                )}
                <div className={`bg-white border-2 ${node.color} p-4 rounded-xl shadow-md min-w-[200px] max-w-[240px] space-y-2 relative group hover:shadow-lg transition`}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {node.type}
                    </span>
                    <button 
                      onClick={() => handleDeleteNode(node.id)}
                      className="text-xs text-slate-300 hover:text-red-500 font-bold transition p-1"
                      title="Remove Node"
                    >
                      🗑️
                    </button>
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">{node.title}</h5>
                  <p className="text-[11px] text-slate-500">{node.desc}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Zoom Floating Buttons */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-1.5 bg-white p-1 rounded-xl shadow-md border border-slate-200 z-10">
            <button onClick={handleResetZoom} title="Reset Zoom" className="p-2 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">🪄</button>
            <button onClick={handleZoomIn} title="Zoom In" className="p-2 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">+</button>
            <button onClick={handleZoomOut} title="Zoom Out" className="p-2 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600">-</button>
          </div>

          {/* Floating Add Node Button */}
          <div className="absolute right-4 bottom-4 z-10">
            <button
              onClick={() => setShowAddNodeModal(true)}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center font-bold text-2xl transition hover:scale-105"
            >
              +
            </button>
          </div>

          {/* ================= 3. ADD NODE POPUP DIALOG ================= */}
          {showAddNodeModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-800">Add Node</h3>
                  <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Trigger</p>
                  <button
                    onClick={() => handleAddNode('Trigger', 'User Keyword Match')}
                    className="w-full border border-dashed border-slate-300 p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 text-left transition"
                  >
                    <span className="text-lg">▶</span>
                    <div>
                      <p className="font-semibold text-xs text-slate-800">Trigger</p>
                      <p className="text-[10px] text-slate-400">Start flow when keyword or event triggers</p>
                    </div>
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Content</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddNode('Messenger', 'Send Messenger Reply')}
                      className="border border-slate-200 p-3 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-left transition"
                    >
                      <span className="text-blue-500 font-bold">💬</span>
                      <span className="font-semibold text-xs text-slate-700">Messenger</span>
                    </button>
                    <button
                      onClick={() => handleAddNode('Content', 'Start Sub-Automation')}
                      className="border border-slate-200 p-3 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-left transition"
                    >
                      <span className="text-amber-500 font-bold">➡️</span>
                      <span className="font-semibold text-xs text-slate-700">Start Automation</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Logic & Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddNode('Action', 'Add Tag / Action')}
                      className="border border-slate-200 p-3 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-left transition"
                    >
                      <span className="text-amber-600 font-bold">⚡</span>
                      <span className="font-semibold text-xs text-slate-700">Actions</span>
                    </button>
                    <button
                      onClick={() => handleAddNode('Condition', 'User Subscribed Filter')}
                      className="border border-slate-200 p-3 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-left transition"
                    >
                      <span className="text-purple-600 font-bold">🔀</span>
                      <span className="font-semibold text-xs text-slate-700">Condition</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. PREVIEW MODAL ================= */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-800">💬 Flow Simulation Preview</h3>
                  <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 h-64 overflow-y-auto">
                  {nodes.map((n, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-blue-600 text-[10px] uppercase">Step {i + 1}: {n.type}</span>
                      <p className="font-medium text-slate-800">{n.title}</p>
                      <p className="text-[10px] text-slate-500">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                  Close Preview
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
