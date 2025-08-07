import React, { useState, useEffect, useRef } from 'react';
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
  const fbInitialized = useRef(false);

  // Initialize Facebook SDK
  useEffect(() => {
    if (!fbInitialized.current) {
      // Create fb-root div if it doesn't exist
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.appendChild(fbRoot);
      }

      // Load Facebook SDK
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '639118129084539',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v23.0'
        });
        fbInitialized.current = true;
      };

      // Load SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    // Listen for WhatsApp Embedded Signup messages
    const handleMessage = (event) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log("WhatsApp signup completed:", { phone_number_id, waba_id });
            
            // Mark WhatsApp as linked and save to localStorage
            setLinkedAccounts(prev => {
              const updated = { ...prev, whatsapp: true };
              localStorage.setItem('linkedAccounts', JSON.stringify(updated));
              return updated;
            });
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.success('Successfully linked WhatsApp Business account');
            
            // Optionally save the phone_number_id and waba_id
            localStorage.setItem('whatsapp_config', JSON.stringify({ phone_number_id, waba_id }));
            
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data;
            console.warn("WhatsApp signup cancelled at step:", current_step);
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.error('WhatsApp signup was cancelled');
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error("WhatsApp signup error:", error_message);
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.error(`WhatsApp signup error: ${error_message}`);
          }
        }
      } catch (e) {
        console.log('Non-JSON response from Facebook:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Helper function to get Instagram profile info
  const getInstagramProfileInfo = () => {
    try {
      const profileData = JSON.parse(localStorage.getItem('instagram_profile') || '{}');
      return profileData;
    } catch {
      return {};
    }
  };

  // Separate function to handle Instagram OAuth callback
  const handleInstagramCallback = (urlParams) => {
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    
    // Case-insensitive check for success (handles both 'true' and 'True')
    if (success && success.toLowerCase() === 'true') {
      setLinkedAccounts(prev => {
        const updated = { ...prev, instagram: true };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        
        // Store Instagram profile info
        if (username || profilePicture) {
          const profileData = {
            username,
            profilePicture: profilePicture ? decodeURIComponent(profilePicture) : null,
            linkedAt: new Date().toISOString()
          };
          localStorage.setItem('instagram_profile', JSON.stringify(profileData));
        }
        
        return updated;
      });
      
      toast.success(`Successfully linked Instagram${username ? ` (@${username})` : ''}`);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Stop loading state
      setLoading(prev => ({ ...prev, instagram: false }));
    } else if (success && success.toLowerCase() === 'false') {
      toast.error('Failed to link Instagram. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // Get user token on component mount and handle OAuth callbacks
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    setUserToken(token);

    // Load previously linked accounts from localStorage
    const savedLinkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '{}');
    setLinkedAccounts(savedLinkedAccounts);

    // Check for OAuth callback parameters (for Instagram)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      handleInstagramCallback(urlParams);
    }

    // Check existing linked accounts
    checkLinkedAccounts();
  }, []);

  // Check which accounts are already linked
  const checkLinkedAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // First, check localStorage for immediate update
      const linked = JSON.parse(localStorage.getItem('linkedAccounts') || '{}');
      setLinkedAccounts(linked);
      
      // Also check for any OAuth redirect parameters that might not have been processed
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      
      if (success && !linked.instagram) {
        // Process any pending Instagram OAuth callback
        handleInstagramCallback(urlParams);
      }
      
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

  // WhatsApp Business Login Handler with Embedded Signup
  const loginWithWhatsApp = () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }

    setLoading(prev => ({ ...prev, whatsapp: true }));
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, whatsapp: false }));
      return;
    }

    // Facebook login callback for Embedded Signup
    const fbLoginCallback = async (response) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('WhatsApp Embedded Signup code received:', code);
        
        // Send code to backend - note that the Flask backend expects Authorization header
        try {
          const backendResponse = await fetch('https://api.automation365.io/auth/whatsapp?code=' + code, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (backendResponse.ok) {
            const data = await backendResponse.json();
            console.log('WhatsApp backend response:', data);
            
            // The Embedded Signup flow will continue and send messages via postMessage
            // The actual linking confirmation will come from the WA_EMBEDDED_SIGNUP messages
          } else {
            const error = await backendResponse.json();
            console.error('Backend error:', error);
            toast.error('Failed to process WhatsApp authorization');
            setLoading(prev => ({ ...prev, whatsapp: false }));
          }
        } catch (error) {
          console.error('Error calling backend:', error);
          toast.error('Failed to connect to server');
          setLoading(prev => ({ ...prev, whatsapp: false }));
        }
      } else {
        // User cancelled or error occurred
        setLoading(prev => ({ ...prev, whatsapp: false }));
        if (response.status === 'unknown') {
          toast.error('WhatsApp setup cancelled');
        }
      }
    };

    // Launch WhatsApp Embedded Signup
    window.FB.login(fbLoginCallback, {
      config_id: '4214295362161201', // Configuration ID for WhatsApp Embedded Signup
      response_type: 'code', // must be set to 'code' for System User access token
      override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      extras: { "version": "v3" }
    });
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

  // Platform configurations with dynamic Instagram info
  const instagramProfile = getInstagramProfileInfo();
  const socialPlatforms = [
    {
      id: 'facebook',
      name: linkedAccounts.facebook ? 'Linked Facebook/Messenger' : 'Link Facebook/Messenger',
      description: linkedAccounts.facebook 
        ? 'Facebook Page connected for Messenger' 
        : 'Connect your Facebook Page for Messenger integration',
      icon: '📘',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      onClick: loginWithFacebook,
      available: true
    },
    {
      id: 'instagram',
      name: linkedAccounts.instagram 
        ? `Linked: @${instagramProfile.username || 'Instagram Business'}` 
        : 'Link Instagram Business',
      description: linkedAccounts.instagram 
        ? 'Instagram Business account connected' 
        : 'Connect your Instagram Business account',
      icon: '📷',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      onClick: loginWithInstagram,
      available: true
    },
    {
      id: 'whatsapp',
      name: linkedAccounts.whatsapp ? 'Linked WhatsApp Business' : 'Link WhatsApp Business',
      description: linkedAccounts.whatsapp 
        ? 'WhatsApp Business API connected' 
        : 'Connect your WhatsApp Business API',
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
                          {platform.name}
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
                <p>After clicking a platform, you'll be redirected to authorize the connection. Once complete, you'll be redirected back here automatically.</p>
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