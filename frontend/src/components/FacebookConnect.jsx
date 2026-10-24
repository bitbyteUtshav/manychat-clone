import React from 'react';

const FacebookConnect = () => {
    const handleFacebookLogin = () => {
        const APP_ID = '1565616468665469';
        const REDIRECT_URI = encodeURIComponent('https://super-space-xylophone-jjp767gj9x4j25767-5000.app.github.dev/api/auth/facebook/callback');
        
        const scope = 'pages_show_list,pages_messaging,instagram_basic,pages_read_engagement';
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
        
        window.location.href = authUrl;
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Connect Your Meta Business</h2>
            <p className="text-gray-600 text-sm mb-6 text-center">
                Link your Facebook Pages, Instagram, and WhatsApp accounts to start automating messages.
            </p>
            <button
                onClick={handleFacebookLogin}
                className="flex items-center gap-2 bg border text-black bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition duration-200 shadow-sm"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
            </button>
        </div>
    );
};

export default FacebookConnect;
