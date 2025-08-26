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
      }
      
      // Optionally refresh to sync with backend
      setTimeout(() => fetchChatHistory(true), 1000);
      
    } catch (err) {
      console.error('Error marking messages as read:', err);
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Process chat data into list format
  const getChatList = () => {
    if (!chatData || !chatData.messages) return [];
    
    const chatList = [];
    
    Object.entries(chatData.messages).forEach(([key, messages]) => {
      const [platform, username] = key.split(':');
      const lastMessage = messages[0]; // Messages are sorted by timestamp desc
      
      // Count unread incoming messages
      const unreadCount = messages.filter(msg => 
        msg.direction === 'incoming' && 
        msg.metadata?.read !== true
      ).length;
      
      // Get unread message sender_ids
      const unreadMessageIds = messages
        .filter(msg => msg.direction === 'incoming' && msg.metadata?.read !== true)
        .map(msg => msg.sender_id)
        .filter(Boolean);
      
      // Extract Instagram user ID from sender_id
      const instagramUserId = messages.find(msg => msg.sender_id)?.sender_id;
      
      chatList.push({
        id: key,
        name: username,
        platform: platform,
        instagramUserId: instagramUserId,
        lastMessage: lastMessage?.message || '',
        lastMessageType: lastMessage?.message_type || 'text',
        timestamp: lastMessage?.timestamp,
        messages: messages,
        unreadCount: unreadCount,
        unreadMessageIds: unreadMessageIds,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${getPlatformColor(platform)}&color=fff`
      });
    });

    // Sort by most recent message
    return chatList.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });
  };

  // Get platform color for avatar
  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'E4405F',
      whatsapp: '25D366',
      facebook: '1877F2',
      twitter: '1DA1F2'
    };
    return colors[platform] || '6B7280';
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const iconClass = {
      instagram: 'text-pink-500',
      whatsapp: 'text-green-500',
      facebook: 'text-blue-500',
      twitter: 'text-blue-400'
    };
    
    return <Instagram className={`w-4 h-4 ${iconClass[platform] || 'text-gray-500'}`} />;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Format message preview
  const formatMessagePreview = (message, messageType) => {
    if (messageType === 'image') return '📷 Image';
    if (messageType === 'video') return '🎥 Video';
    if (messageType === 'audio') return '🎵 Audio';
    if (messageType === 'file') return '📎 File';
    
    // Truncate long messages
    return message?.length > 50 ? message.substring(0, 50) + '...' : message || '';
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
    setShowChat(true);
    
    // Mark unread messages as read when opening chat
    if (chat.unreadMessageIds && chat.unreadMessageIds.length > 0) {
      await markMessagesAsRead(chat.name, chat.unreadMessageIds);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setShowChatList(true);
    setShowChat(false);
  };

  // Handle message send
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendingMessage || !selectedChat) return;
    
    setSendingMessage(true);
    const tempMessage = {
      sender_id: `temp_${Date.now()}`,
      message: messageInput,
      message_type: 'text',
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      metadata: {
        direction: 'outgoing',
        read: true
      },
      temp: true
    };
    
    // Add temporary message to UI
    setSelectedChat(prev => ({
      ...prev,
      messages: [tempMessage, ...prev.messages]
    }));
    
    const currentInput = messageInput;
    setMessageInput('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // Prepare request body with sender_id as expected by backend
      const requestBody = {
        username: selectedChat.name,
        message: currentInput,
        platform: selectedChat.platform,
        sender_id: selectedChat.instagramUserId // Backend expects sender_id
      };

      console.log('Sending message with data:', requestBody);

      const response = await fetch('https://instagram.automation365.io/send-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Session expired');
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to send message (${response.status})`);
      }

      const result = await response.json();
      console.log('Send message response:', result);
      
      // Remove temp message
      setSelectedChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => !m.temp)
      }));
      
      // Refresh chat history to get the real message
      await fetchChatHistory(true);
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove temp message on error
      setSelectedChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => !m.temp)
      }));
      // Restore input on error
      setMessageInput(currentInput);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle chat pause/play
  const handleChatPause = async () => {
    if (!selectedChat || pausingChat) return;
    
    setPausingChat(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const endpoint = chatPaused 
        ? 'https://instagram.automation365.io/play-chat'
        : 'https://instagram.automation365.io/pause-chat';

      // Prepare request body with sender_id as expected by backend
      const requestBody = {
        username: selectedChat.name,
        platform: selectedChat.platform,
        sender_id: selectedChat.instagramUserId // Backend expects sender_id
      };

      console.log(`${chatPaused ? 'Resuming' : 'Pausing'} chat with data:`, requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Session expired');
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to ${chatPaused ? 'resume' : 'pause'} chat (${response.status})`);
      }

      const result = await response.json();
      console.log('Chat pause/play response:', result);
      
      setChatPaused(!chatPaused);
      
    } catch (err) {
      console.error('Error pausing/resuming chat:', err);
    } finally {
      setPausingChat(false);
    }
  };

  // Filter chats based on search
  const filteredChats = getChatList().filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Messages" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">Error loading messages</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button 
                onClick={() => fetchChatHistory()} 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Messages" />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className={`w-full md:w-80 border-r bg-white flex-shrink-0 overflow-hidden flex flex-col
            ${showChatList ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Chat List
                  {chatData && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({chatData.total_messages} messages)
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => fetchChatHistory()}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search conversations" 
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div 
                    key={chat.id} 
                    onClick={() => handleChatSelect(chat)} 
                    className="cursor-pointer"
                  >
                    <ChatItem 
                      name={chat.name}
                      message={formatMessagePreview(chat.lastMessage, chat.lastMessageType)}
                      time={formatTime(chat.timestamp)}
                      avatar={chat.avatar}
                      platform={chat.platform}
                      active={selectedChat?.id === chat.id}
                      unreadCount={chat.unreadCount}
                      platformIcon={getPlatformIcon(chat.platform)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-white
            ${showChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleBackToList}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
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