import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GalleryImage, User, Language } from '../types';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { translateText } from '../services/geminiService';

const mockUser1: User = { id: 'lila@example.com', username: 'Lila', dob: '1998-05-12', avatar: 'https://picsum.photos/seed/lila/40/40' };
const mockUser2: User = { id: 'admin@example.com', username: 'Admin', dob: '1990-01-01', avatar: 'https://picsum.photos/seed/admin/40/40' };
const anonymousUser: User = { id: 'anonymous', username: 'Anonymous', dob: '0000-00-00', avatar: 'https://picsum.photos/seed/anon/40/40' };

const initialMessages: Omit<ChatMessage, 'isMe'>[] = [
  { id: 1, user: mockUser2, text: 'Welcome to the global chat! Be nice and have fun.', timestamp: '10:00 AM' },
  { id: 2, user: mockUser1, text: 'Hey everyone! <b>This app is so pretty!</b>', timestamp: '10:01 AM' },
  { id: 3, user: mockUser2, text: 'I agree! I love that you can <font color="#22C55E">color your text</font>.', timestamp: '10:02 AM' },
  { id: 4, user: mockUser1, text: 'And you can hide spoilers too! <spoiler>The hero wins in the end.</spoiler>', timestamp: '10:03 AM' },
];

interface ChatScreenProps {
    replyingToImage: GalleryImage | null;
    onClearReply: () => void;
    onViewImage: (imageId: number) => void;
    onViewProfile: (user: User) => void;
}

