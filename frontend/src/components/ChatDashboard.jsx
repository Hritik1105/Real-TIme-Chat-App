import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogOut, Hash, Send, Plus, Users, Search, Moon, Sun } from 'lucide-react';

export default function ChatDashboard() {
    const { user, token, logout } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showNewRoomInput, setShowNewRoomInput] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    // Strip trailing slash if present
    const rawApiUrl = import.meta.env.VITE_API_URL || 'https://chat-backend-k7aj.onrender.com';
    const API_URL = rawApiUrl.replace(/\/+$/, '');
    const WS_URL = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, 'ws');

    // Theme setup
    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Fetch initial data
    useEffect(() => {
        fetchRooms();
        fetchOnlineUsers();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get(`${API_URL}/chat/rooms`);
            setRooms(res.data);
            if (res.data.length > 0 && !activeRoom) {
                setActiveRoom(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOnlineUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/online`);
            setOnlineUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        try {
            const res = await axios.post(`${API_URL}/chat/rooms`, { name: newRoomName, is_group: true });
            setRooms([...rooms, res.data]);
            setNewRoomName('');
            setShowNewRoomInput(false);
            setActiveRoom(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // WebSocket logic
    useEffect(() => {
        if (!token) return;
        ws.current = new WebSocket(`${WS_URL}/chat/ws/${token}`);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message') {
                if (activeRoom && data.room_id === activeRoom.id) {
                    setMessages((prev) => [...prev, data]);
                }
            } else if (data.type === 'status') {
                // handle someone went offline
                fetchOnlineUsers(); // Simple polling refetch for demo
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [token, activeRoom]);

    // Fetch messages when room changes
    useEffect(() => {
        if (activeRoom) {
            const fetchMessages = async () => {
                try {
                    const res = await axios.get(`${API_URL}/chat/rooms/${activeRoom.id}/messages`);
                    setMessages(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchMessages();
        }
    }, [activeRoom]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom || !ws.current) return;

        const msgData = {
            type: 'chat_message',
            content: newMessage,
            room_id: activeRoom.id
        };

        ws.current.send(JSON.stringify(msgData));
        setNewMessage('');
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        // Could implement typing indicator emission here
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 border-t-4 border-blue-500">
            {/* Sidebar View */}
            <div className="w-1/4 min-w-[280px] bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
                    <div className="font-bold text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Users className="w-6 h-6" /> ChatApp
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                    {/* User Profile View */}
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">{user?.username}</h3>
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-red-500">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Rooms List */}
                    <div className="mb-4 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rooms</h4>
                        <button onClick={() => setShowNewRoomInput(!showNewRoomInput)} className="text-blue-500 hover:text-blue-600 p-1">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {showNewRoomInput && (
                        <form onSubmit={handleCreateRoom} className="mb-4 flex gap-2">
                            <input
                                type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                                placeholder="Room name" className="flex-1 px-3 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" autoFocus
                            />
                            <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">Add</button>
                        </form>
                    )}

                    <div className="space-y-1">
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room)}
                                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${activeRoom?.id === room.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                <Hash className="w-4 h-4 opacity-50" />
                                {room.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
                {activeRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center shadow-sm z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <Hash className="w-6 h-6 text-gray-400" />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{activeRoom.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created {new Date(activeRoom.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user?.id;
                                // Simple way to format time
                                const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                                return (
                                    <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                {isMe ? user.username[0].toUpperCase() : 'U'}
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'}`}>
                                                <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[11px] text-gray-400 mt-1 ${isMe ? 'mr-10' : 'ml-10'}`}>{time}</span>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder={`Message #${activeRoom.name}...`}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                        <Users className="w-16 h-16 text-gray-300 mb-4" />
                        <h2 className="text-xl font-medium">Select a room to start chatting</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
