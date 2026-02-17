import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Instagram, Send, Paperclip, Smile, Image, Calendar, Mic, Pause, Play, ArrowLeft, MessageCircle, AlertCircle, RefreshCw, CheckCheck, Check, ChevronUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import Sidebar from '../Sidebar';
import Header from '../Header';

const API_BASE = 'https://api.automation365.io';
const INSTAGRAM_API = 'https://instagram.automation365.io';

const Messages = () => {
  const { socket, connected: socketConnected } = useSocket();

  // ── Conversation list state ──
  const [conversations, setConversations] = useState([]);
  const [conversationsCursor, setConversationsCursor] = useState(null);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // ── Selected chat state ──
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesCursor, setMessagesCursor] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

  // ── UI state ──
  const [showChatList, setShowChatList] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatPaused, setChatPaused] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);
  const [pausedChats, setPausedChats] = useState(new Set());

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedChatRef = useRef(null);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  // ── Helpers ──
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return null; }
    return token;
  };

  const handleAuthError = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !loadingOlderMessages) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, scrollToBottom, loadingOlderMessages]);

  // ──────────────────────────────────────────────
  // Socket: listen for real-time messages
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      console.log('[Socket] new_chat_message:', messageData);

      const newMessage = {
        _id: messageData._id || messageData.id || '',
        message: messageData.message || messageData.text || '',
        direction: messageData.direction || 'incoming',
        timestamp: messageData.timestamp || new Date().toISOString(),
        type: messageData.type || messageData.message_type || 'text',
        sender_id: messageData.sender_id || '',
      };

      const msgUsername = messageData.username || messageData.chat_with;
      const msgConversationId = messageData.conversation_id || messageData.chat_id;

      // Update conversation list — bump to top, update last_message
      setConversations(prev => {
        const updated = prev.map(conv => {
          const isMatch = (msgConversationId && conv._id === msgConversationId)
            || (msgUsername && conv.username === msgUsername);
          if (isMatch) {
            return {
              ...conv,
              last_message: newMessage.message,
              last_message_type: newMessage.type,
              timestamp: newMessage.timestamp,
              unread_count: (selectedChatRef.current?._id === conv._id || selectedChatRef.current?.username === conv.username)
                ? conv.unread_count
                : (conv.unread_count || 0) + 1,
            };
          }
          return conv;
        });
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      // If user is viewing this conversation, append message
      const current = selectedChatRef.current;
      if (current) {
        const isCurrentChat = (msgConversationId && current._id === msgConversationId)
          || (msgUsername && current.username === msgUsername);

        if (isCurrentChat) {
          setMessages(prev => {
            if (newMessage._id && prev.some(m => m._id === newMessage._id)) return prev;
            return [...prev, newMessage];
          });
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    };

    const handleNewNotification = (data) => {
      console.log('[Socket] new_notification:', data);
    };

    socket.on('new_chat_message', handleNewMessage);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_chat_message', handleNewMessage);
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────────
  // Fetch conversations list
  // ──────────────────────────────────────────────
  useEffect(() => { fetchConversations(); }, []);

  const fetchConversations = async (cursor = null, silent = false) => {
    try {
      if (!silent) setLoadingConversations(true);
      else setIsRefreshing(true);
      setError(null);

      const token = getToken();
      if (!token) return;

      let url = `${API_BASE}/conversations?limit=20`;
      if (cursor) url += `&cursor=${cursor}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) { handleAuthError(); return; }
      if (!response.ok) throw new Error(`Failed to fetch conversations (${response.status})`);

      const result = await response.json();
      console.log('Conversations response:', result);

      if (result.status === 'success' && result.data) {
        const newConversations = result.data.conversations || [];
        const pagination = result.data.pagination || {};

        if (cursor) {
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }

        setConversationsCursor(pagination.next_cursor || null);
        setHasMoreConversations(pagination.has_next || false);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (!silent) setError(err.message);
    } finally {
      setLoadingConversations(false);
      setIsRefreshing(false);
    }
  };

  // ──────────────────────────────────────────────
  // Fetch messages for a conversation
  // ──────────────────────────────────────────────
  const fetchMessages = async (conversationId, cursor = null) => {
    try {
      if (cursor) setLoadingOlderMessages(true);
      else setLoadingMessages(true);

      const token = getToken();
      if (!token) return;

      let url = `${API_BASE}/get_messages?conversation_id=${conversationId}`;
      if (cursor) url += `&cursor=${cursor}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) { handleAuthError(); return; }
      if (!response.ok) throw new Error(`Failed to fetch messages (${response.status})`);

      const result = await response.json();
      console.log('Messages response:', result);

      const newMessages = (result.messages || []).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      const pagination = result.pagination || {};

      if (cursor) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      setMessagesCursor(pagination.next_cursor || null);
      setHasMoreMessages(pagination.has_next || false);

      if (!cursor && result.profile_picture) {
        setSelectedChat(prev => prev ? { ...prev, avatar: result.profile_picture } : prev);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
      setLoadingOlderMessages(false);
    }
  };

  // ──────────────────────────────────────────────
  // Select a conversation
  // ──────────────────────────────────────────────
  const handleChatSelect = (conversation) => {
    const chat = {
      _id: conversation._id,
      username: conversation.username,
      name: conversation.username,
      avatar: conversation.profile_picture || '/default-avatar.png',
      platform: 'instagram',
      sender_id: conversation.sender_id || '',
    };

    setSelectedChat(chat);
    setShowChat(true);
    setMessages([]);
    setMessagesCursor(null);
    setHasMoreMessages(false);
    setChatPaused(pausedChats.has(conversation._id));

    // Reset unread count locally
    setConversations(prev =>
      prev.map(c => c._id === conversation._id ? { ...c, unread_count: 0 } : c)
    );

    fetchMessages(conversation._id);

    if (window.innerWidth <= 768) setShowChatList(false);
  };

  // ── Load older messages ──
  const loadOlderMessages = () => {
    if (!selectedChat?._id || !hasMoreMessages || loadingOlderMessages) return;
    const container = messagesContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;

    fetchMessages(selectedChat._id, messagesCursor).then(() => {
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - prevHeight;
        });
      }
    });
  };

  // ──────────────────────────────────────────────
  // Send message
  // ──────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendingMessage || !selectedChat) return;
    setSendingMessage(true);
    const msg = messageInput.trim();

    const temp = {
      _id: `temp_${Date.now()}`,
      message: msg,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      type: 'text',
      sender_id: '',
      temp: true,
    };

    setMessages(prev => [...prev, temp]);
    setMessageInput('');
    setTimeout(() => scrollToBottom(), 100);

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/send-message`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedChat.username, message: msg, platform: 'instagram' })
      });

      if (response.status === 401) { handleAuthError(); return; }
      if (!response.ok) throw new Error(`Failed to send message (${response.status})`);

      setMessages(prev => prev.map(m =>
        m._id === temp._id ? { ...m, temp: false, _id: '' } : m
      ));

      setConversations(prev => {
        const updated = prev.map(c =>
          c._id === selectedChat._id
            ? { ...c, last_message: msg, last_message_type: 'text', timestamp: new Date().toISOString() }
            : c
        );
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m._id !== temp._id));
      setMessageInput(msg);
      alert('Failed to send message. Please try again.');
    } finally { setSendingMessage(false); }
  };

  // ──────────────────────────────────────────────
  // Pause — optimistic, revert on failure
  // ──────────────────────────────────────────────
  const pauseChat = async () => {
    if (!selectedChat || togglingPause) return;
    setTogglingPause(true);
    setChatPaused(true);
    setPausedChats(prev => new Set([...prev, selectedChat._id]));

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${INSTAGRAM_API}/pause-chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedChat.username, sender_id: selectedChat.sender_id || null })
      });

      if (response.status === 401) { handleAuthError(); return; }
      let result = {}; try { result = await response.json(); } catch (e) {}
      if (!response.ok) {
        setChatPaused(false);
        setPausedChats(prev => { const s = new Set(prev); s.delete(selectedChat._id); return s; });
        throw new Error(result.error || result.message || `Failed to pause (${response.status})`);
      }
    } catch (err) {
      console.error('Error pausing:', err);
      alert(`Failed to pause: ${err.message}`);
    } finally { setTogglingPause(false); }
  };

  // ──────────────────────────────────────────────
  // Resume — optimistic, revert on failure
  // ──────────────────────────────────────────────
  const playChat = async () => {
    if (!selectedChat || togglingPause) return;
    setTogglingPause(true);
    setChatPaused(false);
    setPausedChats(prev => { const s = new Set(prev); s.delete(selectedChat._id); return s; });

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${INSTAGRAM_API}/play-chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedChat.username, sender_id: selectedChat.sender_id || null })
      });

      if (response.status === 401) { handleAuthError(); return; }
      let result = {}; try { result = await response.json(); } catch (e) {}
      if (!response.ok) {
        setChatPaused(true);
        setPausedChats(prev => new Set([...prev, selectedChat._id]));
        throw new Error(result.error || result.message || `Failed to resume (${response.status})`);
      }
    } catch (err) {
      console.error('Error resuming:', err);
      alert(`Failed to resume: ${err.message}`);
    } finally { setTogglingPause(false); }
  };

  const handleTogglePause = () => {
    if (togglingPause) return;
    chatPaused ? playChat() : pauseChat();
  };

  // ── Filtering ──
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c =>
        c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // ── Format time ──
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBackToList = () => { setShowChatList(true); setShowChat(false); setSelectedChat(null); setMessages([]); };
  const handleRefresh = () => fetchConversations(null, true);

  /*
   * ── MESSAGE ALIGNMENT ──
   * outgoing = bot/user's automated replies → LEFT side (gray bubble)
   * incoming = customer/client messages    → RIGHT side (purple bubble)
   */

  return (
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-1 bg-white rounded-lg shadow m-2 sm:m-6 overflow-hidden flex flex-col">
          {loadingConversations && conversations.length === 0 ? (
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
                <button onClick={() => fetchConversations()} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Try Again</button>
              </div>
            </div>
          ) : (
            <div className="flex h-full overflow-hidden">
              {/* ── Conversation List ── */}
              <div className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r h-full flex-col overflow-hidden`}>
                <div className="p-4 border-b flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Messages</h2>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-400'}`} title={socketConnected ? 'Real-time connected' : 'Reconnecting...'} />
                      <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
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
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{searchQuery ? 'No chats found' : 'No messages yet'}</p>
                    </div>
                  ) : (
                    <>
                      {filteredConversations.map(conv => (
                        <div key={conv._id || conv.username} onClick={() => handleChatSelect(conv)} className="cursor-pointer">
                          <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${selectedChat?.username === conv.username ? 'bg-purple-50' : ''}`}>
                            <div className="relative flex-shrink-0">
                              <img src={conv.profile_picture || '/default-avatar.png'} alt={conv.username} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.src = '/default-avatar.png'; }} />
                              <span className="absolute -bottom-1 -right-1"><Instagram className="w-4 h-4" /></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 className={`font-medium truncate ${conv.unread_count > 0 ? 'font-semibold' : ''}`}>{conv.username}</h3>
                                  {pausedChats.has(conv._id) && <span className="flex-shrink-0 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Paused</span>}
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(conv.timestamp)}</span>
                              </div>
                              <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                {conv.last_message || 'No messages'}
                              </p>
                            </div>
                            {conv.unread_count > 0 && (
                              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center flex-shrink-0">{conv.unread_count}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {hasMoreConversations && (
                        <button onClick={() => fetchConversations(conversationsCursor)} className="w-full p-3 text-sm text-purple-600 hover:bg-gray-50">
                          Load more conversations
                        </button>
                      )}
                    </>
                  )}
                </div>

                {isRefreshing && (
                  <div className="p-2 border-t bg-gray-50 flex items-center justify-center gap-2 flex-shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /><span className="text-sm text-gray-600">Refreshing...</span>
                  </div>
                )}
              </div>

              {/* ── Chat Area ── */}
              <div className={`${showChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full overflow-hidden`}>
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
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
                              <div className="flex items-center gap-1 text-green-500 text-sm">
                                <span>Active now</span><Instagram className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                          <button
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${chatPaused ? 'bg-green-50 border-green-300 hover:bg-green-100 text-green-700' : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 text-yellow-700'} ${togglingPause ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleTogglePause} disabled={togglingPause}
                          >
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

                    {/* Messages area */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                      {/* Load older messages */}
                      {hasMoreMessages && (
                        <div className="text-center">
                          <button onClick={loadOlderMessages} disabled={loadingOlderMessages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50">
                            {loadingOlderMessages ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div> : <ChevronUp className="w-4 h-4" />}
                            Load older messages
                          </button>
                        </div>
                      )}

                      {loadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg, i) => {
                          /*
                           * ALIGNMENT:
                           * outgoing (bot/user replies) → LEFT side, gray bubble
                           * incoming (customer messages) → RIGHT side, purple bubble
                           */
                          const isOutgoing = msg.direction === 'outgoing';
                          const isIncoming = msg.direction === 'incoming';

                          return (
                            <div
                              key={msg._id || `${msg.timestamp}_${i}`}
                              className={`flex gap-3 ${isIncoming ? 'justify-end' : 'justify-start'} ${msg.temp ? 'opacity-70' : ''}`}
                            >
                              {/* Bot avatar on left for outgoing (bot) messages */}
                              {isOutgoing && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                </div>
                              )}

                              <div className={`rounded-lg p-3 max-w-[80%] sm:max-w-md ${
                                isIncoming
                                  ? 'bg-purple-600 text-white'   /* Customer → right, purple */
                                  : 'bg-gray-100 text-gray-900'  /* Bot → left, gray */
                              }`}>
                                {/* Label */}
                                <p className={`text-xs font-medium mb-1 ${isIncoming ? 'text-purple-200' : 'text-gray-500'}`}>
                                  {isIncoming ? selectedChat.name : 'Bot'}
                                </p>

                                {msg.type === 'image' && msg.metadata?.image_url ? (
                                  <><img src={msg.metadata.image_url} alt="Image" className="max-w-full rounded-lg mb-2" />{msg.message && <p>{msg.message}</p>}</>
                                ) : msg.type === 'video' && msg.metadata?.video_url ? (
                                  <><video src={msg.metadata.video_url} controls className="max-w-full rounded-lg mb-2" />{msg.message && <p>{msg.message}</p>}</>
                                ) : (
                                  <p>{msg.message}</p>
                                )}

                                <div className={`flex items-center justify-between mt-1 ${isIncoming ? 'text-purple-200' : 'text-gray-500'}`}>
                                  <p className="text-xs">
                                    {formatTime(msg.timestamp)}
                                    {msg.temp && <span className="ml-1">(Sending...)</span>}
                                  </p>
                                  {isOutgoing && !msg.temp && (
                                    <span className="ml-2">{msg.metadata?.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}</span>
                                  )}
                                </div>
                              </div>

                              {/* Customer avatar on right for incoming messages */}
                              {isIncoming && (
                                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover" onError={(e) => { e.target.src = '/default-avatar.png'; }} />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No messages in this conversation yet</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
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

export default Messages;