interface ChatInputToolbarProps {
    onFormat: (format: string, value?: string) => void;
    activeFormats: Set<string>;
    activeColor: string;
    showColorPicker: boolean;
    setShowColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatInputToolbar: React.FC<ChatInputToolbarProps> = ({ onFormat, activeFormats, activeColor, showColorPicker, setShowColorPicker }) => {
    const { t } = useTranslation();
    const colors = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'];

    const handleFormat = (e: React.MouseEvent, format: string, value?: string) => {
        e.preventDefault(); // Prevent editor from losing focus
        onFormat(format, value);
    }
    
    const handleColorSelect = (e: React.MouseEvent, color: string) => {
        e.preventDefault();
        onFormat('foreColor', color);
        setShowColorPicker(false);
    }

    const getButtonClass = (format: string) => {
        return `p-2 rounded hover:bg-white/10 ${activeFormats.has(format) ? 'bg-blue-500/50' : ''}`;
    }

    return (
        <div className="relative flex items-center gap-1 bg-gray-800/50 p-1 rounded-t-lg border-b border-white/10 animate-fade-in-down-fast">
            <button type="button" title={t('bold')} onMouseDown={(e) => handleFormat(e, 'bold')} className={getButtonClass('b')}><b>B</b></button>
            <button type="button" title={t('italic')} onMouseDown={(e) => handleFormat(e, 'italic')} className={getButtonClass('i')}><i>I</i></button>
            <button type="button" title={t('underline')} onMouseDown={(e) => handleFormat(e, 'underline')} className={getButtonClass('u')}><ins>U</ins></button>
            <button type="button" title={t('strikethrough')} onMouseDown={(e) => handleFormat(e, 'strikeThrough')} className={getButtonClass('s')}><del>S</del></button>
            <button type="button" title={t('spoiler')} onMouseDown={(e) => handleFormat(e, 'spoiler')} className={getButtonClass('spoiler')}>[ ! ]</button>
            
            <div className="flex items-center overflow-hidden">
                <button 
                    type="button" 
                    title={t('text_color')} 
                    onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(p => !p); }} 
                    className="p-2 rounded hover:bg-white/10 flex items-center gap-1.5"
                >
                    <span className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: activeColor }}></span>
                </button>
                <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${showColorPicker ? 'max-w-xs ml-2' : 'max-w-0 ml-0'}`}>
                    {colors.map(color => (
                        <button
                            type="button"
                            key={color}
                            style={{ backgroundColor: color }}
                            className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0 transform transition-transform hover:scale-110"
                            onMouseDown={(e) => handleColorSelect(e, color)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// Color utility functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getSpoilerColor = (bubbleColorHex: string): string => {
    const rgb = hexToRgb(bubbleColorHex);
    if (!rgb) return '#6B7280'; // Default gray if color is invalid

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    
    // Increased contrast factor: If the color is dark, make spoiler lighter. If light, make it darker.
    const factor = luminance < 0.5 ? 1.8 : 0.5;

    const r = Math.min(255, Math.round(rgb.r * factor));
    const g = Math.min(255, Math.round(rgb.g * factor));
    const b = Math.min(255, Math.round(rgb.b * factor));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};


const ChatScreen: React.FC<ChatScreenProps> = ({ replyingToImage, onClearReply, onViewImage, onViewProfile }) => {
  const { user: currentUser } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    initialMessages.map(msg => ({ ...msg, isMe: msg.user.id === currentUser!.id }))
  );
  const [newMessage, setNewMessage] = useState('');
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [isTranslating, setIsTranslating] = useState<Set<number>>(new Set());
  const [selectionActive, setSelectionActive] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [activeColor, setActiveColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const formattingContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
      const translateMessage = async (msg: ChatMessage) => {
          if (isTranslating.has(msg.id) || translations[msg.id] || msg.isMe) return;

          setIsTranslating(prev => new Set(prev).add(msg.id));
          try {
              const result = await translateText(msg.text, "auto", settings.chat.translateToLang);
              setTranslations(prev => ({...prev, [msg.id]: result}));
          } catch (error) {
              console.error("Translation error:", error);
          } finally {
              setIsTranslating(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(msg.id);
                  return newSet;
              });
          }
      };

      if (settings.chat.autoTranslate) {
          messages.forEach(msg => {
              if (settings.chat.translateScope === 'future' && msg.id < Date.now() - 5000) return;
              if (settings.chat.translateScope === 'hour' && msg.id < Date.now() - 10000) return; 
              translateMessage(msg);
          });
      }
  }, [messages, settings.chat.autoTranslate, settings.chat.translateScope, settings.chat.translateToLang, isTranslating, translations]);
  
  const rgbToHex = (rgb: string) => {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#FFFFFF';
    const componentToHex = (c: string) => {
        const hex = parseInt(c).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${componentToHex(match[1])}${componentToHex(match[2])}${componentToHex(match[3])}`.toUpperCase();
  };

  const updateToolbarState = () => {
    const selection = window.getSelection();
     if (!selection || !editorRef.current?.contains(selection.anchorNode)) {
        return;
    }
    setSelectionActive(!selection.isCollapsed);

    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('b');
    if (document.queryCommandState('italic')) formats.add('i');
    if (document.queryCommandState('underline')) formats.add('u');
    if (document.queryCommandState('strikeThrough')) formats.add('s');
    
    let node = selection.anchorNode;
    if (node) {
        if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentNode!;
        while (node && editorRef.current?.contains(node)) {
            if (node instanceof HTMLElement && node.dataset.spoiler === 'true') {
                formats.add('spoiler');
                break;
            }
            node = node.parentNode!;
        }
    }
    
    // Color check
    const colorValue = document.queryCommandValue('foreColor');
    if (colorValue.startsWith('rgb')) {
        setActiveColor(rgbToHex(colorValue));
    } else if (colorValue.match(/^#[0-9a-f]{6}$/i)) {
        setActiveColor(colorValue.toUpperCase());
    } else {
        setActiveColor('#FFFFFF'); // Default color if none is found
    }

    setActiveFormats(formats);
  };
  
  const getSpoilerParent = (node: Node | null): HTMLElement | null => {
      while(node && editorRef.current && editorRef.current.contains(node)) {
          if (node instanceof HTMLElement && node.dataset.spoiler === 'true') {
              return node;
          }
          node = node.parentNode;
      }
      return null;
  }

  const applyFormat = (format: string, value?: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();

      const simpleCommands: Record<string, string> = { 'bold': 'bold', 'italic': 'italic', 'underline': 'underline', 'strikeThrough': 'strikeThrough', 'foreColor': 'foreColor' };
      const selection = window.getSelection();
      if (!selection) return;

      if (simpleCommands[format]) {
          document.execCommand(simpleCommands[format], false, value);
      } else if (format === 'spoiler') {
          const spoilerParent = getSpoilerParent(selection.anchorNode);
          if (spoilerParent) {
              // Unwrap: replace the spoiler node with its children
              spoilerParent.replaceWith(...Array.from(spoilerParent.childNodes));
          } else if (!selection.isCollapsed) {
              // Wrap
              const range = selection.getRangeAt(0);
              const spoilerNode = document.createElement('span');
              spoilerNode.className = 'spoiler-in-editor';
              spoilerNode.dataset.spoiler = 'true';
              spoilerNode.appendChild(range.extractContents());
              range.insertNode(spoilerNode);
              selection.collapseToEnd();
          }
      }
      
      setNewMessage(editor.innerHTML);
      updateToolbarState();
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor || !editor.textContent?.trim() || !currentUser) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;

    tempDiv.querySelectorAll('span.spoiler-in-editor').forEach(node => {
        const spoilerTag = document.createElement('spoiler');
        spoilerTag.innerHTML = node.innerHTML;
        node.parentNode?.replaceChild(spoilerTag, node);
    });

    const textToSend = tempDiv.innerHTML;

    const message: ChatMessage = {
      id: Date.now(),
      user: settings.chat.anonymousMode ? anonymousUser : currentUser,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      repliedToImage: replyingToImage || undefined,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    editor.innerHTML = '';
    onClearReply();
  };
  
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage(e);
      }
  };
  
  const handleFormattingContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setSelectionActive(false);
        setShowColorPicker(false);
    }
  };

  const renderFormattedText = (text: string, bubbleColor: string) => {
    const spoilerBgColor = getSpoilerColor(bubbleColor);
    const sanitized = text
        .replace(/<script.*?>.*?<\/script>/gi, '')
        .replace(/<spoiler>(.*?)<\/spoiler>/g, `<span class="spoiler" style="background-color: ${spoilerBgColor};" onclick="this.classList.toggle('revealed')">$1</span>`);

    return { __html: sanitized };
  };

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm" style={{ 
        backgroundImage: `url(${settings.chat.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }}>
       <div className="absolute inset-0 bg-black/40"></div>
       <header className="relative bg-black/30 p-4 text-white text-center shadow-md z-10">
            <h1 className="text-xl font-bold">{t('chat_title')}</h1>
       </header>
      <div className="relative flex-grow p-4 overflow-y-auto z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end my-4 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            {!msg.isMe && 
                <button onClick={() => onViewProfile(msg.user)} className="mr-3 flex-shrink-0">
                    <img src={msg.user.avatar} alt={msg.user.username} className="w-8 h-8 rounded-full" />
                </button>
            }
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-white ${msg.isMe ? 'rounded-br-none' : 'rounded-bl-none'}`} style={{ backgroundColor: msg.isMe ? settings.chat.myBubbleColor : settings.chat.otherBubbleColor }}>
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
              <div className={`${settings.chat.textSize} chat-content`} dangerouslySetInnerHTML={renderFormattedText(msg.text, msg.isMe ? settings.chat.myBubbleColor : settings.chat.otherBubbleColor)} />
              {translations[msg.id] && (
                <div className="border-t border-white/20 mt-2 pt-2">
                    <div className={`text-xs italic text-gray-300 chat-content`} dangerouslySetInnerHTML={renderFormattedText(translations[msg.id], msg.isMe ? settings.chat.myBubbleColor : settings.chat.otherBubbleColor)} />
                </div>
              )}
              <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
            </div>
            {msg.isMe && !settings.chat.anonymousMode &&
                 <button onClick={() => onViewProfile(msg.user)} className="ml-3 flex-shrink-0">
                    <img src={msg.user.avatar} alt={msg.user.username} className="w-8 h-8 rounded-full" />
                </button>
            }
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="relative z-10">
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
            <div
                ref={formattingContainerRef}
                onBlur={handleFormattingContainerBlur}
                className="bg-gray-700 text-white rounded-xl overflow-hidden"
            >
            {(selectionActive || showColorPicker) && <ChatInputToolbar onFormat={applyFormat} activeFormats={activeFormats} activeColor={activeColor} showColorPicker={showColorPicker} setShowColorPicker={setShowColorPicker}/>}
            <div className="flex items-center gap-2 p-2">
            <div
                ref={editorRef}
                contentEditable="true"
                onInput={(e) => setNewMessage(e.currentTarget.innerHTML)}
                data-placeholder={t('type_a_message')}
                className="w-full bg-transparent py-2 px-3 focus:outline-none resize-none max-h-24 overflow-y-auto custom-editor"
                onKeyUp={updateToolbarState}
                onMouseUp={updateToolbarState}
                onFocus={updateToolbarState}
                onKeyDown={handleEditorKeyDown}
            />
            <button type="submit" className="bg-blue-600 rounded-full p-3 text-white hover:bg-blue-700 transition-colors self-end">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
            </div>
            </div>
        </form>
      </div>
       <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
             @keyframes fade-in-down-fast {
                0% { opacity: 0; transform: translateY(-5px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            .animate-fade-in-down-fast { animation: fade-in-down-fast 0.2s ease-out forwards; }
            
            .custom-editor:empty:before {
                content: attr(data-placeholder);
                color: #9ca3af; /* gray-400 */
                pointer-events: none;
            }

            .spoiler-in-editor {
                background-color: #4B5563;
                color: white;
                border-radius: 4px;
                padding: 0 4px;
            }
            
            .chat-content .spoiler {
                color: transparent;
                border-radius: 4px;
                padding: 2px 4px;
                transition: all 0.2s ease-out;
                cursor: pointer;
            }
            .chat-content .spoiler.revealed {
                color: inherit;
                background-color: transparent !important;
            }
        `}</style>
    </div>
  );
};

export default ChatScreen;