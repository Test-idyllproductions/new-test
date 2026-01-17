import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('idyll_cookie_consent');
    if (!hasConsented) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('idyll_cookie_consent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('idyll_cookie_consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100000] p-4 animate-slide-in">
      <div className="max-w-4xl mx-auto bg-card backdrop-blur-md border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Cookie className="w-8 h-8 text-cyan-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-primary mb-2">
              We use cookies to enhance your experience
            </h3>
            <p className="text-sm text-secondary mb-4 leading-relaxed">
              We use essential cookies to store your preferences like theme settings, notification preferences, 
              and login state. These help us provide you with a personalized experience across sessions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAccept}
                className="flex items-center justify-center space-x-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all font-medium shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>Accept All</span>
              </button>
              
              <button
                onClick={handleDecline}
                className="flex items-center justify-center space-x-2 px-6 py-2 bg-transparent border border-border hover:bg-hover text-secondary hover:text-primary rounded-lg transition-all font-medium"
              >
                <span>Essential Only</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDecline}
            className="flex-shrink-0 p-2 text-muted hover:text-secondary rounded-lg hover:bg-hover transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;