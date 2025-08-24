import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, Loader2, ChevronLeft, ChevronRight, ShoppingBag, Package, Clock, Phone, Settings, LogOut, HelpCircle, Home } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';

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
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
        {isUser ? '👤' : '🤖'}
      </div>
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
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    const token = localStorage.getItem('token');
    const welcomeMsg = {
      id: 'welcome',
      content: token 
        ? 'Welcome! I\'m your chatbot assistant. Type "hello" or click any button to get started.'
        : 'Please login to test your chatbot.',
      message: token 
        ? 'Welcome! I\'m your chatbot assistant. Type "hello" or click any button to get started.'
        : 'Please login to test your chatbot.',
      message_type: 'text',
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
  }, []);

  const sendMessage = async (messageText, isButtonPayload = false, buttonTitle = null) => {
    if (!messageText.trim()) return;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to test your chatbot');
      return;
    }

    // Add user message to chat
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
      // Prepare the request body according to the documentation
      let requestBody;
      if (isButtonPayload) {
        requestBody = {
          type: 'button',
          title: buttonTitle || messageText,
          payload: messageText
        };
      } else {
        requestBody = {
          type: 'message',
          message: messageText
        };
      }

      console.log('Sending to API:', requestBody);

      const response = await fetch('https://test.automation365.io/test-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Process the response
      if (data && data.response) {
        let botResponse = data.response;
        
        // If response is a string, convert to message object
        if (typeof botResponse === 'string') {
          botResponse = {
            message: botResponse,
            message_type: 'text',
            metadata: {}
          };
        }
        
        // Create bot message - UPDATED to handle Text field
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: botResponse.Text || botResponse.message || botResponse.Type || 'I received your message',
          message: botResponse.Text || botResponse.message || botResponse.Type || 'I received your message',
          message_type: botResponse.message_type || 'text',
          metadata: botResponse.metadata || {},
          Type: botResponse.Type,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Fallback response if no data
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: 'I\'m sorry, I couldn\'t process your request. Please try again.',
          message: 'I\'m sorry, I couldn\'t process your request. Please try again.',
          message_type: 'text',
          metadata: {},
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again later.',
        message: 'Sorry, I encountered an error. Please try again later.',
        message_type: 'text',
        metadata: {},
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
    
    // Send the button click with both payload and title
    sendMessage(payload, true, title);
  };

  const clearChat = () => {
    const token = localStorage.getItem('token');
    const welcomeMsg = {
      id: 'welcome-new',
      content: token 
        ? 'Chat cleared! Type "hello" or click any button to get started.'
        : 'Please login to test your chatbot.',
      message: token 
        ? 'Chat cleared! Type "hello" or click any button to get started.'
        : 'Please login to test your chatbot.',
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
                      Send messages or click buttons to interact with your chatbot
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
              
              <div className="h-[calc(100%-80px)] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-gray-500">Loading...</p>
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
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              🤖
                            </div>
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
                      placeholder={localStorage.getItem('token') ? "Type your message..." : "Please login to send messages"}
                      className="flex-1"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending || !localStorage.getItem('token')}
                    />
                    <Button 
                      className="bg-purple-600 text-white px-8 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => sendMessage(inputMessage)}
                      disabled={isSending || !inputMessage.trim() || !localStorage.getItem('token')}
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