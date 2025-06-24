import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, Loader2, ChevronLeft, ChevronRight, ShoppingBag, Package, Clock, Phone, Settings, LogOut, HelpCircle, Home } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { toast } from 'react-hot-toast';

// Helper function to get icon based on title
const getIconForTitle = (title) => {
  const iconMap = {
    'Product': <Package className="w-12 h-12 text-gray-400" />,
    'Products': <Package className="w-12 h-12 text-gray-400" />,
    'Services': <ShoppingBag className="w-12 h-12 text-gray-400" />,
    'FAQ': <HelpCircle className="w-12 h-12 text-gray-400" />,
    'Support': <Phone className="w-12 h-12 text-gray-400" />,
    'Opening Time': <Clock className="w-12 h-12 text-gray-400" />,
    'Track my Product': <Package className="w-12 h-12 text-gray-400" />,
    'Cart': <ShoppingBag className="w-12 h-12 text-gray-400" />,
    'Log Out': <LogOut className="w-12 h-12 text-gray-400" />,
    'Settings': <Settings className="w-12 h-12 text-gray-400" />,
    'Home': <Home className="w-12 h-12 text-gray-400" />,
    'Apparel': <ShoppingBag className="w-12 h-12 text-gray-400" />,
    'Clothing': <ShoppingBag className="w-12 h-12 text-gray-400" />,
    'T-shirt': <ShoppingBag className="w-12 h-12 text-gray-400" />
  };
  
  return iconMap[title] || <Package className="w-12 h-12 text-gray-400" />;
};

// Helper function to validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return false;
  // Google image search URLs are not direct image URLs
  if (url.includes('google.com/imgres')) return false;
  // Check for common image extensions or known domains
  return url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) || 
         url.includes('researchgate.net') || 
         url.includes('amazonaws.com') ||
         url.includes('cloudinary.com') ||
         url.includes('imgur.com');
};

