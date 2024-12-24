import { useState, useEffect, useRef } from 'react';
import io from "socket.io-client";
import { nanoid } from "nanoid";

const socket = io.connect("http://localhost:5000");

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [room, setRoom] = useState('');
  const [userName] = useState(nanoid(4));
  const [currentRoom, setCurrentRoom] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or system preference
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const chatBoxRef = useRef(null);

  // Update dark mode in localStorage and document
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Socket connection handling
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      setError('');
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      setError('Failed to connect to server');
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });

    socket.on("userCount", (count) => {
      setOnlineUsers(count);
    });

    socket.on("chat", (payload) => {
      setChat((prevChat) => [...prevChat, {
        ...payload,
        timestamp: new Date().toLocaleTimeString()
      }]);
    });

    socket.on("roomError", (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat");
      socket.off("userCount");
      socket.off("roomError");
    };
  }, []);

  const sendChat = (e) => {
    e.preventDefault();
    if (message.trim() && currentRoom) {
      socket.emit("chat", {
        message,
        userName,
        room: currentRoom,
        timestamp: new Date().toLocaleTimeString()
      });
      setMessage('');
    }
  };

  const handleRoom = (action) => {
    if (room.trim()) {
      socket.emit(action, room);
      setCurrentRoom(room);
      setRoom('');
      setError('');
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socket.emit("leaveRoom", currentRoom);
      setCurrentRoom('');
      setChat([]);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="p-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat App</h1>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          {/* Connection Status */}
          <div className="mb-4 text-center">
            <span className={`inline-block px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="ml-4 text-gray-600 dark:text-gray-300">
              Online Users: {onlineUsers}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {!currentRoom ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter room name"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={() => handleRoom("createRoom")}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Create Room
                </button>
                <button
                  onClick={() => handleRoom("joinRoom")}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Room: {currentRoom}</h2>
                <button
                  onClick={leaveRoom}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Leave Room
                </button>
              </div>

              <div 
                ref={chatBoxRef}
                className="h-96 overflow-y-auto border rounded p-4 mb-4 dark:border-gray-600"
              >
                {chat.map((payload, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      payload.userName === userName
                        ? 'text-right'
                        : payload.userName === 'System'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[70%] rounded-lg p-3 ${
                        payload.userName === userName
                          ? 'bg-blue-500 text-white'
                          : payload.userName === 'System'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="break-words">{payload.message}</p>
                      <div className={`text-xs mt-1 ${
                        payload.userName === userName 
                          ? 'text-blue-100' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {payload.userName !== 'System' && `${payload.userName} • `}
                        {payload.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendChat} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;