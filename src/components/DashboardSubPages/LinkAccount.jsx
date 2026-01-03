import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Loader2,
  Check,
  RefreshCw,
  Unlink
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
import axios from 'axios';

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
  
  const [loading, setLoading] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
    email: false,
    sms: false
  });
  
  const [unlinking, setUnlinking] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false
  });
  
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [accountToUnlink, setAccountToUnlink] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fbInitialized = useRef(false);
  const callbackProcessed = useRef(false);

  // Fetch Instagram status from backend API
  const fetchInstagramStatus = async (token) => {
    if (!token) return false;
    
    // Get existing profile to preserve username (API doesn't return it)
    const existingProfile = JSON.parse(localStorage.getItem('instagram_profile') || '{}');
    
    try {
      const response = await axios.get('https://api.automation365.io/instagram', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.id) {
        const profileData = {
          id: response.data.id,
          dp: response.data.dp || existingProfile.dp || null,
          username: response.data.username || existingProfile.username || null,
          profilePicture: response.data.dp || existingProfile.profilePicture || null
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
      
      return false;
    } catch (error) {
      console.log('Instagram not linked or error:', error.message);
      return false;
    }
  };

  // Handle Instagram OAuth callback
  const handleInstagramCallback = async (urlParams, token) => {
    if (callbackProcessed.current) return false;
    
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    const status = urlParams.get('status');
    
    // Clear URL params immediately
    window.history.replaceState({}, document.title, window.location.pathname);
    
    callbackProcessed.current = true;
    
    // Handle both "true" and "True" (Python sends capitalized)
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess) {
      const decodedUsername = username ? decodeURIComponent(username) : null;
      const decodedPic = profilePicture ? decodeURIComponent(profilePicture) : null;
      
      const profileData = {
        username: decodedUsername,
        profilePicture: decodedPic,
        dp: decodedPic
      };
      
      setInstagramProfile(profileData);
      localStorage.setItem('instagram_profile', JSON.stringify(profileData));
      
      setLinkedAccounts(prev => {
        const updated = { ...prev, instagram: true };
        localStorage.setItem('linkedAccounts', JSON.stringify(updated));
        return updated;
      });
      
      toast.success(`Successfully linked Instagram${decodedUsername ? ` (@${decodedUsername})` : ''}!`);
      setLoading(prev => ({ ...prev, instagram: false }));
      
      // Fetch ID from API after callback (API returns id which we need for unlinking)
      setTimeout(() => fetchInstagramStatus(token), 1500);
      
      return true;
    } else if (isFailure) {
      const errorMessage = status ? decodeURIComponent(status.replace(/\+/g, ' ')) : 'Failed to link Instagram.';
      toast.error(errorMessage);
      setLoading(prev => ({ ...prev, instagram: false }));
      return false;
    }
    
    return false;
  };

  // Initialize Facebook SDK
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
            
            localStorage.setItem('whatsapp_config', JSON.stringify({ phone_number_id, waba_id }));
            
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
        // Non-JSON message
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check authentication and linked accounts on mount
  useEffect(() => {
    const initializePage = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Load cached data from localStorage
      const cachedLinkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '{}');
      const cachedProfile = JSON.parse(localStorage.getItem('instagram_profile') || '{}');
      
      setLinkedAccounts(prev => ({ ...prev, ...cachedLinkedAccounts }));
      setInstagramProfile(cachedProfile);

      // Check for OAuth callback parameters
      if (searchParams.has('success')) {
        await handleInstagramCallback(searchParams, token);
      }

      // Fetch fresh Instagram status from API
      await fetchInstagramStatus(token);
      
      // Check WhatsApp config
      const whatsappConfig = localStorage.getItem('whatsapp_config');
      if (whatsappConfig) {
        setLinkedAccounts(prev => {
          const updated = { ...prev, whatsapp: true };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
      }
      
      setIsCheckingStatus(false);
    };

    initializePage();
  }, [navigate, searchParams]);

  // Refresh status handler
  const handleRefreshStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      return;
    }
    
    setIsCheckingStatus(true);
    
    try {
      await fetchInstagramStatus(token);
      toast.success('Status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Link Instagram
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

  // Unlink Instagram
  const unlinkInstagram = async () => {
    const token = localStorage.getItem('token');
    let instaId = instagramProfile.id;
    
    if (!token) {
      toast.error('Please login first');
      setShowUnlinkDialog(false);
      return;
    }
    
    // If no ID in state, try to get it from API
    if (!instaId) {
      try {
        const response = await axios.get('https://api.automation365.io/instagram', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data && response.data.id) {
          instaId = response.data.id;
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

    setUnlinking(prev => ({ ...prev, instagram: true }));

    try {
      const response = await axios.post(
        'https://api.automation365.io/unlink-instagram',
        { insta_id: instaId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setLinkedAccounts(prev => {
          const updated = { ...prev, instagram: false };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        setInstagramProfile({});
        localStorage.removeItem('instagram_profile');
        
        toast.success('Instagram account unlinked successfully');
      } else {
        toast.error(response.data.message || 'Failed to unlink Instagram');
      }
    } catch (error) {
      console.error('Error unlinking Instagram:', error);
      toast.error('Failed to unlink Instagram account');
    } finally {
      setUnlinking(prev => ({ ...prev, instagram: false }));
      setShowUnlinkDialog(false);
      setAccountToUnlink(null);
    }
  };

  // Link Facebook/Messenger
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

  // Link WhatsApp
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
          toast.success(`${platform.toUpperCase()} notifications enabled`);
          break;
      }
    } else {
      if (platform === 'instagram' || platform === 'facebook' || platform === 'whatsapp') {
        setAccountToUnlink(platform);
        setShowUnlinkDialog(true);
      } else {
        setLinkedAccounts(prev => {
          const updated = { ...prev, [platform]: false };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        toast.success(`${platform.toUpperCase()} notifications disabled`);
      }
    }
  };

  // Confirm unlink
  const confirmUnlink = () => {
    switch (accountToUnlink) {
      case 'instagram':
        unlinkInstagram();
        break;
      case 'facebook':
        setLinkedAccounts(prev => {
          const updated = { ...prev, facebook: false };
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        toast.success('Facebook account unlinked');
        setShowUnlinkDialog(false);
        setAccountToUnlink(null);
        break;
      case 'whatsapp':
        setLinkedAccounts(prev => {
          const updated = { ...prev, whatsapp: false };
          localStorage.removeItem('whatsapp_config');
          localStorage.setItem('linkedAccounts', JSON.stringify(updated));
          return updated;
        });
        toast.success('WhatsApp account unlinked');
        setShowUnlinkDialog(false);
        setAccountToUnlink(null);
        break;
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      localStorage.setItem('linkedAccounts', JSON.stringify(linkedAccounts));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Get Instagram display info
  const getInstagramDisplayPic = () => {
    return instagramProfile.profilePicture || instagramProfile.dp || null;
  };

  const platformConfigs = [
    {
      id: 'email',
      name: 'Email',
      icon: '/Images/email.png',
      description: 'Email notifications',
      canUnlink: false,
      color: 'text-gray-600'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '/Images/sms.png',
      description: 'SMS notifications',
      canUnlink: false,
      color: 'text-blue-600'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '/Images/whatsapp.png',
      description: linkedAccounts.whatsapp ? 'WhatsApp Business connected' : 'Connect WhatsApp Business',
      canUnlink: true,
      color: 'text-green-600'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: getInstagramDisplayPic(),
      iconComponent: <Instagram className="w-6 h-6 text-pink-600" />,
      description: instagramProfile.username 
        ? `@${instagramProfile.username}` 
        : linkedAccounts.instagram 
        ? 'Instagram Business connected'
        : 'Connect Instagram Business',
      canUnlink: true,
      color: 'text-pink-600',
      isProfilePic: !!getInstagramDisplayPic()
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: null,
      iconComponent: <Facebook className="w-6 h-6 text-blue-600" />,
      description: linkedAccounts.facebook ? 'Facebook Page connected' : 'Connect Facebook Page',
      canUnlink: true,
      color: 'text-blue-600'
    }
  ];

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
                {/* Status Card */}
                {isCheckingStatus && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle>Checking account status...</AlertTitle>
                    <AlertDescription>
                      Please wait while we verify your connected accounts.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Link and Unlink Accounts</CardTitle>
                        <CardDescription>
                          Link and unlink social media accounts for automated messaging
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshStatus}
                        disabled={isCheckingStatus}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {platformConfigs.map((platform) => (
                      <div key={platform.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {platform.icon ? (
                            <img
                              src={platform.icon}
                              width={40}
                              height={40}
                              alt={platform.name}
                              className={platform.isProfilePic ? "rounded-full object-cover" : "rounded"}
                              onError={(e) => {
                                if (platform.id === 'instagram') {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling?.style?.removeProperty('display');
                                }
                              }}
                            />
                          ) : null}
                          {(!platform.icon || platform.id === 'instagram') && platform.iconComponent && (
                            <span style={{ display: platform.icon ? 'none' : 'block' }}>
                              {platform.iconComponent}
                            </span>
                          )}
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
                        
                        <div className="flex items-center gap-2">
                          {loading[platform.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                          ) : unlinking[platform.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                          ) : (
                            <>
                              <Switch
                                id={platform.id}
                                checked={linkedAccounts[platform.id]}
                                onCheckedChange={(checked) => handleAccountToggle(platform.id, checked)}
                                disabled={isCheckingStatus}
                              />
                              {linkedAccounts[platform.id] && platform.canUnlink && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setAccountToUnlink(platform.id);
                                    setShowUnlinkDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                >
                                  <Unlink className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {Object.values(linkedAccounts).filter(Boolean).length} of {platformConfigs.length} accounts connected
                        </span>
                        <span className="text-purple-600 font-medium">
                          {Object.values(linkedAccounts).filter(Boolean).length > 0 ? 'Active' : 'No active connections'}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(Object.values(linkedAccounts).filter(Boolean).length / platformConfigs.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-6 py-4">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
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
                        <span>Instagram: Manage DMs and comments</span>
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
            <DialogTitle>Unlink {accountToUnlink?.charAt(0).toUpperCase() + accountToUnlink?.slice(1)} Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink your {accountToUnlink} account? You will need to reconnect it to use automated messaging features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnlinkDialog(false);
                setAccountToUnlink(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnlink}
              disabled={unlinking[accountToUnlink]}
            >
              {unlinking[accountToUnlink] ? (
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