// Component for rendering different message types
const MessageContent = ({ message, onButtonClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Handle image load errors
  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Handle regular text messages
  if (message.message_type === 'text') {
    return <p className="text-gray-700 whitespace-pre-wrap">{message.content || message.message}</p>;
  }

  // Handle button messages
  if (message.message_type === 'button' && message.metadata?.payload) {
    return (
      <div className="space-y-2">
        <p className="text-gray-700">{message.message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onButtonClick(message.metadata.payload, message.metadata.title || message.message)}
          className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
        >
          {message.metadata.title || 'Select'}
        </Button>
      </div>
    );
  }

  // Handle list/carousel messages
  if ((message.message_type === 'list' || message.message_type === 'carousel') && message.metadata?.elements) {
    const elements = message.metadata.elements;
    const isCarousel = message.message_type === 'carousel' || elements.length > 3;

    return (
      <div className="space-y-3">
        <p className="text-gray-700 font-medium">{message.content || message.message || message.Type}</p>
        
        {isCarousel ? (
          <div className="relative">
            {/* Carousel navigation buttons */}
            {elements.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => prev === 0 ? elements.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => prev === elements.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Card display */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {elements.map((element, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-1">
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                      {element.image && (
                        <div className="h-40 bg-gray-100 relative">
                          {!imageErrors[index] && isValidImageUrl(element.image) ? (
                            <img 
                              src={element.image} 
                              alt={element.title}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(index)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getIconForTitle(element.title)}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm mb-1">{element.title}</h4>
                        {element.subtitle && (
                          <p className="text-xs text-gray-600 mb-3">{element.subtitle}</p>
                        )}
                        {element.buttons && element.buttons.length > 0 && (
                          <div className="space-y-2">
                            {element.buttons.map((button, btnIndex) => (
                              <Button
                                key={btnIndex}
                                variant="outline"
                                size="sm"
                                onClick={() => onButtonClick(button.payload, button.title)}
                                className="w-full text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                              >
                                {button.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel indicators */}
            {elements.length > 1 && (
              <div className="flex justify-center mt-3 space-x-1">
                {elements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // List view for fewer items
          <div className="space-y-3">
            {elements.map((element, index) => (
              <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                {element.image && (
                  <div className="h-32 bg-gray-100 relative">
                    {!imageErrors[index] && isValidImageUrl(element.image) ? (
                      <img 
                        src={element.image} 
                        alt={element.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getIconForTitle(element.title)}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1">{element.title}</h4>
                  {element.subtitle && (
                    <p className="text-xs text-gray-600 mb-3">{element.subtitle}</p>
                  )}
                  {element.buttons && element.buttons.length > 0 && (
                    <div className="space-y-2">
                      {element.buttons.map((button, btnIndex) => (
                        <Button
                          key={btnIndex}
                          variant="outline"
                          size="sm"
                          onClick={() => onButtonClick(button.payload, button.title)}
                          className="w-full text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                        >
                          {button.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default text message
  return <p className="text-gray-700">{message.content || message.message || 'No content'}</p>;
};

const Message = ({ isUser, message, onButtonClick }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
    <div className="relative flex-shrink-0">
      <img 
        src="/api/placeholder/40/40"
        alt="Profile"
        className="w-10 h-10 rounded-full"
      />
      {!isUser && (
        <div className="absolute -right-1 bottom-0">
          <Instagram className="w-4 h-4 text-pink-500" />
        </div>
      )}
    </div>
    <div className={`max-w-[70%] ${isUser ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} p-3 rounded-lg shadow-sm border`}>
      {!isUser && (
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">Bot Assistant</span>
          <span className="text-green-500 text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
          </span>
        </div>
      )}
      <MessageContent message={message} onButtonClick={onButtonClick} />
      {message.timestamp && (
        <p className="text-xs text-gray-400 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [botFlows, setBotFlows] = useState({});
  const [chatHistoryData, setChatHistoryData] = useState(null);
  const [mainMenuData, setMainMenuData] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create flows from menu data
  const createFlowsFromMenuData = (menuData) => {
    const flows = {};
    
    if (menuData && menuData.metadata && menuData.metadata.elements) {
      // Store the main menu under common triggers
      const mainMenuFlow = {
        message: menuData.message || "Main Menu Options",
        message_type: menuData.message_type || "list",
        metadata: menuData.metadata
      };
      
      flows['hello'] = mainMenuFlow;
      flows['hi'] = mainMenuFlow;
      flows['start'] = mainMenuFlow;
      flows['home'] = mainMenuFlow;
      flows['menu'] = mainMenuFlow;
      flows['main menu'] = mainMenuFlow;
      
      // Create individual flows for each button payload
      menuData.metadata.elements.forEach(element => {
        if (element.buttons) {
          element.buttons.forEach(button => {
            if (button.payload) {
              let responseMessage = "";
              let responseType = "text";
              let responseMetadata = {};
              
              // Create specific responses based on payload
              switch(button.payload.toLowerCase()) {
                case 'general_product':
                  responseMessage = "🛍️ **Product Catalog**\n\nWelcome to our product section! Here you can browse our complete catalog of items.\n\n• Featured Products\n• New Arrivals\n• Best Sellers\n• Categories\n\nWhat would you like to explore? Type 'home' to return to the main menu.";
                  break;
                  
                case 'general_service':
                  responseMessage = "⚙️ **Our Services**\n\nDiscover the services we offer:\n\n• Consultation Services\n• Technical Support\n• Custom Solutions\n• Maintenance & Updates\n\nHow can we help you today? Type 'home' to return to the main menu.";
                  break;
                  
                case 'faq':
                  responseMessage = "❓ **Frequently Asked Questions**\n\n**Q: How do I place an order?**\nA: You can place orders through our website or by contacting our support team.\n\n**Q: What are your shipping options?**\nA: We offer standard and express shipping options.\n\n**Q: How can I track my order?**\nA: Use the 'Track Order' option from the main menu.\n\nType 'home' for the main menu.";
                  break;
                  
                case 'support':
                  responseMessage = "📞 **Customer Support**\n\nNeed help? Our support team is here for you!\n\n📧 Email: support@company.com\n📱 Phone: +1 (555) 123-4567\n💬 Live Chat: Available 24/7\n\nOur team typically responds within 2-4 hours.\n\nType 'home' to return to the main menu.";
                  break;
                  
                case 'time':
                  responseMessage = "🕒 **Business Hours**\n\n**Monday - Friday:** 9:00 AM - 6:00 PM\n**Saturday:** 10:00 AM - 4:00 PM\n**Sunday:** Closed\n\n**Holiday Hours:** Please check our website for holiday schedules.\n\n**Time Zone:** Eastern Standard Time (EST)\n\nType 'home' to return to the main menu.";
                  break;
                  
                case 'track':
                  responseMessage = "📦 **Order Tracking**\n\nTo track your order, please provide:\n\n• Order Number (starts with #)\n• Email Address used for the order\n\nOr you can log into your account to view all your orders.\n\n**Need help?** Contact our support team.\n\nType 'home' to return to the main menu.";
                  break;
                  
                case 'cart':
                  responseMessage = "🛒 **Shopping Cart**\n\nYour cart is currently empty.\n\n• Browse our products to add items\n• Save items for later\n• Apply discount codes at checkout\n\nReady to shop? Type 'general_product' to view products or 'home' for the main menu.";
                  break;
                  
                case 'log out':
                  responseMessage = "👋 **Logout**\n\nYou have been successfully logged out.\n\nThank you for using our service!\n\n• Your session data has been cleared\n• Any unsaved changes may be lost\n\nType 'hello' to start a new session.";
                  break;
                  
                case 'settings':
                  responseMessage = "⚙️ **Account Settings**\n\nManage your account preferences:\n\n• Profile Information\n• Notification Settings\n• Privacy Preferences\n• Password & Security\n• Billing Information\n\nTo make changes, please log into your account on our website.\n\nType 'home' to return to the main menu.";
                  break;
                  
                default:
                  responseMessage = `You selected: ${button.title}\n\nThis feature is currently being developed. We'll have more content here soon!\n\nType 'home' or 'menu' to return to the main menu.`;
              }
              
              flows[button.payload.toLowerCase()] = {
                message: responseMessage,
                message_type: responseType,
                metadata: responseMetadata
              };
              
              // Also map by title
              if (button.title) {
                flows[button.title.toLowerCase()] = flows[button.payload.toLowerCase()];
              }
            }
          });
        }
      });
    }
    
    return flows;
  };

  // Enhanced chat history processing
  const processAllChatHistory = (data) => {
    console.log('=== PROCESSING CHAT HISTORY ===');
    console.log('Full data received:', JSON.stringify(data, null, 2));
    
    if (!data || !data.messages) {
      console.log('No messages found in data');
      return { flows: {}, menuData: null };
    }

    const flows = {};
    const allMessages = [];
    let foundMenuData = null;

    // Collect ALL messages from ALL users/platforms
    Object.entries(data.messages).forEach(([userKey, userMessages]) => {
      console.log(`Processing messages for ${userKey}: ${userMessages.length} messages`);
      
      userMessages.forEach((msg, idx) => {
        allMessages.push({
          ...msg,
          userKey,
          originalIndex: idx
        });
        
        // Look for main menu data
        if (msg.message_type === 'list' && msg.metadata && msg.metadata.elements && 
            msg.message && msg.message.includes('Main Menu')) {
          foundMenuData = msg;
          console.log('Found main menu data:', msg.message);
        }
      });
    });

    // Sort all messages by timestamp (oldest first)
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    console.log(`Total messages after sorting: ${allMessages.length}`);

    // Extract incoming→outgoing patterns (PRIORITY - these are real flows)
    let flowsFound = 0;
    for (let i = 0; i < allMessages.length - 1; i++) {
      const current = allMessages[i];
      const next = allMessages[i + 1];

      // Look for incoming message followed by outgoing response
      if (current.direction === 'incoming' && next.direction === 'outgoing') {
        const trigger = current.metadata?.payload || current.message;
        
        console.log(`\n=== CONVERSATION FLOW FOUND #${flowsFound + 1} ===`);
        console.log(`Trigger: "${trigger}" (${current.message_type})`);
        console.log(`Response: "${next.message}" (${next.message_type})`);
        console.log('Response metadata:', next.metadata);
        
        if (trigger) {
          // Store the complete response with all metadata
          flows[trigger.toLowerCase()] = {
            message: next.message,
            message_type: next.message_type,
            metadata: next.metadata || {}
          };

          // Also map by title if available
          if (current.metadata?.title) {
            flows[current.metadata.title.toLowerCase()] = flows[trigger.toLowerCase()];
            console.log(`Also mapped by title: "${current.metadata.title.toLowerCase()}"`);
          }
          
          flowsFound++;
        }
      }
    }

    console.log(`\n=== CONVERSATION FLOWS SUMMARY ===`);
    console.log(`Real conversation flows found: ${flowsFound}`);

    // If we found real flows, prioritize them over menu creation
    if (flowsFound > 0) {
      console.log('Using real conversation flows as primary source');
      
      // Still add main menu triggers if we have menu data
      if (foundMenuData) {
        const mainMenuFlow = {
          message: foundMenuData.message || "Main Menu Options",
          message_type: foundMenuData.message_type || "list",
          metadata: foundMenuData.metadata
        };
        
        // Add common menu triggers
        ['hello', 'hi', 'start', 'home', 'menu', 'main menu'].forEach(trigger => {
          if (!flows[trigger]) { // Don't override existing flows
            flows[trigger] = mainMenuFlow;
          }
        });
      }
    } else {
      // Fallback to menu creation if no conversation flows found
      console.log('No conversation flows found, creating flows from menu data');
      if (foundMenuData) {
        const menuFlows = createFlowsFromMenuData(foundMenuData);
        Object.assign(flows, menuFlows);
      }
    }

    console.log('\n=== FINAL FLOWS EXTRACTED ===');
    console.log(`Total flows extracted: ${Object.keys(flows).length}`);
    console.log('Available triggers:', Object.keys(flows));
    
    return { flows, menuData: foundMenuData };
  };

  // Get bot response based on learned flows
  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase().trim();
    console.log(`\nGetting bot response for: "${input}"`);
    console.log('Available flows:', Object.keys(botFlows));
    
    // Direct match (highest priority)
    if (botFlows[lowerInput]) {
      console.log('✅ Found direct match!');
      return botFlows[lowerInput];
    }
    
    // Partial matches for payloads
    const partialMatch = Object.keys(botFlows).find(key => 
      key.includes(lowerInput) || lowerInput.includes(key)
    );
    
    if (partialMatch) {
      console.log('✅ Found partial match:', partialMatch);
      return botFlows[partialMatch];
    }
    
    // Check common greetings for main menu
    if (['hello', 'hi', 'hey', 'start', 'home', 'menu'].some(greeting => 
      lowerInput.includes(greeting) || greeting.includes(lowerInput)
    )) {
      const mainMenu = botFlows['hello'] || botFlows['hi'] || botFlows['home'] || botFlows['menu'];
      if (mainMenu) {
        console.log('✅ Found main menu response for greeting');
        return mainMenu;
      }
    }
    
    // Check for product-related queries
    if (lowerInput.includes('product')) {
      const productFlow = botFlows['general_product'] || botFlows['view products'];
      if (productFlow) {
        console.log('✅ Found product flow for product query');
        return productFlow;
      }
    }
    
    // Enhanced default response with available options
    console.log('❌ No match found, returning enhanced default response');
    const availableOptions = Object.keys(botFlows)
      .filter(key => !['hello', 'hi', 'start', 'home', 'menu', 'main menu'].includes(key))
      .slice(0, 10);
    
    let defaultMessage = `I don't have a specific response for "${input}".`;
    
    if (availableOptions.length > 0) {
      defaultMessage += ` Here are some things you can try:\n\n${availableOptions.map(opt => `• ${opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}`).join('\n')}`;
    }
    
    defaultMessage += `\n\nOr type "hello" to see the main menu.`;
    
    return {
      message: defaultMessage,
      message_type: "text",
      metadata: {}
    };
  };

  const fetchChatHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setMessages([{
          id: 'welcome',
          content: 'Please login to test your chatbot.',
          message: 'Please login to test your chatbot.',
          message_type: 'text',
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching chat history...');
      const response = await fetch('https://api.automation365.io/test-chat-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Raw response:', responseData);
      
      if (responseData.status === 'success' && responseData.data) {
        setChatHistoryData(responseData.data);
        
        const { flows, menuData } = processAllChatHistory(responseData.data);
        setBotFlows(flows);
        setMainMenuData(menuData);
        
        // Show welcome message
        const welcomeMsg = {
          id: 'welcome',
          content: 'Welcome! I\'ve loaded your chatbot configuration. Type "hello" to see the main menu.',
          message: 'Welcome! I\'ve loaded your chatbot configuration. Type "hello" to see the main menu.',
          message_type: 'text',
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        // Check how many flows were loaded
        const flowCount = Object.keys(flows).length;
        const realFlowCount = Object.keys(flows).filter(key => 
          !['hello', 'hi', 'start', 'home', 'menu', 'main menu'].includes(key)
        ).length;
        
        if (realFlowCount > 6) {
          console.log('Found rich conversation data with real flows');
          // Show main menu automatically
          const mainMenuFlow = flows['hello'] || flows['hi'] || flows['home'];
          if (mainMenuFlow) {
            console.log('Showing main menu on load');
            setMessages([
              welcomeMsg,
              {
                id: 'main-menu',
                content: mainMenuFlow.message,
                message: mainMenuFlow.message,
                message_type: mainMenuFlow.message_type,
                metadata: mainMenuFlow.metadata,
                isUser: false,
                timestamp: new Date().toISOString()
              }
            ]);
          } else {
            setMessages([welcomeMsg]);
          }
        } else {
          console.log('Limited conversation data - showing instructions');
          const instructionMsg = {
            id: 'instructions',
            content: `⚠️ **Limited Chat History Detected**\n\nI found ${flowCount} basic flows, but no rich conversation patterns.\n\n**To see the full chatbot experience:**\n• Use your chatbot on Instagram/social media\n• Create some conversations (click products, navigate menus)\n• Then come back here to test\n\n**For now, you can test basic responses:**\n• hello, hi, home (main menu)\n• faq, support, time, etc.\n\nType "hello" to start!`,
            message: `⚠️ **Limited Chat History Detected**\n\nI found ${flowCount} basic flows, but no rich conversation patterns.\n\n**To see the full chatbot experience:**\n• Use your chatbot on Instagram/social media\n• Create some conversations (click products, navigate menus)\n• Then come back here to test\n\n**For now, you can test basic responses:**\n• hello, hi, home (main menu)\n• faq, support, time, etc.\n\nType "hello" to start!`,
            message_type: 'text',
            isUser: false,
            timestamp: new Date().toISOString()
          };
          setMessages([instructionMsg]);
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history: ' + error.message);
      
      setMessages([{
        id: 'error',
        content: 'Failed to load chat history. You can still type messages to test the basic functionality.',
        message: 'Failed to load chat history. You can still type messages to test the basic functionality.',
        message_type: 'text',
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const sendMessage = async (messageText, isButtonPayload = false) => {
    if (!messageText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to send messages');
      return;
    }

    // Don't add duplicate user message for button clicks
    if (!isButtonPayload) {
      const userMessage = {
        id: `user-${Date.now()}`,
        content: messageText,
        message: messageText,
        message_type: 'text',
        metadata: {},
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
    }
    
    setIsSending(true);
    setError(null);

    try {
      // Send to backend first
      console.log('Sending to backend:', { message: messageText, isButton: isButtonPayload });
      const response = await fetch('https://test.automation365.io/test-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          username: 'test_user',
          message_type: isButtonPayload ? 'button' : 'text',
          metadata: {
            direction: 'incoming',
            platform: 'web',
            ...(isButtonPayload && { payload: messageText })
          }
        })
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response data:', data);
      
      // Check if backend processed the message
      if (data && data.response && data.response !== "Nothing processed") {
        // Use backend response
        console.log('Using backend response');
        let botResponse = data.response;
        
        if (typeof botResponse === 'string') {
          botResponse = {
            message: botResponse,
            message_type: 'text',
            metadata: {}
          };
        }
        
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: botResponse.message,
          message: botResponse.message,
          message_type: botResponse.message_type || 'text',
          metadata: botResponse.metadata || {},
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Backend didn't process, use learned flows
        console.log('Backend returned "Nothing processed", using learned flows');
        const learnedResponse = getBotResponse(messageText);
        
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: learnedResponse.message,
          message: learnedResponse.message,
          message_type: learnedResponse.message_type || 'text',
          metadata: learnedResponse.metadata || {},
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // On error, still try to use learned flows
      const learnedResponse = getBotResponse(messageText);
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        content: learnedResponse.message,
        message: learnedResponse.message,
        message_type: learnedResponse.message_type || 'text',
        metadata: learnedResponse.metadata || {},
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const handleButtonClick = (payload, title) => {
    console.log(`Button clicked: "${title}" with payload: "${payload}"`);
    
    // Add user message showing button click
    const userMessage = {
      id: `user-${Date.now()}`,
      content: title || payload,
      message: title || payload,
      message_type: 'button',
      metadata: { payload: payload, title: title },
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send the payload
    sendMessage(payload, true);
  };

  const clearChat = () => {
    const welcomeMsg = {
      id: 'welcome-new',
      content: 'Chat cleared! Type "hello" to see the main menu.',
      message: 'Chat cleared! Type "hello" to see the main menu.',
      message_type: 'text',
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMsg]);
    setError(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Test Chat Bot" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-160px)]">
              <div className="border-b p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">Test Your Bot</h2>
                    <p className="text-sm opacity-90">
                      Testing your personalized chatbot based on your configuration
                    </p>
                  </div>
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="sm"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30 text-white"
                  >
                    Clear Chat
                  </Button>
                </div>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {/* Debug Info */}
              {Object.keys(botFlows).length > 0 && (
                <div className="p-3 bg-blue-50 border-b border-blue-200 text-blue-700 text-sm">
                  <strong>Chatbot Status:</strong> Loaded {Object.keys(botFlows).length} conversation flows
                </div>
              )}
              
              <div className="h-[calc(100%-80px)] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-gray-500">Loading your chatbot configuration...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <Message 
                          key={message.id}
                          isUser={message.isUser}
                          message={message}
                          onButtonClick={handleButtonClick}
                        />
                      ))}
                      {isSending && (
                        <div className="flex gap-3 mb-4">
                          <div className="relative">
                            <img 
                              src="/api/placeholder/40/40"
                              alt="Bot"
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="absolute -right-1 bottom-0">
                              <Instagram className="w-4 h-4 text-pink-500" />
                            </div>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your message..."
                      className="flex-1"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                    <Button 
                      className="bg-purple-600 text-white px-8 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isSending || !inputMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chatbot;