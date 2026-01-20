import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Loader2,
  Check,
  RefreshCw,
  Unlink,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import Header from '../Header';
import Sidebar from '../Sidebar';
import { toast } from 'react-hot-toast';

const LinkAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
    email: false,
    sms: false
  });
  
  const [instagramProfile, setInstagramProfile] = useState({});
  const [facebookProfile, setFacebookProfile] = useState({});
  const [whatsappConfig, setWhatsappConfig] = useState({});
  
  const [loading, setLoading] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
    email: false,
    sms: false,
    initial: true,
    refresh: false
  });
  
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [accountToUnlink, setAccountToUnlink] = useState(null);
  const [unlinkingInProgress, setUnlinkingInProgress] = useState(false);
  
  const fbInitialized = useRef(false);
  const callbackProcessed = useRef(false);
  const initialLoadDone = useRef(false);

  // ============================================
  // API FUNCTIONS - Matching Onboarding2
  // ============================================

  // Fetch Instagram status from backend API
  const fetchInstagramStatus = useCallback(async (token) => {
    if (!token) return false;
    
    try {
      const response = await fetch('https://api.automation365.io/instagram', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Instagram API data:', data);
        
        // Check if Instagram is linked - API returns {id, dp} when linked
        if (data && data.id) {
          // Get existing profile to preserve username (API doesn't return it)
          const existingProfile = JSON.parse(localStorage.getItem('instagram_profile') || '{}');
          
          const profileData = {
            id: data.id,
            dp: data.dp || existingProfile.dp || null,
            username: data.username || existingProfile.username || null,
            profilePicture: data.dp || existingProfile.profilePicture || null
          };
          
          setInstagramProfile(profileData);
          localStorage.setItem('instagram_profile', JSON.stringify(profileData));
          
          setLinkedAccounts(prev => {
            const updated = { ...prev, instagram: true };
            localStorage.setItem('linkedAccounts', JSON.stringify(updated));
            return updated;
          });
          
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error fetching Instagram status:', error);
      return false;
    }
  }, []);

  // Fetch Facebook/Messenger status from backend API
  const fetchFacebookStatus = useCallback(async (token) => {
    if (!token) return false;
    
    try {
      const response = await fetch('https://api.automation365.io/messenger', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Facebook API data:', data);
        
        if (data && (data.page_id || data.id)) {
          const profileData = {
            id: data.page_id || data.id,
            name: data.page_name || data.name || null,
            accessToken: data.access_token || null
          };
          
          setFacebookProfile(profileData);
          localStorage.setItem('facebook_profile', JSON.stringify(profileData));
          
          setLinkedAccounts(prev => {
            const updated = { ...prev, facebook: true };
            localStorage.setItem('linkedAccounts', JSON.stringify(updated));
            return updated;
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching Facebook status:', error);
      return false;
    }
  }, []);

  // Fetch WhatsApp status
  const fetchWhatsAppStatus = useCallback(async (token) => {
    if (!token) return false;
    
    // Check localStorage for WhatsApp config
    const storedConfig = localStorage.getItem('whatsapp_config');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        if (config.phone_number_id || config.waba_id) {
          setWhatsappConfig(config);
          setLinkedAccounts(prev => {
            const updated = { ...prev, whatsapp: true };
            localStorage.setItem('linkedAccounts', JSON.stringify(updated));
            return updated;
          });
          return true;
        }
      } catch (e) {
        console.error('Error parsing WhatsApp config:', e);
      }
    }
    
    // Optionally fetch from API if you have a WhatsApp status endpoint
    try {
      const response = await fetch('https://api.automation365.io/whatsapp', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && (data.phone_number_id || data.waba_id)) {
          setWhatsappConfig(data);
          localStorage.setItem('whatsapp_config', JSON.stringify(data));
          
          setLinkedAccounts(prev => {
            const updated = { ...prev, whatsapp: true };
            localStorage.setItem('linkedAccounts', JSON.stringify(updated));
            return updated;
          });
          
          return true;
        }
      }
    } catch (error) {
      // API might not exist, that's okay
      console.log('WhatsApp API check:', error.message);
    }
    
    return false;
  }, []);

  // Handle Instagram OAuth callback from URL parameters
  const handleInstagramCallback = useCallback(async (urlParams, token) => {
    if (callbackProcessed.current) return false;
    
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    const status = urlParams.get('status');
    const platform = urlParams.get('platform');
    
    // Only process Instagram callbacks
    if (platform && platform !== 'instagram') return false;
    
    // Clear URL parameters immediately for security
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Mark as processed
    callbackProcessed.current = true;
    
    // Handle both "true" and "True" (Python sends capitalized)
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess) {
      const decodedUsername = username ? decodeURIComponent(username) : null;
      const decodedPic = profilePicture ? decodeURIComponent(profilePicture) : null;
      
      // Store Instagram profile info from callback
      const profileData = {
        username: decodedUsername,
        profilePicture: decodedPic,
        dp: decodedPic
      };
      
      setInstagramProfile(profileData);
      localStorage.setItem('instagram_profile', JSON.stringify(profileData));
      
      // Update linked accounts state
      setLinkedAccounts(prev => {
        const updated = { ...prev, instagram: true };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        return updated;
      });
      
      toast.success(`Successfully linked Instagram${decodedUsername ? ` (@${decodedUsername})` : ''}!`);
      setLoading(prev => ({ ...prev, instagram: false }));
      
      // Fetch from API to get the ID (needed for unlink)
      setTimeout(() => fetchInstagramStatus(token), 1500);
      
      return true;
      
    } else if (isFailure) {
      const errorMessage = status ? decodeURIComponent(status.replace(/\+/g, ' ')) : 'Failed to link Instagram.';
      toast.error(errorMessage);
      setLoading(prev => ({ ...prev, instagram: false }));
      return false;
    }
    
    return false;
  }, [fetchInstagramStatus]);

  // Handle Facebook/Messenger OAuth callback
  const handleFacebookCallback = useCallback(async (urlParams, token) => {
    const success = urlParams.get('success');
    const pageName = urlParams.get('page_name');
    const status = urlParams.get('status');
    const platform = urlParams.get('platform');
    
    if (platform !== 'messenger') return false;
    
    window.history.replaceState({}, document.title, window.location.pathname);
    
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess) {
      const decodedPageName = pageName ? decodeURIComponent(pageName) : null;
      
      setFacebookProfile(prev => ({ ...prev, name: decodedPageName }));
      
      setLinkedAccounts(prev => {
        const updated = { ...prev, facebook: true };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        return updated;
      });
      
      toast.success(`Successfully linked Facebook${decodedPageName ? ` (${decodedPageName})` : ''}!`);
      setLoading(prev => ({ ...prev, facebook: false }));
      
      setTimeout(() => fetchFacebookStatus(token), 1500);
      
      return true;
    } else if (isFailure) {
      const errorMessage = status ? decodeURIComponent(status.replace(/\+/g, ' ')) : 'Failed to link Facebook.';
      toast.error(errorMessage);
      setLoading(prev => ({ ...prev, facebook: false }));
      return false;
    }
    
    return false;
  }, [fetchFacebookStatus]);

  // ============================================
  // FACEBOOK SDK INITIALIZATION
  // ============================================

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
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            
            const config = { phone_number_id, waba_id };
            setWhatsappConfig(config);
            localStorage.setItem('whatsapp_config', JSON.stringify(config));
            
            setLinkedAccounts(prev => {
              const updated = { ...prev, whatsapp: true };
              localStorage.setItem('linkedAccounts', JSON.stringify(updated));
              return updated;
            });
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.success('Successfully linked WhatsApp Business account');
            
          } else if (data.event === 'CANCEL') {
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.error('WhatsApp signup was cancelled');
          } else if (data.event === 'ERROR') {
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.error('WhatsApp signup error');
          }
        }
      } catch (e) {
        // Non-JSON message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ============================================
  // MAIN INITIALIZATION
  // ============================================

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
      
      // Load cached data from localStorage
      const cachedLinkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '{}');
      const cachedInstagramProfile = JSON.parse(localStorage.getItem('instagram_profile') || '{}');
      const cachedFacebookProfile = JSON.parse(localStorage.getItem('facebook_profile') || '{}');
      const cachedWhatsappConfig = JSON.parse(localStorage.getItem('whatsapp_config') || '{}');
      
      setLinkedAccounts(prev => ({ ...prev, ...cachedLinkedAccounts }));
      setInstagramProfile(cachedInstagramProfile);
      setFacebookProfile(cachedFacebookProfile);
      setWhatsappConfig(cachedWhatsappConfig);
      
      // Check for OAuth callback parameters
      let callbackHandled = false;
      
      if (searchParams.has('success')) {
        const platform = searchParams.get('platform');
        
        if (platform === 'messenger' || platform === 'facebook') {
          callbackHandled = await handleFacebookCallback(searchParams, token);
        } else {
          // Default to Instagram callback handling
          callbackHandled = await handleInstagramCallback(searchParams, token);
        }
      }
      
      // Fetch fresh status from APIs if no callback or callback failed
      if (!callbackHandled) {
        await Promise.all([
          fetchInstagramStatus(token),
          fetchFacebookStatus(token),
          fetchWhatsAppStatus(token)
        ]);
      }
      
      setLoading(prev => ({ ...prev, initial: false }));
    };
    
    initializeUser();
  }, [navigate, searchParams, handleInstagramCallback, handleFacebookCallback, fetchInstagramStatus, fetchFacebookStatus, fetchWhatsAppStatus]);

  // ============================================
  // REFRESH STATUS HANDLER
  // ============================================

  const handleRefreshStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    setLoading(prev => ({ ...prev, refresh: true }));
    
    try {
      const results = await Promise.all([
        fetchInstagramStatus(token),
        fetchFacebookStatus(token),
        fetchWhatsAppStatus(token)
      ]);
      
      const anyLinked = results.some(r => r);
      toast.success(anyLinked ? 'Status refreshed - accounts found!' : 'Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  };

  // ============================================
  // LINK HANDLERS
  // ============================================

  // Facebook/Messenger Login Handler
  const linkFacebook = () => {
    setLoading(prev => ({ ...prev, facebook: true }));
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, facebook: false }));
      return;
    }
    
    const stateData = {
      platform: 'messenger',
      token: token
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

  // Instagram Login Handler
  const linkInstagram = () => {
    setLoading(prev => ({ ...prev, instagram: true }));
    callbackProcessed.current = false;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      setLoading(prev => ({ ...prev, instagram: false }));
      return;
    }
    
    const stateData = {
      platform: 'instagram',
      token: token
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

  // WhatsApp Business Login Handler
  const linkWhatsApp = () => {
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
        
        try {
          const backendResponse = await fetch('https://api.automation365.io/auth/whatsapp?code=' + code, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!backendResponse.ok) {
            toast.error('Failed to process WhatsApp authorization');
            setLoading(prev => ({ ...prev, whatsapp: false }));
          }
        } catch (error) {
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

  // ============================================
  // UNLINK HANDLERS
  // ============================================

  // Unlink Instagram Handler
  const unlinkInstagram = async () => {
    const token = localStorage.getItem('token');
    let instaId = instagramProfile.id;
    
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    // If no ID in state, try to get it from API
    if (!instaId) {
      try {
        const response = await fetch('https://api.automation365.io/instagram', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            instaId = data.id;
            setInstagramProfile(prev => ({ ...prev, id: data.id }));
          }
        }
      } catch (e) {
        console.error('Error getting Instagram ID:', e);
      }
    }
    
    if (!instaId) {
      toast.error('Unable to find Instagram account to unlink');
      setShowUnlinkDialog(false);
      return;
    }
    
    setUnlinkingInProgress(true);
    
    try {
      const response = await fetch('https://api.automation365.io/unlink-instagram', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ insta_id: instaId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLinkedAccounts(prev => {
          const updated = { ...prev, instagram: false };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        setInstagramProfile({});
        localStorage.removeItem('instagram_profile');
        
        toast.success('Instagram account unlinked successfully');
      } else {
        toast.error(data.message || 'Failed to unlink Instagram');
      }
    } catch (error) {
      console.error('Error unlinking Instagram:', error);
      toast.error('Failed to unlink Instagram');
    } finally {
      setUnlinkingInProgress(false);
      setShowUnlinkDialog(false);
      setAccountToUnlink(null);
    }
  };

  // Unlink Facebook Handler
  const unlinkFacebook = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    setUnlinkingInProgress(true);
    
    try {
      // Call unlink API if it exists
      const response = await fetch('https://api.automation365.io/unlink-messenger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Even if API fails, clear local state
      setLinkedAccounts(prev => {
        const updated = { ...prev, facebook: false };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        return updated;
      });
      setFacebookProfile({});
      localStorage.removeItem('facebook_profile');
      
      toast.success('Facebook account unlinked successfully');
    } catch (error) {
      // Clear local state even on error
      setLinkedAccounts(prev => {
        const updated = { ...prev, facebook: false };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        return updated;
      });
      setFacebookProfile({});
      localStorage.removeItem('facebook_profile');
      
      toast.success('Facebook account unlinked');
    } finally {
      setUnlinkingInProgress(false);
      setShowUnlinkDialog(false);
      setAccountToUnlink(null);
    }
  };

  // Unlink WhatsApp Handler
  const unlinkWhatsApp = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    setUnlinkingInProgress(true);
    
    try {
      // Call unlink API if it exists
      await fetch('https://api.automation365.io/unlink-whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Continue with local cleanup even if API fails
      console.log('WhatsApp unlink API error:', error);
    }
    
    // Clear local state
    setLinkedAccounts(prev => {
      const updated = { ...prev, whatsapp: false };
      localStorage.setItem('linkedAccounts', JSON.stringify(updated));
      return updated;
    });
    setWhatsappConfig({});
    localStorage.removeItem('whatsapp_config');
    
    toast.success('WhatsApp account unlinked');
    setUnlinkingInProgress(false);
    setShowUnlinkDialog(false);
    setAccountToUnlink(null);
  };

  // Confirm unlink based on platform
  const confirmUnlink = () => {
    switch (accountToUnlink) {
      case 'instagram':
        unlinkInstagram();
        break;
      case 'facebook':
        unlinkFacebook();
        break;
      case 'whatsapp':
        unlinkWhatsApp();
        break;
      default:
        setShowUnlinkDialog(false);
        setAccountToUnlink(null);
    }
  };

  // Handle account toggle
  const handleAccountToggle = (platform, checked) => {
    if (checked) {
      switch (platform) {
        case 'instagram':
          linkInstagram();
          break;
        case 'facebook':
          linkFacebook();
          break;
        case 'whatsapp':
          linkWhatsApp();
          break;
        case 'email':
        case 'sms':
          setLinkedAccounts(prev => {
            const updated = { ...prev, [platform]: true };
            localStorage.setItem('linkedAccounts', JSON.stringify(updated));
            return updated;
          });
          toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} notifications enabled`);
          break;
      }
    } else {
      if (['instagram', 'facebook', 'whatsapp'].includes(platform)) {
        setAccountToUnlink(platform);
        setShowUnlinkDialog(true);
      } else {
        setLinkedAccounts(prev => {
          const updated = { ...prev, [platform]: false };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} notifications disabled`);
      }
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getInstagramDisplayPic = () => {
    return instagramProfile.profilePicture || instagramProfile.dp || null;
  };

  const getInstagramDisplayName = () => {
    if (instagramProfile.username) {
      return `@${instagramProfile.username}`;
    }
    return linkedAccounts.instagram ? 'Instagram Business connected' : 'Connect Instagram Business';
  };

  const getFacebookDisplayName = () => {
    if (facebookProfile.name) {
      return facebookProfile.name;
    }
    return linkedAccounts.facebook ? 'Facebook Page connected' : 'Connect Facebook Page';
  };

  const getWhatsAppDisplayName = () => {
    if (whatsappConfig.phone_number_id) {
      return 'WhatsApp Business connected';
    }
    return linkedAccounts.whatsapp ? 'WhatsApp Business connected' : 'Connect WhatsApp Business';
  };

  // ============================================
  // PLATFORM CONFIGURATIONS
  // ============================================

  const platformConfigs = [
    {
      id: 'instagram',
      name: 'Instagram',
      displayName: linkedAccounts.instagram 
        ? (instagramProfile.username ? `Linked: @${instagramProfile.username}` : 'Instagram Linked')
        : 'Link Instagram Business',
      icon: getInstagramDisplayPic() || '/Images/instagram.png',
      iconComponent: <Instagram className="w-6 h-6 text-pink-600" />,
      description: getInstagramDisplayName(),
      canUnlink: true,
      bgColor: 'bg-pink-100',
      isProfilePic: !!getInstagramDisplayPic(),
      onLink: linkInstagram,
      available: true
    },
    {
      id: 'facebook',
      name: 'Facebook/Messenger',
      displayName: linkedAccounts.facebook 
        ? (facebookProfile.name ? `Linked: ${facebookProfile.name}` : 'Facebook Linked')
        : 'Link Facebook/Messenger',
      icon: '/Images/facebook.png',
      iconComponent: <Facebook className="w-6 h-6 text-blue-600" />,
      description: getFacebookDisplayName(),
      canUnlink: true,
      bgColor: 'bg-blue-100',
      onLink: linkFacebook,
      available: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      displayName: linkedAccounts.whatsapp ? 'WhatsApp Business Linked' : 'Link WhatsApp Business',
      icon: '/Images/whatsapp.png',
      description: getWhatsAppDisplayName(),
      canUnlink: true,
      bgColor: 'bg-green-100',
      onLink: linkWhatsApp,
      available: true
    },
    {
      id: 'email',
      name: 'Email',
      displayName: 'Email Notifications',
      icon: '/Images/email.png',
      description: 'Email notifications for bookings',
      canUnlink: false,
      bgColor: 'bg-gray-100',
      available: true
    },
    {
      id: 'sms',
      name: 'SMS',
      displayName: 'SMS Notifications',
      icon: '/Images/sms.png',
      description: 'SMS notifications for bookings',
      canUnlink: false,
      bgColor: 'bg-blue-50',
      available: true
    }
  ];

  const socialPlatforms = platformConfigs.filter(p => ['instagram', 'facebook', 'whatsapp'].includes(p.id));

  // ============================================
  // RENDER
  // ============================================

  // Loading state
  if (loading.initial) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Settings" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your accounts...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const linkedCount = Object.entries(linkedAccounts)
    .filter(([key]) => ['instagram', 'facebook', 'whatsapp'].includes(key))
    .filter(([_, value]) => value).length;
  const availableCount = socialPlatforms.length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
            <div className="mx-auto grid w-full max-w-6xl gap-2">
              <h1 className="text-3xl font-semibold">Connect Social Channels</h1>
              <p className="text-gray-600">Manage your connected social media accounts and notification preferences</p>
            </div>
            
            <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
              <nav className="grid gap-4 text-sm text-muted-foreground">
                <Link to="/ManageStore">Business Details</Link>
                <Link to="/PersonalDetails">Personal details</Link>
                <Link to="/StoreSetting">Store settings</Link>
                <Link to="/Bank">Payments</Link>
                <Link to="/Link" className="font-semibold text-primary">Connect Social channels</Link>
                <Link to="/Advance">Advance</Link>
              </nav>
              
              <div className="grid gap-6">
                {/* Main Social Accounts Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Social Media Accounts</CardTitle>
                        <CardDescription>
                          Link your social media accounts for automated messaging
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshStatus}
                        disabled={loading.refresh}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading.refresh ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
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
                            !isPlatformLinked && !isPlatformLoading && platform.available && platform.onLink
                              ? platform.onLink 
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 flex items-center justify-center ${platform.isProfilePic ? '' : platform.bgColor} rounded-lg overflow-hidden`}>
                                {platform.icon && platform.icon !== '/Images/instagram.png' && platform.isProfilePic ? (
                                  <img 
                                    src={platform.icon} 
                                    alt={platform.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : platform.iconComponent ? (
                                  platform.iconComponent
                                ) : (
                                  <img 
                                    src={platform.icon} 
                                    alt={platform.name}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{platform.displayName}</span>
                                  {isPlatformLinked && <Check className="w-4 h-4 text-green-600" />}
                                  {!platform.available && (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
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
                                  {platform.canUnlink && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setAccountToUnlink(platform.id);
                                        setShowUnlinkDialog(true);
                                      }}
                                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                                    >
                                      <Unlink className="w-4 h-4 mr-1" />
                                      Unlink
                                    </Button>
                                  )}
                                </div>
                              ) : platform.available ? (
                                <ArrowRight className="w-5 h-5 text-purple-600" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Status Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{linkedCount} of {availableCount} accounts linked</span>
                        <span className={`font-medium ${linkedCount > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                          {linkedCount > 0 ? '✓ Active' : 'No connections'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(linkedCount / availableCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure how you receive booking notifications
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {platformConfigs.filter(p => ['email', 'sms'].includes(p.id)).map((platform) => (
                      <div key={platform.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex items-center justify-center ${platform.bgColor} rounded-lg`}>
                            <img
                              src={platform.icon}
                              width={24}
                              height={24}
                              alt={platform.name}
                              className="rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{platform.name}</span>
                              {linkedAccounts[platform.id] && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{platform.description}</p>
                          </div>
                        </div>
                        
                        <Switch
                          id={platform.id}
                          checked={linkedAccounts[platform.id]}
                          onCheckedChange={(checked) => handleAccountToggle(platform.id, checked)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Help Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Connect your social media accounts to enable automated customer messaging and booking management.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Instagram: Manage DMs and comments automatically</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Facebook: Handle Messenger conversations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>WhatsApp: Business messaging automation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Unlink Confirmation Dialog */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Unlink {accountToUnlink?.charAt(0).toUpperCase() + accountToUnlink?.slice(1)} Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink your {accountToUnlink} account? 
              You will need to reconnect it to use automated messaging features for this platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnlinkDialog(false);
                setAccountToUnlink(null);
              }}
              disabled={unlinkingInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnlink}
              disabled={unlinkingInProgress}
            >
              {unlinkingInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unlinking...
                </>
              ) : (
                'Unlink Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkAccount;