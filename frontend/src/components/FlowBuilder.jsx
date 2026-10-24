import React, { useState } from 'react';

export default function FlowBuilder() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'trigger',
      title: 'কাস্টমার মেসেজ (Trigger)',
      keyword: 'দাম কত / Price',
      content: 'ইউজার যখন নিচের কিওয়ার্ড লিখে মেসেজ দেবে'
    },
    {
      id: '2',
      type: 'message',
      title: 'অটো রিপ্লাই (Text Message)',
      content: 'ধন্যবাদ আমাদের নক করার জন্য! আমাদের প্রডাক্টের মূল্য ১,৫০০ টাকা।'
    }
  ]);

  const [selectedNode, setSelectedNode] = useState(nodes[1]);

  const addNode = (type) => {
    const newNode = {
      id: Date.now().toString(),
      type: type,
      title: type === 'message' ? 'নতুন মেসেজ নোড' : type === 'condition' ? 'শর্ত (If/Else)' : 'বাটন অপশন',
      content: type === 'message' ? 'এখানে আপনার মেসেজ লিখুন...' : 'কন্ডিশন সেট করুন...'
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  const updateNodeContent = (text) => {
    if (!selectedNode) return;
    const updated = nodes.map(node => 
      node.id === selectedNode.id ? { ...node, content: text } : node
    );
    setNodes(updated);
    setSelectedNode({ ...selectedNode, content: text });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar Controls */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 p-4 space-y-6 flex flex-col">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">⚡ Flow Elements</h2>
          <p className="text-xs text-slate-400">নতুন ড্রাগ/ক্লিক নোড যুক্ত করুন</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => addNode('message')}
            className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center gap-3 transition"
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-slate-200">Text Message</p>
              <p className="text-xs text-slate-400">টেক্সট বা বাটন রিপ্লাই পাঠাবে</p>
            </div>
          </button>

          <button 
            onClick={() => addNode('condition')}
            className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left flex items-center gap-3 transition"
          >
            <span className="text-xl">🔀</span>
            <div>
              <p className="text-sm font-semibold text-slate-200">If / Else Condition</p>
              <p className="text-xs text-slate-400">শর্ত অনুযায়ী মেসেজ ফিল্টার করবে</p>
            </div>
          </button>
        </div>

        {/* Node Property Inspector */}
        {selectedNode && (
          <div className="pt-4 border-t border-slate-800 space-y-3 flex-1">
            <h3 className="text-sm font-semibold text-amber-400">⚙️ নোড সেটিংস ({selectedNode.title})</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">মেসেজ কন্টেন্ট / টেক্সট:</label>
              <textarea 
                value={selectedNode.content}
                onChange={(e) => updateNodeContent(e.target.value)}
                className="w-full h-28 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-slate-900 p-8 overflow-auto flex items-center justify-center relative">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div 
                onClick={() => setSelectedNode(node)}
                className={`w-full max-w-md p-4 rounded-xl border-2 transition cursor-pointer shadow-lg relative ${
                  selectedNode?.id === node.id 
                    ? 'border-amber-500 bg-slate-800' 
                    : 'border-slate-700 bg-slate-950 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {node.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">Node #{index + 1}</span>
                </div>
                <h4 className="font-semibold text-slate-200 text-sm mb-1">{node.title}</h4>
                <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {node.content}
                </p>
              </div>

              {index < nodes.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-amber-500/50"></div>
                  <span className="text-amber-500 text-xs">▼</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
