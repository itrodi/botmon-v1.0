import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Instagram, Send, Paperclip, Smile, Image, Calendar, Mic, Pause, Play, ArrowLeft, MessageCircle, AlertCircle, RefreshCw, CheckCheck, Check } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Sidebar from '../Sidebar';
import Header from '../Header';

const Messages = () => {
  const { socket, connected: socketConnected } = useSocket();

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
  const [togglingPause, setTogglingPause] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [readChatIds, setReadChatIds] = useState(new Set());
  const [pausedChats, setPausedChats] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedChatRef = useRef(null);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (selectedChat?.messages) setTimeout(() => scrollToBottom(), 100);
  }, [selectedChat?.messages, scrollToBottom]);

  // ── Socket listener for real-time chat messages ──
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      console.log('New chat message received via socket:', messageData);

      const chatKey = messageData.chat_id
        || messageData.chatId
        || (messageData.platform && messageData.username
          ? `${messageData.platform}:${messageData.username}`
          : null);

      if (!chatKey) {
        console.warn('Received message without identifiable chat key:', messageData);
        return;
      }

      const newMessage = {
        message: messageData.message || messageData.text || '',
        direction: messageData.direction || 'incoming',
        timestamp: messageData.timestamp || new Date().toISOString(),
        message_type: messageData.message_type || 'text',
        sender_id: messageData.sender_id || null,
        metadata: messageData.metadata || {},
      };

      setChatData((prev) => {
        if (!prev?.messages) return prev;
        const existing = prev.messages[chatKey] || [];
        return { ...prev, messages: { ...prev.messages, [chatKey]: [...existing, newMessage] } };
      });

      const currentChat = selectedChatRef.current;
      if (currentChat && currentChat.id === chatKey) {
        setSelectedChat((prev) => ({ ...prev, messages: [...(prev.messages || []), newMessage] }));
        setTimeout(() => scrollToBottom(), 100);

        if (newMessage.direction === 'incoming' && newMessage.sender_id) {
          const username = chatKey.replace('instagram:', '');
          markMessagesAsRead(username, [newMessage.sender_id]);
        }
      }
    };

    socket.on('new_chat_message', handleNewMessage);
    return () => { socket.off('new_chat_message', handleNewMessage); };
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial data fetch ──
  useEffect(() => { fetchChatHistory(); }, []);

  const fetchChatHistory = async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setIsRefreshing(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }

      const response = await fetch('https://api.automation365.io/chat-history', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; return; }
      if (!response.ok) throw new Error(`Failed to fetch messages (${response.status})`);

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setChatData(result.data);

        if (selectedChat && result.data.messages) {
          const updatedMessages = result.data.messages[selectedChat.id];
          if (updatedMessages) {
            setSelectedChat(prev => ({
              ...prev, messages: updatedMessages,
              instagramUserId: updatedMessages.find(m => m.sender_id)?.sender_id || prev.instagramUserId
            }));
            const isPaused = updatedMessages.some(msg => msg.metadata?.automation_paused) || pausedChats.has(selectedChat.id);
            setChatPaused(isPaused);
          }
        }
      } else {
        throw new Error('Failed to fetch chat history');
      }
    } catch (err) {
      if (!silent) { setError(err.message); console.error('Error fetching chat history:', err); }
    } finally {
      setLoading(false); setIsRefreshing(false);
    }
  };

  // ── Mark messages as read ──
  const markMessagesAsRead = async (username, messageIds) => {
    if (markingAsRead || !messageIds?.length) return;
    setMarkingAsRead(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://api.automation365.io/mark-messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, messages: messageIds })
      });

      if (response.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; return; }
      if (!response.ok) throw new Error(`Failed to mark messages as read (${response.status})`);

      if (selectedChat) {
        setSelectedChat(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            messageIds.includes(msg.sender_id) ? { ...msg, metadata: { ...msg.metadata, read: true } } : msg
          )
        }));
      }

      if (chatData?.messages) {
        const key = `instagram:${username}`;
        const updated = { ...chatData.messages };
        if (updated[key]) {
          updated[key] = updated[key].map(msg =>
            messageIds.includes(msg.sender_id) ? { ...msg, metadata: { ...msg.metadata, read: true } } : msg
          );
        }
        setChatData(prev => ({ ...prev, messages: updated }));
        setReadChatIds(prev => new Set([...prev, key]));
      }
    } catch (err) { console.error('Error marking messages as read:', err); }
    finally { setMarkingAsRead(false); }
  };

  const getUnreadCount = (chatId) => {
    if (readChatIds.has(chatId)) return 0;
    if (!chatData?.messages?.[chatId]) return 0;
    return chatData.messages[chatId].filter(msg => msg.direction === 'incoming' && (!msg.metadata || !msg.metadata.read)).length;
  };

  // ── Chat selection ──
  const handleChatSelect = (chatId, chatName) => {
    if (!chatData?.messages) return;
    const messages = chatData.messages[chatId] || [];
    const username = chatId.replace('instagram:', '');
    const firstMsg = messages.find(msg => msg.direction === 'incoming');
    const incomingMsg = messages.find(msg => msg.direction === 'incoming' && msg.sender_id);

    const chat = {
      id: chatId, name: chatName || username,
      avatar: firstMsg?.metadata?.profile_pic_url || '/default-avatar.png',
      platform: 'instagram', messages,
      instagramUserId: incomingMsg?.sender_id || null, username
    };

    setSelectedChat(chat);
    setShowChat(true);
    setChatPaused(messages.some(msg => msg.metadata?.automation_paused) || pausedChats.has(chatId));

    const unread = messages.filter(msg => msg.direction === 'incoming' && (!msg.metadata || !msg.metadata.read));
    if (unread.length > 0) {
      const ids = unread.map(msg => msg.sender_id).filter(Boolean);
      if (ids.length > 0) { markMessagesAsRead(username, ids); setReadChatIds(prev => new Set([...prev, chatId])); }
    }

    if (window.innerWidth <= 768) setShowChatList(false);
    setTimeout(() => scrollToBottom(), 150);
  };

  // ── Pause chat (sends sender_id) ──
  const pauseChat = async () => {
    if (!selectedChat || togglingPause) return;
    setTogglingPause(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      const username = selectedChat.username || selectedChat.id.replace('instagram:', '');
      const senderId = selectedChat.instagramUserId;
      if (!senderId) console.warn('No sender_id available — pause may fail');

      const response = await fetch('https://instagram.automation365.io/pause-chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sender_id: senderId || null })
      });
      if (response.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; return; }
      let result = {}; try { result = await response.json(); } catch (e) {}
      if (!response.ok) throw new Error(result.error || result.message || `Failed to pause chat (${response.status})`);

      setChatPaused(true);
      setPausedChats(prev => new Set([...prev, selectedChat.id]));
      await fetchChatHistory(true);
    } catch (err) { console.error('Error pausing chat:', err); alert(`Failed to pause automation: ${err.message}`); }
    finally { setTogglingPause(false); }
  };

  // ── Resume / play chat (sends sender_id) ──
  const playChat = async () => {
    if (!selectedChat || togglingPause) return;
    setTogglingPause(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      const username = selectedChat.username || selectedChat.id.replace('instagram:', '');
      const senderId = selectedChat.instagramUserId;
      if (!senderId) console.warn('No sender_id available — resume may fail');

      const response = await fetch('https://instagram.automation365.io/play-chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sender_id: senderId || null })
      });
      if (response.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; return; }
      let result = {}; try { result = await response.json(); } catch (e) {}
      if (!response.ok) throw new Error(result.error || result.message || `Failed to resume chat (${response.status})`);

      setChatPaused(false);
      setPausedChats(prev => { const s = new Set(prev); s.delete(selectedChat.id); return s; });
      await fetchChatHistory(true);
    } catch (err) { console.error('Error resuming chat:', err); alert(`Failed to resume automation: ${err.message}`); }
    finally { setTogglingPause(false); }
  };

  const handleTogglePause = () => chatPaused ? playChat() : pauseChat();

  // ── Helpers ──
  const getChatsGroupedByPlatform = () => {
    if (!chatData?.messages) return {};
    const grouped = {};
    Object.entries(chatData.messages).forEach(([key, messages]) => {
      const [platform, username] = key.split(':');
      if (!grouped[platform]) grouped[platform] = [];
      const latest = messages[messages.length - 1];
      const firstIncoming = messages.find(msg => msg.direction === 'incoming');
      grouped[platform].push({
        id: key, username,
        displayName: firstIncoming?.metadata?.username || username,
        avatar: firstIncoming?.metadata?.profile_pic_url || '/default-avatar.png',
        latestMessage: latest?.message || 'No messages',
        timestamp: latest?.timestamp,
        unreadCount: getUnreadCount(key), messages
      });
    });
    Object.keys(grouped).forEach(p => grouped[p].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    return grouped;
  };

  const getPlatformIcon = (p) => p === 'instagram' ? <Instagram className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filterChats = (chats) => {
    if (!searchQuery.trim()) return chats;
    const filtered = {};
    Object.entries(chats).forEach(([platform, list]) => {
      const f = list.filter(c => c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || c.username.toLowerCase().includes(searchQuery.toLowerCase()) || c.latestMessage.toLowerCase().includes(searchQuery.toLowerCase()));
      if (f.length > 0) filtered[platform] = f;
    });
    return filtered;
  };

  // ── Send message ──
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendingMessage || !selectedChat) return;
    setSendingMessage(true);
    const msg = messageInput.trim();
    const temp = { message: msg, direction: 'outgoing', timestamp: new Date().toISOString(), message_type: 'text', metadata: {}, temp: true };

    setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, temp] }));
    setMessageInput('');
    setTimeout(() => scrollToBottom(), 100);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      const username = selectedChat.id.replace('instagram:', '');

      const response = await fetch('https://api.automation365.io/send-message', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: username, message: msg, platform: 'instagram' })
      });
      if (response.status === 401) { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; return; }
      if (!response.ok) throw new Error(`Failed to send message (${response.status})`);

      setSelectedChat(prev => ({ ...prev, messages: prev.messages.map(m => m.temp && m.message === msg ? { ...m, temp: false } : m) }));
    } catch (err) {
      console.error('Error sending message:', err);
      setSelectedChat(prev => ({ ...prev, messages: prev.messages.filter(m => !m.temp) }));
      setMessageInput(msg);
      alert('Failed to send message. Please try again.');
    } finally { setSendingMessage(false); }
  };

  const handleBackToList = () => { setShowChatList(true); setShowChat(false); setSelectedChat(null); };
  const handleRefresh = () => fetchChatHistory();
  const filteredChats = filterChats(getChatsGroupedByPlatform());
  const getOrderedMessages = () => selectedChat?.messages ? [...selectedChat.messages] : [];

  return (
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-white rounded-lg shadow m-2 sm:m-6 overflow-hidden flex flex-col">
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
                <button onClick={handleRefresh} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Try Again</button>
              </div>
            </div>
          ) : (
            <div className="flex h-full overflow-hidden">
              {/* Chat List */}
              <div className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r h-full flex-col overflow-hidden`}>
                <div className="p-4 border-b flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Messages</h2>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-400'}`} title={socketConnected ? 'Real-time connected' : 'Reconnecting...'} />
                      <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh messages">
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {Object.keys(filteredChats).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{searchQuery ? 'No chats found' : 'No messages yet'}</p>
                    </div>
                  ) : Object.entries(filteredChats).map(([platform, chats]) => (
                    <div key={platform}>
                      {chats.map(chat => (
                        <div key={chat.id} onClick={() => handleChatSelect(chat.id, chat.displayName)} className="cursor-pointer">
                          <ChatItem name={chat.displayName} message={chat.latestMessage} time={formatTime(chat.timestamp)} avatar={chat.avatar} platform={platform} active={selectedChat?.id === chat.id} unreadCount={chat.unreadCount} platformIcon={getPlatformIcon(platform)} isPaused={pausedChats.has(chat.id)} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {isRefreshing && (
                  <div className="p-2 border-t bg-gray-50 flex items-center justify-center gap-2 flex-shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /><span className="text-sm text-gray-600">Refreshing...</span>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              <div className={`${showChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full overflow-hidden`}>
                {selectedChat ? (
                  <>
                    <div className="border-b flex-shrink-0">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button onClick={handleBackToList} className="md:hidden p-2 hover:bg-gray-100 rounded-lg -ml-2"><ArrowLeft className="w-5 h-5" /></button>
                            <div className="relative">
                              <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.src = '/default-avatar.png'; }} />
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                              <h3 className="font-medium">{selectedChat.name}</h3>
                              <div className="flex items-center gap-1 text-green-500 text-sm"><span>Active now</span>{getPlatformIcon(selectedChat.platform)}</div>
                            </div>
                          </div>
                          <button className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${chatPaused ? 'bg-green-50 border-green-300 hover:bg-green-100 text-green-700' : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 text-yellow-700'} ${togglingPause ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={handleTogglePause} disabled={togglingPause}>
                            {togglingPause ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div> : chatPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            <span className="hidden sm:inline">{togglingPause ? 'Loading...' : chatPaused ? 'Resume' : 'Pause'}</span>
                          </button>
                        </div>
                        {chatPaused && (
                          <div className="mt-2 px-3 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>Automation paused. Click "Resume" to enable automatic responses.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                      {selectedChat.messages?.length > 0 ? getOrderedMessages().map((msg, i) => (
                        <div key={`${msg.timestamp}_${i}_${msg.sender_id || 'no-id'}`} className={`flex gap-3 ${msg.direction === 'outgoing' ? 'justify-end' : ''} ${msg.temp ? 'opacity-70' : ''}`}>
                          {msg.direction === 'incoming' && <img src={selectedChat.avatar} alt={selectedChat.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover" onError={(e) => { e.target.src = '/default-avatar.png'; }} />}
                          <div className={`rounded-lg p-3 max-w-[80%] sm:max-w-md ${msg.direction === 'outgoing' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                            {msg.message_type === 'image' && msg.metadata?.image_url ? (
                              <><img src={msg.metadata.image_url} alt="Image" className="max-w-full rounded-lg mb-2" />{msg.message && <p>{msg.message}</p>}</>
                            ) : msg.message_type === 'video' && msg.metadata?.video_url ? (
                              <><video src={msg.metadata.video_url} controls className="max-w-full rounded-lg mb-2" />{msg.message && <p>{msg.message}</p>}</>
                            ) : (
                              <p className={msg.direction === 'outgoing' ? 'text-white' : ''}>{msg.message}</p>
                            )}
                            <div className={`flex items-center justify-between mt-1 ${msg.direction === 'outgoing' ? 'text-purple-200' : 'text-gray-500'}`}>
                              <p className="text-xs">{formatTime(msg.timestamp)}{msg.temp && <span className="ml-1">(Sending...)</span>}</p>
                              {msg.direction === 'outgoing' && !msg.temp && <span className="ml-2">{msg.metadata?.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}</span>}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8"><MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No messages in this conversation yet</p></div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                          <Mic className="w-5 h-5 text-gray-400 hidden sm:block cursor-pointer hover:text-gray-600" />
                          <input placeholder="Type a message..." className="flex-1 bg-transparent outline-none min-w-0" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} disabled={sendingMessage} />
                          <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                            <button className="hover:text-gray-600"><Paperclip className="w-5 h-5" /></button>
                            <button className="hover:text-gray-600 hidden sm:block"><Image className="w-5 h-5" /></button>
                            <button className="hover:text-gray-600 hidden sm:block"><Smile className="w-5 h-5" /></button>
                            <button className="hover:text-gray-600 hidden sm:block"><Calendar className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg disabled:opacity-50 flex-shrink-0" onClick={handleSendMessage} disabled={sendingMessage || !messageInput.trim()}>
                          {sendingMessage ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Send className="w-4 h-4" />}
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

const ChatItem = ({ name, message, time, avatar, platform, active, unreadCount, platformIcon, isPaused }) => (
  <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${active ? 'bg-purple-50' : ''}`}>
    <div className="relative flex-shrink-0">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.src = '/default-avatar.png'; }} />
      <span className="absolute -bottom-1 -right-1">{platformIcon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className={`font-medium truncate ${unreadCount > 0 ? 'font-semibold' : ''}`}>{name}</h3>
          {isPaused && <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Paused</span>}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
      </div>
      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{message}</p>
    </div>
    {unreadCount > 0 && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center flex-shrink-0">{unreadCount}</span>}
  </div>
);

export default Messages;