import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('flows');
  const [mobileSubTab, setMobileSubTab] = useState('canvas'); // 'canvas' or 'simulator'
  const [userProfile, setUserProfile] = useState({ name: 'User', email: '', picture: '' });
  
  // Flow Builder Nodes
  const [nodes, setNodes] = useState([
    { id: '1', type: 'trigger', title: 'কাস্টমার মেসেজ (Trigger)', content: 'দাম কত' },
    { id: '2', type: 'message', title: 'অটো রিপ্লাই (Text Message)', content: 'ধন্যবাদ! আমাদের প্রডাক্টের মূল্য ১,৫০০ টাকা।' }
  ]);
  const [selectedNode, setSelectedNode] = useState(nodes[1]);

  // Chat Simulator State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '👋 হ্যালো! টেস্ট করতে নিচে "দাম কত" লিখে পাঠান।' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        localStorage.setItem('google_access_token', accessToken);
        fetchGoogleUserInfo(accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      const token = localStorage.getItem('google_access_token');
      if (token) {
        if (token === 'demo_token') {
          setUserProfile({ name: 'ডেমো ইউজার', email: 'demo@flowbot.com', picture: '' });
          setIsLoggedIn(true);
        } else {
          fetchGoogleUserInfo(token);
        }
      }
    }
  }, []);

  const fetchGoogleUserInfo = async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUserProfile({
        name: data.name || 'গুগল ইউজার',
        email: data.email || '',
        picture: data.picture || ''
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Failed to fetch user info', err);
      setIsLoggedIn(true);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('google_access_token', 'demo_token');
    setUserProfile({ name: 'ডেমো ইউজার', email: 'demo@flowbot.com', picture: '' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    setIsLoggedIn(false);
  };

  const addNode = (type) => {
    const newNode = {
      id: Date.now().toString(),
      type: type,
      title: type === 'message' ? 'নতুন মেসেজ নোড' : 'শর্ত (If/Else)',
      content: type === 'message' ? 'এখানে আপনার রিপ্লাই লিখুন...' : 'কন্ডিশন সেট করুন...'
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newChat = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newChat);
    setInputMessage('');

    setTimeout(() => {
      const triggerNode = nodes.find(n => n.type === 'trigger');
      if (triggerNode && userText.toLowerCase().includes(triggerNode.content.toLowerCase())) {
        const replyNode = nodes.find(n => n.type === 'message');
        if (replyNode) {
          setChatMessages(prev => [...prev, { sender: 'bot', text: replyNode.content }]);
        }
      } else {
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: '🤖 দুঃখিত, এই কিওয়ার্ডের জন্য কোনো অটো-রিপ্লাই সেট করা নেই।' 
        }]);
      }
    }, 600);
  };

  if (!isLoggedIn) {
    return <LoginScreen onGoogleLogin={() => {}} onDemoLogin={handleDemoLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">⚡</div>
          <span className="font-bold text-lg text-slate-900">FlowBot</span>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 ড্যাশবোর্ড
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'flows' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ ফ্লো বিল্ডার
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💬 ইনবক্স
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          {userProfile.picture ? (
            <img src={userProfile.picture} alt="Profile" className="w-8 h-8 rounded-full border border-blue-200 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              {userProfile.name.charAt(0)}
            </div>
          )}
          <span className="hidden md:inline text-xs font-bold text-slate-700">{userProfile.name}</span>
          <button onClick={handleLogout} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-medium transition">
            লগআউট
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {activeTab === 'flows' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile Sub-Tab Switcher */}
            <div className="md:hidden flex bg-white border-b border-slate-200 p-2 gap-2 shrink-0">
              <button
                onClick={() => setMobileSubTab('canvas')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  mobileSubTab === 'canvas' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                🛠️ ফ্লো এডিটর
              </button>
              <button
                onClick={() => setMobileSubTab('simulator')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  mobileSubTab === 'simulator' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                🟢 চ্যাট সিমুলেটর
              </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Canvas Controls & Builder */}
              <div className={`flex-1 flex flex-col md:flex-row overflow-hidden ${mobileSubTab === 'simulator' ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Node Options Sidebar */}
                <div className="w-full md:w-72 bg-white border-r border-slate-200 p-4 space-y-4 shrink-0 overflow-y-auto">
                  <button 
                    onClick={() => addNode('message')} 
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left flex items-center gap-2 text-blue-700 transition"
                  >
                    <span>💬</span>
                    <span className="text-xs font-bold">+ নতুন মেসেজ যোগ করুন</span>
                  </button>

                  {selectedNode && (
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <h3 className="text-xs font-bold text-blue-600 uppercase">⚙️ সম্পাদনা: {selectedNode.title}</h3>
                      <textarea 
                        value={selectedNode.content}
                        onChange={(e) => {
                          const updated = nodes.map(n => n.id === selectedNode.id ? { ...n, content: e.target.value } : n);
                          setNodes(updated);
                          setSelectedNode({ ...selectedNode, content: e.target.value });
                        }}
                        className="w-full h-28 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-100/60">
                  <div className="w-full max-w-md flex flex-col gap-4">
                    {nodes.map((node) => (
                      <div 
                        key={node.id} 
                        onClick={() => setSelectedNode(node)} 
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer shadow-sm ${
                          selectedNode?.id === node.id ? 'border-blue-600 bg-white ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                          {node.type}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-xs my-2">{node.title}</h4>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {node.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Chat Simulator */}
              <div className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 ${mobileSubTab === 'canvas' ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">🟢 লাইভ সিমুলেটর</span>
                  <button 
                    onClick={() => setChatMessages([{ sender: 'bot', text: '👋 হ্যালো! টেস্ট করতে মেসেজ পাঠান।' }])}
                    className="text-[10px] text-slate-500 underline hover:text-slate-800"
                  >
                    রিসেট
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col bg-slate-50/50">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white font-medium self-end rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 self-start rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder='মেসেজ লিখুন ("দাম কত")...'
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition">
                    পাঠান
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="p-6 space-y-4 overflow-auto w-full">
            <h1 className="text-xl font-bold text-slate-900">ড্যাশবোর্ড ওভারভিউ</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-500">মোট সাবস্ক্রাইবার</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">১,২৪৮ জন</h3>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-500">অটোমেশন রান হয়েছে</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">৮,৬২০ বার</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inbox' && (
          <div className="p-6 flex flex-col h-full w-full items-center justify-center text-slate-500">
            <p className="text-sm">লাইভ ইনবক্স ফিচার খুব শীঘ্রই আসছে...</p>
          </div>
        )}
      </div>
    </div>
  );
}
