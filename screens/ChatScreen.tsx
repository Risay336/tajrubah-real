import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GalleryImage, User } from '../types';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

const mockUser1: User = { id: 'lila@example.com', username: 'Lila', dob: '1998-05-12', avatar: 'https://picsum.photos/seed/lila/40/40' };
const mockUser2: User = { id: 'admin@example.com', username: 'Admin', dob: '1990-01-01', avatar: 'https://picsum.photos/seed/admin/40/40' };

const initialMessages: Omit<ChatMessage, 'isMe'>[] = [
  { id: 1, user: mockUser2, text: 'Welcome to the global chat! Be nice and have fun.', timestamp: '10:00 AM' },
  { id: 2, user: mockUser1, text: 'Hey everyone! This app is so pretty!', timestamp: '10:01 AM' },
];

interface ChatScreenProps {
    replyingToImage: GalleryImage | null;
    onClearReply: () => void;
    onViewImage: (imageId: number) => void;
    onViewProfile: (user: User) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ replyingToImage, onClearReply, onViewImage, onViewProfile }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    initialMessages.map(msg => ({ ...msg, isMe: msg.user.id === currentUser!.id }))
  );
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now(),
      user: currentUser,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      repliedToImage: replyingToImage || undefined,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    onClearReply();
  };

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm">
       <header className="bg-black/30 p-4 text-white text-center shadow-md">
            <h1 className="text-xl font-bold">{t('chat_title')}</h1>
        </header>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 my-4 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            {!msg.isMe && 
                <button onClick={() => onViewProfile(msg.user)}>
                    <img src={msg.user.avatar} alt={msg.user.username} className="w-8 h-8 rounded-full" />
                </button>
            }
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
              {!msg.isMe && 
                <button onClick={() => onViewProfile(msg.user)} className="text-sm font-bold text-blue-300 hover:underline">
                    {msg.user.username}
                </button>
              }
              {msg.repliedToImage && (
                <button
                    onClick={() => onViewImage(msg.repliedToImage!.id)}
                    className="mb-2 p-2 bg-black/20 rounded-lg flex items-center gap-2 w-full text-left hover:bg-black/40 transition-colors"
                >
                    <img src={msg.repliedToImage.src} alt="replied content" className="w-10 h-10 object-cover rounded-md flex-shrink-0"/>
                    <div className="overflow-hidden">
                        <p className="text-xs text-gray-300 italic truncate">{t('replied_to_image', { user: msg.repliedToImage.user })}</p>
                    </div>
                </button>
              )}
              <p className="text-md">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
            </div>
            {msg.isMe && 
                 <button onClick={() => onViewProfile(msg.user)}>
                    <img src={msg.user.avatar} alt={msg.user.username} className="w-8 h-8 rounded-full" />
                </button>
            }
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-black/30 border-t border-white/10">
        {replyingToImage && (
            <div className="bg-gray-700/50 p-2 rounded-t-lg flex justify-between items-center animate-fade-in-down">
                <div className="flex items-center gap-2 overflow-hidden">
                    <img src={replyingToImage.src} alt="reply thumbnail" className="w-10 h-10 object-cover rounded flex-shrink-0" />
                    <div className="text-sm overflow-hidden">
                        <p className="text-gray-300 truncate">{t('replying_to')}</p>
                        <p className="font-semibold text-white truncate">{t('an_image_by', { user: replyingToImage.user })}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClearReply}
                    className="p-1 text-gray-400 hover:text-white flex-shrink-0 ml-2"
                    aria-label={t('cancel_reply')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('type_a_message')}
            className={`w-full bg-gray-700 text-white py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${replyingToImage ? 'rounded-b-full' : 'rounded-full'}`}
          />
          <button type="submit" className="bg-blue-600 rounded-full p-3 text-white hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </form>
       <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default ChatScreen;