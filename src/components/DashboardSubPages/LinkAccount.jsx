import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MoreHorizontal, 
  PlusCircle, 
  Facebook, 
  Instagram, 
  Upload, 
  Package2, 
  Search, 
  Share2, 
  Twitter,
  Loader2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  MessageCircle
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
  const [linkedAccounts, setLinkedAccounts] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
    email: false,
    sms: false
  });
  
  const [accountDetails, setAccountDetails] = useState({
    instagram: null,
    facebook: null,
    whatsapp: null
  });
  
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

  // Initialize Facebook SDK (for WhatsApp and Facebook)
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
            
            // Mark WhatsApp as linked
            setLinkedAccounts(prev => ({ ...prev, whatsapp: true }));
            setLoading(prev => ({ ...prev, whatsapp: false }));
            toast.success('Successfully linked WhatsApp Business account');
            
            // Save WhatsApp details
            localStorage.setItem('whatsapp_config', JSON.stringify({ phone_number_id, waba_id }));
            
            // Refresh status
            checkLinkedAccounts();
            
          } else if (data.event === 'CANCEL') {
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

  // Check authentication and linked accounts on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success')) {
      handleInstagramCallback(urlParams);
    }

    // Check linked accounts
    checkLinkedAccounts();
  }, []);

  // Handle Instagram OAuth callback
  const handleInstagramCallback = (urlParams) => {
    const success = urlParams.get('success');
    const username = urlParams.get('username');
    const profilePicture = urlParams.get('profile_picture');
    
    if (success && success.toLowerCase() === 'true') {
      setLinkedAccounts(prev => ({ ...prev, instagram: true }));
      
      // Store Instagram profile info
      if (username || profilePicture) {
        const profileData = {
          username,
          profilePicture: profilePicture ? decodeURIComponent(profilePicture) : null,
          linkedAt: new Date().toISOString()
        };
        localStorage.setItem('instagram_profile', JSON.stringify(profileData));
        setAccountDetails(prev => ({ ...prev, instagram: profileData }));
      }
      
      toast.success(`Successfully linked Instagram${username ? ` (@${username})` : ''}`);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Stop loading state
      setLoading(prev => ({ ...prev, instagram: false }));
      
      // Refresh status
      checkLinkedAccounts();
    } else if (success && success.toLowerCase() === 'false') {
      toast.error('Failed to link Instagram. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(prev => ({ ...prev, instagram: false }));
    }
  };

  // Check which accounts are already linked
  const checkLinkedAccounts = async () => {
    setIsCheckingStatus(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Check Instagram status
      const response = await axios.get('https://api.automation365.io/instagram', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.id) {
        setLinkedAccounts(prev => ({ ...prev, instagram: true }));
        setAccountDetails(prev => ({
          ...prev,
          instagram: {
            id: response.data.id,
            profilePicture: response.data.dp,
            username: response.data.username || 'Instagram User'
          }
        }));
      }

      // Check localStorage for other platforms
      const whatsappConfig = localStorage.getItem('whatsapp_config');
      if (whatsappConfig) {
        setLinkedAccounts(prev => ({ ...prev, whatsapp: true }));
      }

      // Check for Facebook/Messenger
      const facebookLinked = localStorage.getItem('facebook_linked');
      if (facebookLinked) {
        setLinkedAccounts(prev => ({ ...prev, facebook: true }));
      }

    } catch (error) {
      console.error('Error checking linked accounts:', error);
      // Don't show error toast here as accounts might just not be linked
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Link Instagram
  const linkInstagram = () => {
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
      token: token
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

  // Unlink Instagram
  const unlinkInstagram = async () => {
    if (!accountDetails.instagram?.id) {
      toast.error('No Instagram account to unlink');
      return;
    }

    setUnlinking(prev => ({ ...prev, instagram: true }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/unlink-instagram',
        { insta_id: accountDetails.instagram.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setLinkedAccounts(prev => ({ ...prev, instagram: false }));
        setAccountDetails(prev => ({ ...prev, instagram: null }));
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

    // Facebook login callback for Embedded Signup
    const fbLoginCallback = async (response) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('WhatsApp Embedded Signup code received:', code);
        
        try {
          const backendResponse = await fetch('https://api.automation365.io/auth/whatsapp?code=' + code, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!backendResponse.ok) {
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

  // Handle account toggle
  const handleAccountToggle = (platform, checked) => {
    if (checked) {
      // Link account
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
          // For email and SMS, just toggle the state
          setLinkedAccounts(prev => ({ ...prev, [platform]: true }));
          toast.success(`${platform.toUpperCase()} notifications enabled`);
          break;
      }
    } else {
      // Unlink account
      if (platform === 'instagram' || platform === 'facebook' || platform === 'whatsapp') {
        setAccountToUnlink(platform);
        setShowUnlinkDialog(true);
      } else {
        // For email and SMS, just toggle the state
        setLinkedAccounts(prev => ({ ...prev, [platform]: false }));
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
        // Implement Facebook unlink
        setLinkedAccounts(prev => ({ ...prev, facebook: false }));
        localStorage.removeItem('facebook_linked');
        toast.success('Facebook account unlinked');
        setShowUnlinkDialog(false);
        setAccountToUnlink(null);
        break;
      case 'whatsapp':
        // Implement WhatsApp unlink
        setLinkedAccounts(prev => ({ ...prev, whatsapp: false }));
        localStorage.removeItem('whatsapp_config');
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
      // Save the linked accounts state to backend or localStorage
      localStorage.setItem('linkedAccounts', JSON.stringify(linkedAccounts));
      
      // You can add API call here to save preferences to backend
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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
      icon: null,
      iconComponent: <Instagram className="w-6 h-6 text-pink-600" />,
      description: accountDetails.instagram?.username 
        ? `@${accountDetails.instagram.username}` 
        : 'Connect Instagram Business',
      canUnlink: true,
      color: 'text-pink-600'
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
                        onClick={checkLinkedAccounts}
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
                              className="rounded"
                            />
                          ) : (
                            platform.iconComponent
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
                            <Switch
                              id={platform.id}
                              checked={linkedAccounts[platform.id]}
                              onCheckedChange={(checked) => handleAccountToggle(platform.id, checked)}
                              disabled={isCheckingStatus}
                            />
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