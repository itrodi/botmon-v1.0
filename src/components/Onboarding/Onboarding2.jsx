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
  const [currentUserId, setCurrentUserId] = useState(null);
  const fbInitialized = useRef(false);

  // Helper function to get user-specific storage key
  const getUserStorageKey = (key) => {
    const userId = currentUserId || localStorage.getItem('userId');
    return userId ? `${key}_${userId}` : key;
  };

  // Helper function to get Instagram profile info
  const getInstagramProfileInfo = () => {
    try {
      const profileData = JSON.parse(localStorage.getItem(getUserStorageKey('instagram_profile')) || '{}');
      return profileData;
    } catch {
      return {};
    }
  };

  // Function to extract user ID from token
  const getUserIdFromToken = async (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload.user_id || payload.userId || payload.sub || null;
      }
      
      // Fallback: API call to get user profile
      const response = await fetch('https://api.automation365.io/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.userId || data.id || null;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    
    // Fallback: use token hash as user identifier
    return btoa(token).substring(0, 16);
  };

  // Handle Instagram OAuth callback
  const handleInstagramCallback = (urlParams) => {
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    
    // Case-insensitive check for success
    if (success && success.toLowerCase() === 'true') {
      setLinkedAccounts(prev => {
        const updated = { ...prev, instagram: true };
        localStorage.setItem(getUserStorageKey('linkedAccounts'), JSON.stringify(updated));
        
        // Store Instagram profile info
        if (username || profilePicture) {
          const profileData = {
            username,
            profilePicture: profilePicture ? decodeURIComponent(profilePicture) : null,
            linkedAt: new Date().toISOString()
          };
          localStorage.setItem(getUserStorageKey('instagram_profile'), JSON.stringify(profileData));
        }
        
        return updated;
      });
      
      toast.success(`Successfully linked Instagram${username ? ` (@${username})` : ''}`);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Stop loading state
      setLoading(prev => ({ ...prev, instagram: false }));
    } else if (success && success.toLowerCase() === 'false') {
      const status = urlParams.get('status');
      toast.error(status || 'Failed to link Instagram. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

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
              localStorage.setItem(getUserStorageKey('linkedAccounts'), JSON.stringify(updated));
              return updated;
            });
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.success('Successfully linked WhatsApp Business account');
            
            // Save the phone_number_id and waba_id
            localStorage.setItem(getUserStorageKey('whatsapp_config'), JSON.stringify({ phone_number_id, waba_id }));
            
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
  }, [currentUserId]);

  // Check which accounts are already linked using /instagram endpoint
  const checkLinkedAccounts = async () => {
    const token = localStorage.getItem('token');
    const userId = currentUserId || localStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      // First, check localStorage for immediate update
      const linked = JSON.parse(localStorage.getItem(`linkedAccounts_${userId}`) || '{}');
      setLinkedAccounts(prev => ({ ...prev, ...linked }));
      
      // Fetch actual Instagram status from backend using /instagram endpoint
      try {
        const response = await fetch('https://api.automation365.io/instagram', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            // Instagram is linked
            setLinkedAccounts(prev => {
              const updated = { ...prev, instagram: true };
              localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify(updated));
              return updated;
            });
            // Store profile info
            localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify({
              id: data.id,
              dp: data.dp,
              username: data.username || null
            }));
          }
        }
      } catch (error) {
        console.log('Error fetching Instagram status:', error);
      }
    } catch (error) {
      console.error('Error checking linked accounts:', error);
    }
  };

  // Get user token and initialize user-specific data
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        window.location.href = '/login';
        return;
      }
      
      setUserToken(token);
      
      // Get user ID from token
      const userId = await getUserIdFromToken(token);
      setCurrentUserId(userId);
      localStorage.setItem('userId', userId);
      
      // Load user-specific linked accounts from localStorage first
      const userLinkedAccounts = JSON.parse(
        localStorage.getItem(`linkedAccounts_${userId}`) || '{}'
      );
      setLinkedAccounts(prev => ({ ...prev, ...userLinkedAccounts }));
      
      // Check for OAuth callback parameters (for Instagram)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('success')) {
        handleInstagramCallback(urlParams);
      }
      
      // Check existing linked accounts from backend
      checkLinkedAccounts();
    };
    
    initializeUser();
  }, []);

  // Handle manual refresh
  const handleRefreshStatus = () => {
    checkLinkedAccounts();
    toast.success('Status refreshed');
  };

  // Facebook/Messenger Login Handler
  const loginWithFacebook = () => {
    setLoading(prev => ({ ...prev, facebook: true }));
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, facebook: false }));
      return;
    }
    
    // Encode token and platform in state parameter
    const stateData = {
      platform: 'messenger',
      token: token,
      userId: currentUserId
    };
    const encodedState = btoa(JSON.stringify(stateData));
    
    // Facebook OAuth URL for Messenger permissions
    const facebookAuthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    facebookAuthUrl.searchParams.set('client_id', '639118129084539');
    facebookAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/messenger');
    facebookAuthUrl.searchParams.set('response_type', 'code');
    facebookAuthUrl.searchParams.set('scope', 'pages_manage_metadata,pages_messaging,business_management');
    facebookAuthUrl.searchParams.set('state', encodedState);
    
    // Redirect to Facebook OAuth
    window.location.href = facebookAuthUrl.toString();
  };

  // Twitter Login Handler
  const loginWithTwitter = () => {
    setLoading(prev => ({ ...prev, twitter: true }));
    toast.error('Twitter integration requires additional setup. Please contact support.');
    setTimeout(() => {
      setLoading(prev => ({ ...prev, twitter: false }));
    }, 1000);
  };

  // Instagram Login Handler
  const loginWithInstagram = () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, instagram: false }));
      return;
    }
    
    // Encode token and platform in state parameter
    const stateData = {
      platform: 'instagram',
      token: token,
      userId: currentUserId
    };
    const encodedState = btoa(JSON.stringify(stateData));
    
    // Instagram OAuth URL
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
        
        // Send code to backend
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
        setLoading(prev => ({ ...prev, whatsapp: false }));
        if (response.status === 'unknown') {
          toast.error('WhatsApp setup cancelled');
        }
      }
    };

    // Launch WhatsApp Embedded Signup
    window.FB.login(fbLoginCallback, {
      config_id: '4214295362161201',
      response_type: 'code',
      override_default_response_type: true,
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
      window.location.href = '/Overview';
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
      icon: '/Images/facebook.png',
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
      icon: linkedAccounts.instagram && (instagramProfile.profilePicture || instagramProfile.dp)
        ? (instagramProfile.profilePicture || instagramProfile.dp)
        : '/Images/instagram.png',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      onClick: loginWithInstagram,
      available: true,
      isProfilePic: linkedAccounts.instagram && (instagramProfile.profilePicture || instagramProfile.dp)
    },
    {
      id: 'whatsapp',
      name: linkedAccounts.whatsapp ? 'Linked WhatsApp Business' : 'Link WhatsApp Business',
      description: linkedAccounts.whatsapp 
        ? 'WhatsApp Business API connected' 
        : 'Connect your WhatsApp Business API',
      icon: '/Images/whatsapp.png',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      onClick: loginWithWhatsApp,
      available: true
    },
    {
      id: 'twitter',
      name: 'Link Twitter/X Account',
      description: 'Twitter integration (Coming soon)',
      icon: '/Images/twitter.png',
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
          <div className="font-bold text-xl"><img src="/Images/botmon-logo.png" alt="Logo"  /></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-20">
              <span className="text-4xl"> <img 
              src="/Images/onboarding.png"
              alt="Business Setup"
              className="w-full max-w-md"
            /></span>
            </div>
            <div className="space-y-4 mt-10">
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
                    <div className={`w-12 h-12 flex items-center justify-center ${platform.isProfilePic ? '' : platform.bgColor} rounded-lg overflow-hidden`}>
                      {platform.icon.includes('.png') || platform.icon.includes('.jpg') || platform.icon.includes('.svg') || platform.icon.startsWith('/') || platform.icon.startsWith('http') ? (
                        <img 
                          src={platform.icon} 
                          alt={platform.name}
                          className={platform.isProfilePic ? 'w-full h-full object-cover' : 'w-6 h-6 object-contain'}
                        />
                      ) : (
                        <span className="text-2xl">{platform.icon}</span>
                      )}
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
                      {/* Display Instagram username when linked */}
                      {platform.id === 'instagram' && linkedAccounts.instagram && instagramProfile.username && (
                        <p className="text-xs text-purple-600 mt-1 font-medium">
                          Profile: @{instagramProfile.username}
                        </p>
                      )}
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