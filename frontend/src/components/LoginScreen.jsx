import React, { useState } from 'react';
import { Mail, Globe, Check } from 'lucide-react';
import { useLang, setLang } from '../i18n';

const GOOGLE_CLIENT_ID = '1094215067057-qq6ut9ublmlh9ig3hrb25qfo9lh02j5a.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '1565616468665469';
const FACEBOOK_REDIRECT = 'https://super-space-xylophone-jjp767gj9x4j25767-5000.app.github.dev/api/auth/facebook/callback';

const dict = {
  en: {
    start: 'Get Started Free', welcome: 'Welcome back', sub: 'Let’s get you signed in',
    email: 'Email address', hint: 'We’ll email you a one-time link to sign in.', signin: 'Sign In',
    or: 'OR SIGN IN WITH', google: 'Sign In With Google', last: 'LAST USED',
    newto: 'New to Flowbot?', signup: 'Sign up', terms: 'Terms of Service', privacy: 'Privacy Policy',
  },
  bn: {
    start: 'বিনামূল্যে শুরু করুন', welcome: 'আবার স্বাগতম', sub: 'চলুন আপনাকে সাইন ইন করাই',
    email: 'ইমেইল ঠিকানা', hint: 'সাইন ইন করার জন্য আমরা আপনাকে একটি ওয়ান-টাইম লিংক ইমেইল করব।', signin: 'সাইন ইন',
    or: 'অথবা এর মাধ্যমে সাইন ইন করুন', google: 'Google দিয়ে সাইন ইন', last: 'সর্বশেষ ব্যবহৃত',
    newto: 'Flowbot-এ নতুন?', signup: 'সাইন আপ', terms: 'সেবার শর্তাবলী', privacy: 'গোপনীয়তা নীতি',
  },
};

export default function LoginScreen({ onDemoLogin }) {
  const [email, setEmail] = useState('');
  const [menu, setMenu] = useState(false);
  const { lang, t } = useLang(dict);

  const googleLogin = () => {
    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
      `&response_type=token&scope=${encodeURIComponent('email profile')}`;
  };

  const facebookLogin = () => {
    const scope = 'pages_show_list,pages_messaging,pages_manage_metadata,pages_read_engagement';
    window.location.href =
      `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT)}&scope=${scope}`;
  };

  const emailLogin = (e) => { e.preventDefault(); onDemoLogin(); };
  const pick = (l) => { setLang(l); setMenu(false); };
  const social = 'flex-1 h-12 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 relative z-20">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">Flowbot</span>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setMenu(!menu)} className="p-1.5 rounded-lg hover:bg-slate-200" aria-label="Language">
              <Globe size={22} className="text-slate-600" />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0" onClick={() => setMenu(false)} />
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {[['bn', 'বাংলা'], ['en', 'English']].map(([code, label]) => (
                    <button key={code} onClick={() => pick(code)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50">
                      {label} {lang === code && <Check size={16} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm font-medium">{t('start')}</button>
        </div>
      </header>

      <section className="bg-slate-50 px-5 pt-6 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">{t('welcome')}</h1>
        <p className="text-slate-500 mt-3 text-lg">{t('sub')}</p>
      </section>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-12">
        <form onSubmit={emailLogin} className="space-y-3">
          <label className="block text-sm text-slate-800">{t('email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="mrsmith@gmail.com"
            className="w-full h-12 border border-slate-200 rounded-lg px-3 outline-none focus:border-blue-600" />
          <p className="text-sm text-slate-500">{t('hint')}</p>
          <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
            <Mail size={18} /> {t('signin')}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6 text-xs text-slate-500">
          <div className="flex-1 h-px bg-slate-200" /> <span className="text-center">{t('or')}</span> <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="relative">
          <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">{t('last')}</span>
          <button onClick={googleLogin}
            className="w-full h-12 border border-slate-200 rounded-lg flex items-center justify-center gap-3 font-medium hover:bg-slate-50">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z"/>
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.6 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
            </svg>
            {t('google')}
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={facebookLogin} className={social} title="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>
          </button>
          <button className={social} title="Telegram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#229ED9"><path d="M9.8 15.2 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.1-.4-1.6-1.1-1.3L3.7 10.2c-1.1.4-1.1 1.1-.2 1.4l4.1 1.3 9.5-6c.4-.3.8-.1.5.2z"/></svg>
          </button>
          <button className={social} title="Apple">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M16.4 12.7c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.2-.9C6.3 7 4.8 8 4 9.4c-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.8 2.4 3 2.3 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8 2.1-1.1 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.3-.9-2.3-3.5zM14 5.3c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"/></svg>
          </button>
        </div>

        <p className="text-center text-slate-500 mt-6">
          {t('newto')} <button className="text-blue-600 font-medium text-lg">{t('signup')}</button>
        </p>
      </main>

      <footer className="text-center py-8 text-blue-600 space-x-6">
        <a href="#">{t('terms')}</a>
        <a href="#">{t('privacy')}</a>
      </footer>
    </div>
  );
}
