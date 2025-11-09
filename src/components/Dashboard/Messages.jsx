import React, { useState, useEffect, useRef } from 'react';
import { Search, Instagram, Send, Paperclip, Smile, Image, Calendar, Mic, Pause, Play, ArrowLeft, MessageCircle, AlertCircle, RefreshCw, CheckCheck, Check } from 'lucide-react';
import Sidebar from '../Sidebar';
import Header from '../Header';

const Messages = () => {
  const [showChatList, setShowChatList] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatPaused, setChatPaused] = useState(false);
  const [pausingChat, setPausingChat] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [readChatIds, setReadChatIds] = useState(new Set()); // Track which chats have been read
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.messages]);

  // Fetch chat history from API
  useEffect(() => {
    fetchChatHistory();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchChatHistory(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchChatHistory = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://api.automation365.io/chat-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('Session expired');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch messages (${response.status})`);
      }

      const result = await response.json();
      console.log('Chat History API Response:', result);
      
      if (result.status === 'success' && result.data) {
        setChatData(result.data);
        
        // Update selected chat if it exists
        if (selectedChat && result.data.messages) {
          const updatedMessages = result.data.messages[selectedChat.id];
          if (updatedMessages) {
            setSelectedChat(prev => ({
              ...prev,
              messages: updatedMessages,
              // Use sender_id from the messages
              instagramUserId: updatedMessages[0]?.sender_id || prev.instagramUserId
            }));
          }
        }
      } else {
        throw new Error('Failed to fetch chat history');
      }
    } catch (err) {
      if (!silent) {
        setError(err.message);
        console.error('Error fetching chat history:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (username, messageIds) => {
    if (markingAsRead || !messageIds || messageIds.length === 0) return;
    
    setMarkingAsRead(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Marking messages as read:', { username, messageIds });

      const response = await fetch('https://api.automation365.io/mark-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          messages: messageIds // Send array of sender_ids
        })
      });

      if (response.status === 401) {
        console.error('Session expired');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read (${response.status})`);
      }

      const result = await response.json();
      console.log('Mark messages as read response:', result);
      
      // Update local state to reflect read status immediately
      if (selectedChat) {
        setSelectedChat(prev => ({
          ...prev,
          messages: prev.messages.map(msg => {
            if (messageIds.includes(msg.sender_id)) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  read: true
                }
              };
            }
            return msg;
          })
        }));
      }
      
      // Update chat data to reflect read status
      if (chatData && chatData.messages) {
        const updatedMessages = { ...chatData.messages };
        const key = `instagram:${username}`;
        
        if (updatedMessages[key]) {
          updatedMessages[key] = updatedMessages[key].map(msg => {
            if (messageIds.includes(msg.sender_id)) {
              return {
                ...msg,
                metadata: {
                  ...msg.metadata,
                  read: true
                }
              };
            }
            return msg;
          });
        }
        
        setChatData(prev => ({
          ...prev,
          messages: updatedMessages
        }));
        
        // Mark this chat as read in our tracking Set
        setReadChatIds(prev => new Set([...prev, key]));
      }
      
    } catch (err) {
      console.error('Error marking messages as read:', err);
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Calculate unread count for a chat
  const getUnreadCount = (chatId) => {
    // If this chat has been opened and marked as read, return 0
    if (readChatIds.has(chatId)) {
      return 0;
    }
    
    if (!chatData || !chatData.messages || !chatData.messages[chatId]) {
      return 0;
    }
    
    const messages = chatData.messages[chatId];
    return messages.filter(msg => 
      msg.direction === 'incoming' && 
      (!msg.metadata || !msg.metadata.read)
    ).length;
  };

  // Handle chat selection
  const handleChatSelect = (chatId, chatName) => {
    if (!chatData || !chatData.messages) return;
    
    const messages = chatData.messages[chatId] || [];
    const username = chatId.replace('instagram:', '');
    
    // Find the first message to get avatar
    const firstMessage = messages.find(msg => msg.direction === 'incoming');
    const avatar = firstMessage?.metadata?.profile_pic_url || '/default-avatar.png';
    
    const chat = {
      id: chatId,
      name: chatName || username,
      avatar: avatar,
      platform: 'instagram',
      messages: messages,
      instagramUserId: messages[0]?.sender_id || null
    };
    
    setSelectedChat(chat);
    setShowChat(true);
    setChatPaused(messages.some(msg => msg.metadata?.automation_paused));
    
    // Mark unread messages as read
    const unreadMessages = messages.filter(
      msg => msg.direction === 'incoming' && (!msg.metadata || !msg.metadata.read)
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages
        .map(msg => msg.sender_id)
        .filter(id => id); // Filter out any undefined/null sender_ids
      
      if (messageIds.length > 0) {
        markMessagesAsRead(username, messageIds);
        // Immediately mark this chat as read in our tracking
        setReadChatIds(prev => new Set([...prev, chatId]));
      }
    }
    
    // Mobile view handling
    if (window.innerWidth <= 768) {
      setShowChatList(false);
    }
  };

  // Handle chat pause/resume
  const handleChatPause = async () => {
    if (!selectedChat || !selectedChat.instagramUserId || pausingChat) return;
    
    setPausingChat(true);
    const newPausedState = !chatPaused;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Toggling automation:', { 
        userId: selectedChat.instagramUserId,
        pause: newPausedState 
      });

      const response = await fetch('https://api.automation365.io/pause-automation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instagram_user_id: selectedChat.instagramUserId,
          pause: newPausedState
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newPausedState ? 'pause' : 'resume'} automation`);
      }

      const result = await response.json();
      console.log('Automation toggle response:', result);
      
      setChatPaused(newPausedState);
      
      // Show success message (you can add a toast notification here)
      console.log(`Automation ${newPausedState ? 'paused' : 'resumed'} successfully`);
      
    } catch (err) {
      console.error('Error toggling automation:', err);
      // Show error message (you can add a toast notification here)
    } finally {
      setPausingChat(false);
    }
  };

  // Get chats grouped by platform
  const getChatsGroupedByPlatform = () => {
    if (!chatData || !chatData.messages) return {};
    
    const grouped = {};
    
    Object.entries(chatData.messages).forEach(([key, messages]) => {
      const [platform, username] = key.split(':');
      
      if (!grouped[platform]) {
        grouped[platform] = [];
      }
      
      // Get the latest message
      const latestMessage = messages[messages.length - 1];
      
      // Calculate unread count using our function
      const unreadCount = getUnreadCount(key);
      
      // Get profile info from the first incoming message
      const firstIncomingMsg = messages.find(msg => msg.direction === 'incoming');
      const avatar = firstIncomingMsg?.metadata?.profile_pic_url || '/default-avatar.png';
      const displayName = firstIncomingMsg?.metadata?.username || username;
      
      grouped[platform].push({
        id: key,
        username: username,
        displayName: displayName,
        avatar: avatar,
        latestMessage: latestMessage?.message || 'No messages',
        timestamp: latestMessage?.timestamp,
        unreadCount: unreadCount,
        messages: messages
      });
    });
    
    // Sort each platform's chats by timestamp (most recent first)
    Object.keys(grouped).forEach(platform => {
      grouped[platform].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
    });
    
    return grouped;
  };

  // Platform icon helper
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Format time helper
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Filter chats based on search
  const filterChats = (chats) => {
    if (!searchQuery.trim()) return chats;
    
    const filtered = {};
    Object.entries(chats).forEach(([platform, platformChats]) => {
      const filteredPlatformChats = platformChats.filter(chat => 
        chat.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.latestMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredPlatformChats.length > 0) {
        filtered[platform] = filteredPlatformChats;
      }
    });
    
    return filtered;
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendingMessage || !selectedChat) return;
    
    setSendingMessage(true);
    const messageToSend = messageInput.trim();
    
    // Create temporary message for immediate UI feedback
    const tempMessage = {
      message: messageToSend,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      message_type: 'text',
      metadata: {},
      temp: true // Mark as temporary
    };
    
    // Add temporary message to the UI
    setSelectedChat(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }));
    
    // Clear input immediately
    setMessageInput('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        throw new Error('Authentication required');
      }

      // Extract username from chat ID
      const username = selectedChat.id.replace('instagram:', '');
      
      console.log('Sending message:', { 
        to: username,
        message: messageToSend 
      });

      const response = await fetch('https://api.automation365.io/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: username,
          message: messageToSend,
          platform: 'instagram'
        })
      });

      if (response.status === 401) {
        console.error('Session expired');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      const result = await response.json();
      console.log('Send message response:', result);
      
      // Refresh chat history to get the actual sent message
      await fetchChatHistory(true);
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove temporary message on error
      setSelectedChat(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => !msg.temp)
      }));
      
      // Restore the message in the input for retry
      setMessageInput(messageToSend);
      
      // Show error message (you can add a toast notification here)
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setShowChat(false);
    setSelectedChat(null);
  };

  const handleRefresh = () => {
    fetchChatHistory();
  };

  const groupedChats = getChatsGroupedByPlatform();
  const filteredChats = filterChats(groupedChats);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 bg-white rounded-lg shadow m-2 sm:m-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full">
              {/* Chat List */}
              <div className={`${showChatList ? 'block' : 'hidden'} md:block w-full md:w-1/3 border-r h-full flex flex-col`}>
                <div className="p-4 border-b">
                  <h2 className="text-2xl font-semibold mb-4">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="Search chats..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {Object.keys(filteredChats).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchQuery ? 'No chats found' : 'No messages yet'}
                      </p>
                    </div>
                  ) : (
                    Object.entries(filteredChats).map(([platform, chats]) => (
                      <div key={platform}>
                        {chats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id, chat.displayName)}
                            className="cursor-pointer"
                          >
                            <ChatItem
                              name={chat.displayName}
                              message={chat.latestMessage}
                              time={formatTime(chat.timestamp)}
                              avatar={chat.avatar}
                              platform={platform}
                              active={selectedChat?.id === chat.id}
                              unreadCount={chat.unreadCount}
                              platformIcon={getPlatformIcon(platform)}
                            />
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                
                {isRefreshing && (
                  <div className="p-2 border-t bg-gray-50 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Refreshing...</span>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              <div className={`${showChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full`}>
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b">
                      {showChat && (
                        <button
                          onClick={handleBackToList}
                          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={selectedChat.avatar}
                                alt={selectedChat.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                              <h3 className="font-medium">{selectedChat.name}</h3>
                              <div className="flex items-center gap-1 text-green-500 text-sm">
                                <span>Active now</span>
                                {getPlatformIcon(selectedChat.platform)}
                              </div>
                            </div>
                          </div>
                          <button 
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            onClick={handleChatPause}
                            disabled={pausingChat}
                          >
                            {pausingChat ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                            ) : chatPaused ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                            <span className="hidden lg:inline">
                              {pausingChat ? 'Loading...' : chatPaused ? 'Resume Automation' : 'Pause Automation'}
                            </span>
                          </button>
                        </div>
                        {chatPaused && (
                          <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-lg">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Chat automation is paused
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                      {selectedChat.messages && selectedChat.messages.length > 0 ? (
                        selectedChat.messages.slice().reverse().map((msg, index) => (
                          <div 
                            key={`${msg.timestamp}_${index}_${msg.sender_id || 'no-id'}`} 
                            className={`flex gap-3 ${msg.direction === 'outgoing' ? 'justify-end' : ''} 
                              ${msg.temp ? 'opacity-70' : ''}`}
                          >
                            {msg.direction === 'incoming' && (
                              <img 
                                src={selectedChat.avatar}
                                alt={selectedChat.name}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div className={`rounded-lg p-3 max-w-[80%] sm:max-w-md ${
                              msg.direction === 'outgoing' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                            }`}>
                              {msg.message_type === 'image' && msg.metadata?.image_url ? (
                                <>
                                  <img 
                                    src={msg.metadata.image_url}
                                    alt="Image"
                                    className="max-w-full rounded-lg mb-2"
                                  />
                                  {msg.message && <p>{msg.message}</p>}
                                </>
                              ) : msg.message_type === 'video' && msg.metadata?.video_url ? (
                                <>
                                  <video 
                                    src={msg.metadata.video_url}
                                    controls
                                    className="max-w-full rounded-lg mb-2"
                                  />
                                  {msg.message && <p>{msg.message}</p>}
                                </>
                              ) : (
                                <p className={msg.direction === 'outgoing' ? 'text-white' : ''}>{msg.message}</p>
                              )}
                              <div className={`flex items-center justify-between mt-1 ${
                                msg.direction === 'outgoing' ? 'text-purple-200' : 'text-gray-500'
                              }`}>
                                <p className="text-xs">
                                  {formatTime(msg.timestamp)}
                                  {msg.temp && <span className="ml-1">(Sending...)</span>}
                                </p>
                                {msg.direction === 'outgoing' && !msg.temp && (
                                  <span className="ml-2">
                                    {msg.metadata?.read ? (
                                      <CheckCheck className="w-4 h-4" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No messages in this conversation yet</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                          <Mic className="w-5 h-5 text-gray-400 hidden sm:block cursor-pointer hover:text-gray-600" />
                          <input 
                            placeholder="Type a message..." 
                            className="flex-1 bg-transparent outline-none"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            disabled={sendingMessage}
                          />
                          <div className="flex items-center gap-2 text-gray-400">
                            <button className="hover:text-gray-600">
                              <Paperclip className="w-5 h-5" />
                            </button>
                            <button className="hover:text-gray-600 hidden sm:block">
                              <Image className="w-5 h-5" />
                            </button>
                            <button className="hover:text-gray-600 hidden sm:block">
                              <Smile className="w-5 h-5" />
                            </button>
                            <button className="hover:text-gray-600 hidden sm:block">
                              <Calendar className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <button 
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !messageInput.trim()}
                        >
                          {sendingMessage ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a chat from the list to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatItem = ({ name, message, time, avatar, platform, active, unreadCount, platformIcon }) => {
  return (
    <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${active ? 'bg-purple-50' : ''}`}>
      <div className="relative">
        <img 
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full"
        />
        <span className="absolute -bottom-1 -right-1">
          {platformIcon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium ${unreadCount > 0 ? 'font-semibold' : ''}`}>{name}</h3>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
          {message}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
          {unreadCount}
        </span>
      )} 
    </div>
  );
};

export default Messages;