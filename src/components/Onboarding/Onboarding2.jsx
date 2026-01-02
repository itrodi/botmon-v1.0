import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Onboarding2 = () => {
  const navigate = useNavigate();
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
    whatsapp: false,
    initial: true,
    refresh: false
  });

  const [instagramProfile, setInstagramProfile] = useState({});
  const [userToken, setUserToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const fbInitialized = useRef(false);
  const callbackProcessed = useRef(false);
  const initialLoadDone = useRef(false);

  // Function to extract user ID from token
  const getUserIdFromToken = async (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload.user_id || payload.userId || payload.sub || null;
      }
      
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
    
    return btoa(token).substring(0, 16);
  };

  // Fetch Instagram status from backend API
  // Note: The API only returns {id, dp} - NOT username
  // Username is only available from OAuth callback URL parameters
  const fetchInstagramStatus = useCallback(async (token, userId, skipIfAlreadyLinked = false) => {
    if (!token || !userId) return false;
    
    // Get existing profile data to preserve username (API doesn't return it)
    const existingProfile = JSON.parse(localStorage.getItem(`instagram_profile_${userId}`) || '{}');
    const existingLinked = JSON.parse(localStorage.getItem(`linkedAccounts_${userId}`) || '{}');
    
    // If already linked and skipIfAlreadyLinked is true, don't overwrite
    if (skipIfAlreadyLinked && existingLinked.instagram === true) {
      console.log('Instagram already linked, skipping API overwrite');
      // Still update state from localStorage
      setInstagramProfile(existingProfile);
      setLinkedAccounts(prev => ({ ...prev, instagram: true }));
      return true;
    }
    
    try {
      const response = await fetch('https://api.automation365.io/instagram', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Instagram API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instagram API data:', data);
        
        // Check if Instagram is linked - API returns {id, dp} when linked
        if (data && data.id) {
          // IMPORTANT: Preserve existing username since API doesn't return it
          const profileData = {
            id: data.id,
            dp: data.dp || existingProfile.dp || null,
            username: data.username || existingProfile.username || null, // Preserve from callback
            profilePicture: data.dp || existingProfile.profilePicture || null,
            linkedAt: existingProfile.linkedAt || new Date().toISOString()
          };
          
          console.log('Updating Instagram profile:', profileData);
          
          setInstagramProfile(profileData);
          localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify(profileData));
          
          setLinkedAccounts(prev => {
            const updated = { ...prev, instagram: true };
            localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify(updated));
            return updated;
          });
          
          return true;
        }
      }
      
      // API returned no data or error - but DON'T clear existing linked status
      // The API might fail but user could still be linked (data in localStorage)
      console.log('Instagram API returned no linked account');
      return false;
      
    } catch (error) {
      console.error('Error fetching Instagram status:', error);
      return false;
    }
  }, []);

  // Handle Instagram OAuth callback from URL parameters
  // Note: Callback provides username and profile_picture
  // We need to fetch the id from API separately
  const handleInstagramCallback = useCallback(async (urlParams, userId, token) => {
    if (callbackProcessed.current) return false;
    
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    const status = urlParams.get('status');
    
    console.log('Processing Instagram callback:', { success, username, profilePicture, status });
    
    // Clear URL parameters immediately for security
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Mark as processed
    callbackProcessed.current = true;
    
    // Handle both "true"/"True" (Python sends capitalized True)
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess) {
      // Decode URL-encoded values
      const decodedUsername = username ? decodeURIComponent(username) : null;
      const decodedPic = profilePicture ? decodeURIComponent(profilePicture) : null;
      
      // Store Instagram profile info from callback
      const profileData = {
        username: decodedUsername,
        profilePicture: decodedPic,
        dp: decodedPic,
        linkedAt: new Date().toISOString()
      };
      
      console.log('Instagram linked successfully, profile:', profileData);
      
      // Update state immediately for UI feedback
      setInstagramProfile(profileData);
      localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify(profileData));
      
      // Update linked accounts state
      setLinkedAccounts(prev => {
        const updated = { ...prev, instagram: true };
        localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify(updated));
        return updated;
      });
      
      toast.success(`Successfully linked Instagram${decodedUsername ? ` (@${decodedUsername})` : ''}!`);
      setLoading(prev => ({ ...prev, instagram: false }));
      
      // Now fetch from API to get the Instagram ID (callback doesn't include it)
      // Small delay to let backend process
      setTimeout(async () => {
        try {
          const response = await fetch('https://api.automation365.io/instagram', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.id) {
              // Update profile with ID from API, but keep username from callback
              const updatedProfile = {
                ...profileData,
                id: data.id,
                dp: data.dp || profileData.dp
              };
              setInstagramProfile(updatedProfile);
              localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify(updatedProfile));
              console.log('Updated profile with ID from API:', updatedProfile);
            }
          }
        } catch (e) {
          console.log('Could not fetch Instagram ID from API:', e);
          // Not critical - we still have username and dp from callback
        }
      }, 1500);
      
      return true;
      
    } else if (isFailure) {
      const errorMessage = status ? decodeURIComponent(status.replace(/\+/g, ' ')) : 'Failed to link Instagram. Please try again.';
      toast.error(errorMessage);
      setLoading(prev => ({ ...prev, instagram: false }));
      return false;
    }
    
    return false;
  }, []);

  // Initialize Facebook SDK for WhatsApp
  useEffect(() => {
    if (!fbInitialized.current) {
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.appendChild(fbRoot);
      }

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: '639118129084539',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v23.0'
        });
        fbInitialized.current = true;
      };

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
          const userId = currentUserId || localStorage.getItem('userId');
          
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log("WhatsApp signup completed:", { phone_number_id, waba_id });
            
            setLinkedAccounts(prev => {
              const updated = { ...prev, whatsapp: true };
              if (userId) {
                localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify(updated));
                localStorage.setItem(`whatsapp_config_${userId}`, JSON.stringify({ phone_number_id, waba_id }));
              }
              return updated;
            });
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.success('Successfully linked WhatsApp Business account');
            
          } else if (data.event === 'CANCEL') {
            console.warn("WhatsApp signup cancelled");
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
        // Non-JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUserId]);

  // Main initialization effect
  useEffect(() => {
    const initializeUser = async () => {
      if (initialLoadDone.current) return;
      initialLoadDone.current = true;
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      
      setUserToken(token);
      
      // Get user ID from token
      const userId = await getUserIdFromToken(token);
      setCurrentUserId(userId);
      localStorage.setItem('userId', userId);
      
      // Load cached data from localStorage FIRST (immediate UI update)
      const cachedLinkedAccounts = JSON.parse(
        localStorage.getItem(`linkedAccounts_${userId}`) || '{}'
      );
      const cachedProfile = JSON.parse(
        localStorage.getItem(`instagram_profile_${userId}`) || '{}'
      );
      
      console.log('Loaded from localStorage:', { cachedLinkedAccounts, cachedProfile });
      
      // Set initial state from cache
      setLinkedAccounts(prev => ({ ...prev, ...cachedLinkedAccounts }));
      setInstagramProfile(cachedProfile);
      
      // Check for OAuth callback parameters BEFORE API call
      const urlParams = new URLSearchParams(window.location.search);
      let callbackHandled = false;
      
      if (urlParams.has('success')) {
        callbackHandled = await handleInstagramCallback(urlParams, userId, token);
      }
      
      // Only fetch from API if callback wasn't successful
      // This prevents API from overwriting successful callback data
      if (!callbackHandled && !cachedLinkedAccounts.instagram) {
        await fetchInstagramStatus(token, userId, false);
      } else if (cachedLinkedAccounts.instagram) {
        // If already linked in cache, verify with API but don't overwrite if API fails
        await fetchInstagramStatus(token, userId, true);
      }
      
      setLoading(prev => ({ ...prev, initial: false }));
    };
    
    initializeUser();
  }, [navigate, handleInstagramCallback, fetchInstagramStatus]);

  // Manual refresh handler
  const handleRefreshStatus = async () => {
    const token = localStorage.getItem('token');
    const userId = currentUserId || localStorage.getItem('userId');
    
    if (!token || !userId) {
      toast.error('Please login first');
      return;
    }
    
    setLoading(prev => ({ ...prev, refresh: true }));
    
    try {
      const isLinked = await fetchInstagramStatus(token, userId, false);
      
      if (isLinked) {
        toast.success('Instagram is linked!');
      } else {
        // Check localStorage in case API failed but we have cached data
        const cached = JSON.parse(localStorage.getItem(`linkedAccounts_${userId}`) || '{}');
        if (cached.instagram) {
          toast.success('Instagram linked (from cache)');
        } else {
          toast.info('No Instagram account linked');
        }
      }
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
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
    
    const stateData = {
      platform: 'messenger',
      token: token,
      userId: currentUserId
    };
    const encodedState = btoa(JSON.stringify(stateData));
    
    const facebookAuthUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    facebookAuthUrl.searchParams.set('client_id', '639118129084539');
    facebookAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/messenger');
    facebookAuthUrl.searchParams.set('response_type', 'code');
    facebookAuthUrl.searchParams.set('scope', 'pages_manage_metadata,pages_messaging,business_management');
    facebookAuthUrl.searchParams.set('state', encodedState);
    
    window.location.href = facebookAuthUrl.toString();
  };

  // Twitter Login Handler
  const loginWithTwitter = () => {
    setLoading(prev => ({ ...prev, twitter: true }));
    toast.error('Twitter integration coming soon!');
    setTimeout(() => {
      setLoading(prev => ({ ...prev, twitter: false }));
    }, 1000);
  };

  // Instagram Login Handler
  const loginWithInstagram = () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    callbackProcessed.current = false; // Reset for new OAuth flow
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, instagram: false }));
      return;
    }
    
    const stateData = {
      platform: 'instagram',
      token: token,
      userId: currentUserId
    };
    const encodedState = btoa(JSON.stringify(stateData));
    
    const instagramAuthUrl = new URL('https://www.instagram.com/oauth/authorize');
    instagramAuthUrl.searchParams.set('force_reauth', 'true');
    instagramAuthUrl.searchParams.set('client_id', '9440795702651023');
    instagramAuthUrl.searchParams.set('redirect_uri', 'https://api.automation365.io/auth/instagram');
    instagramAuthUrl.searchParams.set('response_type', 'code');
    instagramAuthUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights');
    instagramAuthUrl.searchParams.set('state', encodedState);
    
    window.location.href = instagramAuthUrl.toString();
  };

  // Unlink Instagram Handler
  const unlinkInstagram = async () => {
    const token = localStorage.getItem('token');
    const userId = currentUserId || localStorage.getItem('userId');
    const instaId = instagramProfile.id;
    
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    // If we don't have instaId from profile, try to get it from API
    let idToUnlink = instaId;
    if (!idToUnlink) {
      try {
        const response = await fetch('https://api.automation365.io/instagram', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          idToUnlink = data.id;
        }
      } catch (e) {
        console.error('Error getting Instagram ID:', e);
      }
    }
    
    if (!idToUnlink) {
      toast.error('Unable to find Instagram account to unlink');
      return;
    }
    
    if (!window.confirm('Are you sure you want to unlink your Instagram account?')) {
      return;
    }
    
    setLoading(prev => ({ ...prev, instagram: true }));
    
    try {
      const response = await fetch('https://api.automation365.io/unlink-instagram', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ insta_id: idToUnlink })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Clear Instagram data
        setLinkedAccounts(prev => {
          const updated = { ...prev, instagram: false };
          localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify(updated));
          return updated;
        });
        setInstagramProfile({});
        localStorage.removeItem(`instagram_profile_${userId}`);
        
        toast.success('Instagram account unlinked successfully');
      } else {
        toast.error(data.message || 'Failed to unlink Instagram');
      }
    } catch (error) {
      console.error('Error unlinking Instagram:', error);
      toast.error('Failed to unlink Instagram. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // WhatsApp Business Login Handler
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

    const fbLoginCallback = async (response) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('WhatsApp Embedded Signup code received');
        
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
    
    setTimeout(() => {
      navigate('/Overview');
    }, 1000);
  };

  // Get display picture for Instagram
  const getInstagramDisplayPic = () => {
    return instagramProfile.profilePicture || instagramProfile.dp || null;
  };

  // Get Instagram username
  const getInstagramUsername = () => {
    return instagramProfile.username || null;
  };

  // Check if Instagram is actually linked
  const isInstagramLinked = linkedAccounts.instagram === true;

  // Platform configurations
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
      name: isInstagramLinked 
        ? (getInstagramUsername() ? `Linked: @${getInstagramUsername()}` : 'Instagram Linked')
        : 'Link Instagram Business',
      description: isInstagramLinked 
        ? 'Instagram Business account connected' 
        : 'Connect your Instagram Business account',
      icon: isInstagramLinked && getInstagramDisplayPic()
        ? getInstagramDisplayPic()
        : '/Images/instagram.png',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      onClick: isInstagramLinked ? null : loginWithInstagram,
      onUnlink: isInstagramLinked ? unlinkInstagram : null,
      available: true,
      isProfilePic: isInstagramLinked && getInstagramDisplayPic(),
      username: getInstagramUsername()
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

  // Auth check
  if (!userToken && !loading.initial) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please login to continue with account linking</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Initial loading
  if (loading.initial) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  const linkedCount = Object.values(linkedAccounts).filter(Boolean).length;
  const availableCount = socialPlatforms.filter(p => p.available).length;

  return (
    <div className="h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        <div className="p-6">
          <div className="font-bold text-xl">
            <img src="/Images/botmon-logo.png" alt="Logo" />
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-20">
              <img 
                src="/Images/onboarding.png"
                alt="Business Setup"
                className="w-full max-w-md"
              />
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

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div className="p-6 flex justify-between items-center md:justify-end">
          <div className="font-bold text-xl md:hidden">BOTMON</div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
            <Globe className="w-5 h-5" />
            <span>English</span>
          </div>
        </div>

        <div className="md:hidden p-6 space-y-2">
          <h1 className="text-2xl font-bold">Link Your Accounts</h1>
          <p className="text-gray-600">
            Connect your social media platforms to start automating customer interactions.
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-4">
            {socialPlatforms.map((platform) => {
              const isPlatformLinked = linkedAccounts[platform.id] === true;
              const isPlatformLoading = loading[platform.id];
              
              return (
                <div
                  key={platform.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isPlatformLinked
                      ? 'border-green-500 bg-green-50'
                      : isPlatformLoading
                      ? 'border-gray-200 bg-gray-50'
                      : platform.available
                      ? 'border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  onClick={
                    !isPlatformLinked && 
                    !isPlatformLoading && 
                    platform.available &&
                    platform.onClick
                      ? platform.onClick 
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center ${platform.isProfilePic ? '' : platform.bgColor} rounded-lg overflow-hidden`}>
                        <img 
                          src={platform.icon} 
                          alt={platform.name}
                          className={platform.isProfilePic ? 'w-full h-full object-cover rounded-lg' : 'w-6 h-6 object-contain'}
                          onError={(e) => {
                            console.log('Image load error, using fallback');
                            e.target.src = '/Images/instagram.png';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {platform.name}
                          </span>
                          {isPlatformLinked && (
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
                        {/* Show username for Instagram when linked */}
                        {platform.id === 'instagram' && isPlatformLinked && platform.username && (
                          <p className="text-xs text-purple-600 mt-1 font-medium">
                            @{platform.username}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isPlatformLoading ? (
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      ) : isPlatformLinked ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          {platform.onUnlink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                platform.onUnlink();
                              }}
                              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                            >
                              Unlink
                            </Button>
                          )}
                        </div>
                      ) : platform.available ? (
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Status Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {linkedCount} of {availableCount} available accounts linked
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshStatus}
                  disabled={loading.refresh}
                  className="text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading.refresh ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${linkedCount > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                  {linkedCount > 0 
                    ? '✓ Ready to continue' 
                    : 'Link at least one account to continue'}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(linkedCount / availableCount) * 100}%`
                  }}
                />
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>Click on a platform to authorize the connection. You'll be redirected back here after completing the process.</p>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-4">
              <Button 
                onClick={handleContinue}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                disabled={linkedCount === 0}
              >
                {linkedCount > 0 
                  ? 'Continue to Dashboard' 
                  : 'Link an account to continue'}
              </Button>
            </div>

            <div className="text-center pb-4">
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