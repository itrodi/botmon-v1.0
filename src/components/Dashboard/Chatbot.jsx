import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';

const Message = ({ isUser, content, timestamp }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    <div className="relative">
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
    <div className={`max-w-[70%] ${isUser ? 'bg-green-50' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
      {!isUser && (
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">Bot Assistant</span>
          <span className="text-green-500 text-sm">Online</span>
        </div>
      )}
      <p className="text-gray-700">{content}</p>
      {timestamp && (
        <p className="text-xs text-gray-400 mt-1">
          {new Date(timestamp).toLocaleTimeString()}
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
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      // Get auth token from localStorage or your auth system
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://api.automation365.io/test-chat-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      
      // Process the messages from the response
      if (data.status === 'success' && data.data.messages) {
        const allMessages = [];
        
        // Extract messages from grouped format
        Object.entries(data.data.messages).forEach(([key, msgs]) => {
          msgs.forEach(msg => {
            allMessages.push({
              id: `${key}-${msg.timestamp}`,
              content: msg.message,
              isUser: msg.direction === 'outgoing',
              timestamp: msg.timestamp
            });
          });
        });

        // Sort messages by timestamp
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(allMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Initialize with a welcome message if fetch fails
      setMessages([{
        id: 'welcome',
        content: 'Hello! How may I help you today?',
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://test.automation365.io/test-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          username: 'test_user',
          message_type: 'text',
          metadata: {
            direction: 'outgoing',
            platform: 'web'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add bot response to chat
      if (data.response) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: data.response,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
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
      sendMessage();
    }
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
              <div className="border-b p-4">
                <h2 className="text-lg font-medium">Test Your Bot</h2>
                <p className="text-sm text-gray-500">
                  Try out how your bot will respond to customer inquiries
                </p>
              </div>
              
              <div className="h-[calc(100%-80px)] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <Message 
                          key={message.id}
                          isUser={message.isUser}
                          content={message.content}
                          timestamp={message.timestamp}
                        />
                      ))}
                      {isSending && (
                        <div className="flex gap-3">
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
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                
                <div className="p-4 border-t">
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
                      className="bg-purple-600 text-white px-8 hover:bg-purple-700"
                      onClick={sendMessage}
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