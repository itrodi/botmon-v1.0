import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Onboarding2 = () => {
  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    twitter: false,
    instagram: false,
    whatsapp: false
  });
  
  const [loading, setLoading] = useState({
    facebook: false,
    twitter: false,
    instagram: false,
    whatsapp: false
  });

  const [userToken, setUserToken] = useState(null);

  // Get user token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    setUserToken(token);

    // Check existing linked accounts
    checkLinkedAccounts();
  }, []);

  // Check which accounts are already linked
  const checkLinkedAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Check localStorage for now - you might want to add a backend endpoint to check linked accounts
      const linked = JSON.parse(localStorage.getItem('linkedAccounts') || '{}');
      setLinkedAccounts(linked);
      
      // TODO: Add backend endpoint to fetch actual linked account status
      // const response = await fetch('https://api.automation365.io/linked-accounts', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setLinkedAccounts(data.linkedAccounts);
    } catch (error) {
      console.error('Error checking linked accounts:', error);
    }
  };

  // Add periodic check for linked accounts (useful after OAuth redirects)
  useEffect(() => {
    const interval = setInterval(() => {
      checkLinkedAccounts();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle manual refresh
  const handleRefreshStatus = () => {
    checkLinkedAccounts();
    toast.success('Status refreshed');
  };

  // Facebook/Messenger Login Handler
  const loginWithFacebook = () => {
    setLoading(prev => ({ ...prev, facebook: true }));
    
    // Get user token for embedding in state
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, facebook: false }));
      return;
    }
    
    // Encode token and platform in state parameter
    const stateData = {
      platform: 'messenger',
      token: token
    };
    const encodedState = btoa(JSON.stringify(stateData)); // Base64 encode the state
    
    // Facebook OAuth URL for Messenger permissions - redirect to backend with encoded state
    const facebookAuthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    facebookAuthUrl.searchParams.set('client_id', '639118129084539');
    facebookAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/messenger');
    facebookAuthUrl.searchParams.set('response_type', 'code');
    facebookAuthUrl.searchParams.set('scope', 'pages_manage_metadata,pages_messaging,business_management');
    facebookAuthUrl.searchParams.set('state', encodedState); // Encoded user token + platform
    
    // Redirect to Facebook OAuth
    window.location.href = facebookAuthUrl.toString();
  };

  // Twitter Login Handler
  const loginWithTwitter = () => {
    setLoading(prev => ({ ...prev, twitter: true }));
    
    // Twitter OAuth 2.0 (if you have Twitter API v2 setup)
    toast.error('Twitter integration requires additional setup. Please contact support.');
    
    // For Twitter, you'll need to implement OAuth 1.0a or OAuth 2.0
    // Here's a placeholder for OAuth 2.0:
    /*
    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.set('response_type', 'code');
    twitterAuthUrl.searchParams.set('client_id', 'YOUR_TWITTER_CLIENT_ID');
    twitterAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/twitter');
    twitterAuthUrl.searchParams.set('scope', 'tweet.read tweet.write users.read');
    twitterAuthUrl.searchParams.set('state', 'twitter');
    twitterAuthUrl.searchParams.set('code_challenge', 'challenge');
    twitterAuthUrl.searchParams.set('code_challenge_method', 'plain');
    
    window.location.href = twitterAuthUrl.toString();
    */
    
    setTimeout(() => {
      setLoading(prev => ({ ...prev, twitter: false }));
    }, 1000);
  };

  // Instagram Login Handler
  const loginWithInstagram = () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    
    // Get user token for embedding in state
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, instagram: false }));
      return;
    }
    
    // Encode token and platform in state parameter
    const stateData = {
      platform: 'instagram',
      token: token
    };
    const encodedState = btoa(JSON.stringify(stateData)); // Base64 encode the state
    
    // Instagram OAuth URL - redirect to backend with encoded state
    const instagramAuthUrl = new URL('https://www.instagram.com/oauth/authorize');
    instagramAuthUrl.searchParams.set('force_reauth', 'true');
    instagramAuthUrl.searchParams.set('client_id', '9440795702651023');
    instagramAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/instagram');
    instagramAuthUrl.searchParams.set('response_type', 'code');
    instagramAuthUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights');
    instagramAuthUrl.searchParams.set('state', encodedState);
    
    // Redirect to Instagram OAuth
    window.location.href = instagramAuthUrl.toString();
  };

  // WhatsApp Business Login Handler
  const loginWithWhatsApp = () => {
    setLoading(prev => ({ ...prev, whatsapp: true }));
    
    // Get user token for embedding in state
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, whatsapp: false }));
      return;
    }
    
    // Encode token and platform in state parameter
    const stateData = {
      platform: 'whatsapp',
      token: token
    };
    const encodedState = btoa(JSON.stringify(stateData)); // Base64 encode the state
    
    // WhatsApp Business API OAuth URL - redirect to backend with encoded state
    const whatsappAuthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    whatsappAuthUrl.searchParams.set('client_id', '639118129084539');
    whatsappAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/whatsapp');
    whatsappAuthUrl.searchParams.set('response_type', 'code');
    whatsappAuthUrl.searchParams.set('scope', 'whatsapp_business_messaging,whatsapp_business_management,business_management');
    whatsappAuthUrl.searchParams.set('state', encodedState);
    
    // Redirect to Facebook OAuth for WhatsApp
    window.location.href = whatsappAuthUrl.toString();
  };

  const handleContinue = () => {
    const linkedPlatforms = Object.entries(linkedAccounts)
      .filter(([_, isLinked]) => isLinked)
      .map(([platform]) => platform);
    
    if (linkedPlatforms.length === 0) {
      toast.error('Please link at least one social media account to continue');
      return;
    }
    
    console.log('Linked platforms:', linkedPlatforms);
    toast.success('Setup complete! Redirecting to dashboard...');
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  // Platform configurations
  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Link Facebook/Messenger',
      description: 'Connect your Facebook Page for Messenger integration',
      icon: '📘',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      onClick: loginWithFacebook,
      available: true
    },
    {
      id: 'instagram',
      name: 'Link Instagram Business',
      description: 'Connect your Instagram Business account',
      icon: '📷',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      onClick: loginWithInstagram,
      available: true
    },
    {
      id: 'whatsapp',
      name: 'Link WhatsApp Business',
      description: 'Connect your WhatsApp Business API',
      icon: '💬',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      onClick: loginWithWhatsApp,
      available: true
    },
    {
      id: 'twitter',
      name: 'Link Twitter/X Account',
      description: 'Twitter integration (Coming soon)',
      icon: '🐦',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: loginWithTwitter,
      available: false
    }
  ];

  // Check if user is authenticated
  if (!userToken) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please login to continue with account linking</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Section with gray background */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="font-bold text-xl">BOTMON</div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🤖💬</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Link Your Accounts</h1>
              <p className="text-gray-600">
                Connect your social media platforms to start automating customer interactions and manage bookings seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with white background */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        {/* Mobile Logo + Language Selector */}
        <div className="p-6 flex justify-between items-center md:justify-end">
          <div className="font-bold text-xl md:hidden">BOTMON</div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
            <Globe className="w-5 h-5" />
            <span>English</span>
          </div>
        </div>

        {/* Mobile Only Title */}
        <div className="md:hidden p-6 space-y-2">
          <h1 className="text-2xl font-bold">Link Your Accounts</h1>
          <p className="text-gray-600">
            Connect your social media platforms to start automating customer interactions.
          </p>
        </div>

        {/* Social Media Links Section */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {socialPlatforms.map((platform) => (
              <div
                key={platform.id}
                className={`p-4 border rounded-lg transition-all ${
                  linkedAccounts[platform.id]
                    ? 'border-green-500 bg-green-50'
                    : loading[platform.id]
                    ? 'border-gray-200 bg-gray-50'
                    : platform.available
                    ? 'border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
                onClick={
                  !linkedAccounts[platform.id] && 
                  !loading[platform.id] && 
                  platform.available 
                    ? platform.onClick 
                    : undefined
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center ${platform.bgColor} rounded-lg`}>
                      <span className="text-2xl">{platform.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {linkedAccounts[platform.id] 
                            ? platform.name.replace('Link', 'Linked') 
                            : platform.name}
                        </span>
                        {linkedAccounts[platform.id] && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        {!platform.available && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {loading[platform.id] ? (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    ) : linkedAccounts[platform.id] ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : platform.available ? (
                      <ArrowRight className="w-5 h-5 text-purple-600" />
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Status Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {Object.values(linkedAccounts).filter(Boolean).length} of {socialPlatforms.filter(p => p.available).length} available accounts linked
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshStatus}
                  className="text-xs"
                >
                  Refresh Status
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-600 font-medium">
                  {Object.values(linkedAccounts).filter(Boolean).length > 0 ? 'Ready to continue' : 'Select accounts to link'}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(linkedAccounts).filter(Boolean).length / socialPlatforms.filter(p => p.available).length) * 100}%`
                  }}
                />
              </div>
              
              {/* OAuth Flow Info */}
              <div className="mt-3 text-xs text-gray-500">
                <p>After clicking a platform, you'll be redirected to authorize the connection. Once complete, click "Refresh Status" to see the updated status.</p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button 
                onClick={handleContinue}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={Object.values(linkedAccounts).every(val => !val)}
              >
                {Object.values(linkedAccounts).some(val => val) 
                  ? 'Continue to Dashboard' 
                  : 'Link an account to continue'}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                You can link additional accounts later from your dashboard settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding2;