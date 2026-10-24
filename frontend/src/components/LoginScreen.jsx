import React, { useState } from 'react';
import FacebookConnect from './FacebookConnect';

export default function LoginScreen({ onGoogleLogin, onDemoLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = () => {
    setIsLoading(true);
    
    // আপনার সঠিক Google OAuth Client ID
    const clientId = "1094215067057-qq6ut9ublmlh9ig3hrb25qfo9lh02j5a.apps.googleusercontent.com";
    const redirectUri = window.location.origin;
    const scope = "email profile";
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    
    setTimeout(() => {
      window.location.href = googleAuthUrl;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 text-amber-500 font-bold text-2xl mb-1">⚡</div>
          <h1 className="text-2xl font-bold text-slate-900">FlowBot-এ স্বাগতম</h1>
          <p className="text-xs text-slate-500">আপনার মেটা চ্যানেল ও চ্যাটবট অটোমেশন প্ল্যাটফর্ম</p>
        </div>

        <div className="space-y-3 pt-2">
          <FacebookConnect />

          <button
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition text-sm disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-slate-600">
                <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                গুগল সার্ভারে কানেক্ট হচ্ছে...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google দিয়ে সাইন ইন করুন
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">অথবা</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={onDemoLogin}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <span>🚀</span> সরাসরি ডেমো ড্যাশবোর্ডে প্রবেশ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
