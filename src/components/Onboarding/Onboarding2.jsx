import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, Check, Loader2 } from 'lucide-react';

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

  // Initialize Facebook SDK
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : '639118129084539',
        cookie     : true,
        xfbml      : true,
        version    : 'v21.0'
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // Facebook Login Handler
  const loginWithFacebook = () => {
    setLoading({ ...loading, facebook: true });
    
    window.FB.login(function(response) {
      if (response.authResponse) {
        console.log('Facebook Access Token: ', response.authResponse.accessToken);
        
        // Get user info
        window.FB.api('/me', { fields: 'id,name,email' }, function(userInfo) {
          console.log('User Info:', userInfo);
          
          // Send access token and user info to your backend
          sendTokenToBackend('facebook', {
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
            userInfo: userInfo
          });
        });
        
        // Get Facebook Pages (for business accounts)
        window.FB.api('/me/accounts', function(pages) {
          console.log('Facebook Pages:', pages);
          // You can let users select which page to connect
        });
        
        setLinkedAccounts({ ...linkedAccounts, facebook: true });
        setLoading({ ...loading, facebook: false });
      } else {
        console.log('User cancelled login or did not fully authorize.');
        setLoading({ ...loading, facebook: false });
      }
    }, {
      scope: 'public_profile,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_messages,business_management,whatsapp_business_messaging'
    });
  };

  // Twitter Login Handler (OAuth 1.0a - requires backend implementation)
  const loginWithTwitter = () => {
    setLoading({ ...loading, twitter: true });
    
    // Twitter uses OAuth 1.0a which requires backend implementation
    // This is a placeholder - you'll need to implement the actual flow
    console.log('Twitter login - implement OAuth flow through backend');
    
    // Example: Redirect to your backend OAuth endpoint
    // window.location.href = '/api/auth/twitter';
    
    setTimeout(() => {
      setLoading({ ...loading, twitter: false });
      alert('Twitter integration requires backend OAuth implementation');
    }, 1000);
  };

  // Instagram Login Handler (through Facebook Graph API)
  const loginWithInstagram = () => {
    setLoading({ ...loading, instagram: true });
    
    // Instagram Business accounts are linked through Facebook
    // First check if Facebook is connected
    if (!linkedAccounts.facebook) {
      alert('Please connect your Facebook account first. Instagram Business accounts are managed through Facebook.');
      setLoading({ ...loading, instagram: false });
      return;
    }
    
    // Get Instagram Business Accounts connected to Facebook Pages
    window.FB.api('/me/accounts', function(response) {
      if (response.data) {
        // For each Facebook Page, check for connected Instagram account
        response.data.forEach(page => {
          window.FB.api(
            `/${page.id}?fields=instagram_business_account`,
            function(instagramResponse) {
              if (instagramResponse.instagram_business_account) {
                console.log('Instagram Business Account found:', instagramResponse.instagram_business_account);
                setLinkedAccounts({ ...linkedAccounts, instagram: true });
              }
            }
          );
        });
      }
      setLoading({ ...loading, instagram: false });
    });
  };

  // WhatsApp Business Login Handler (through Facebook Business Manager)
  const loginWithWhatsApp = () => {
    setLoading({ ...loading, whatsapp: true });
    
    // WhatsApp Business API requires Facebook Business verification
    if (!linkedAccounts.facebook) {
      alert('Please connect your Facebook account first. WhatsApp Business API is managed through Facebook Business Manager.');
      setLoading({ ...loading, whatsapp: false });
      return;
    }
    
    // This requires WhatsApp Business API setup
    console.log('WhatsApp Business - requires Business Manager setup');
    
    setTimeout(() => {
      setLoading({ ...loading, whatsapp: false });
      alert('WhatsApp Business API requires additional setup through Facebook Business Manager');
    }, 1000);
  };

  // Send token to backend
  const sendTokenToBackend = async (platform, data) => {
    try {
      const response = await fetch('/api/social-media/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          ...data
        })
      });
      
      if (response.ok) {
        console.log(`${platform} account linked successfully`);
      } else {
        console.error(`Failed to link ${platform} account`);
      }
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };

  const handleContinue = () => {
    const linkedPlatforms = Object.entries(linkedAccounts)
      .filter(([_, isLinked]) => isLinked)
      .map(([platform]) => platform);
    
    if (linkedPlatforms.length === 0) {
      alert('Please link at least one social media account to continue');
      return;
    }
    
    console.log('Linked platforms:', linkedPlatforms);
    // Navigate to next step or dashboard
    // window.location.href = '/dashboard';
  };

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Link Facebook Account',
      icon: '📘',
      bgColor: 'bg-blue-100',
      onClick: loginWithFacebook
    },
    {
      id: 'twitter',
      name: 'Link Twitter Account',
      icon: '🐦',
      bgColor: 'bg-blue-50',
      onClick: loginWithTwitter
    },
    {
      id: 'instagram',
      name: 'Link Instagram Account',
      icon: '📷',
      bgColor: 'bg-pink-50',
      onClick: loginWithInstagram
    },
    {
      id: 'whatsapp',
      name: 'Link WhatsApp Account',
      icon: '💬',
      bgColor: 'bg-green-50',
      onClick: loginWithWhatsApp
    }
  ];

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
              <h1 className="text-2xl font-bold">Link Account</h1>
              <p className="text-gray-600">
                Kindly select your preferred social media platform to continue onboarding
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
          <h1 className="text-2xl font-bold">Link Account</h1>
          <p className="text-gray-600">
            Kindly select your preferred social media platform to continue onboarding
          </p>
        </div>

        {/* Social Media Links Section */}
        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {socialPlatforms.map((platform) => (
              <div
                key={platform.id}
                onClick={!linkedAccounts[platform.id] && !loading[platform.id] ? platform.onClick : undefined}
                className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                  linkedAccounts[platform.id]
                    ? 'border-green-500 bg-green-50 cursor-default'
                    : loading[platform.id]
                    ? 'border-gray-200 bg-gray-50 cursor-wait'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center ${platform.bgColor} rounded-lg`}>
                    <span className="text-2xl">{platform.icon}</span>
                  </div>
                  <span className="font-medium">
                    {linkedAccounts[platform.id] ? `${platform.name.replace('Link', 'Linked')} ✓` : platform.name}
                  </span>
                </div>
                {loading[platform.id] ? (
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                ) : linkedAccounts[platform.id] ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                )}
              </div>
            ))}

            {/* Status Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {Object.values(linkedAccounts).filter(Boolean).length} of {socialPlatforms.length} accounts linked
              </p>
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <Button 
                onClick={handleContinue}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={Object.values(linkedAccounts).every(val => !val)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding2;