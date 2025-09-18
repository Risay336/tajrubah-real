export enum Screen {
  Home = 'HOME',
  Calculator = 'CALCULATOR',
  Chat = 'CHAT',
  Translator = 'TRANSLATOR',
  Gallery = 'GALLERY',
}

export interface User {
  id: string; // email
  username: string;
  dob: string; // YYYY-MM-DD
  avatar: string; // Data URL
}

export interface ChatMessage {
  id: number;
  user: User;
  text: string;
  timestamp: string;
  isMe: boolean;
  repliedToImage?: GalleryImage;
  translation?: string;
}

export interface SavedSticker {
    src: string;
    aspectRatio: number;
}

export interface PlacedSticker extends SavedSticker {
    id: number;
    x: number; // percent
    y: number; // percent
    width: number; // percent
}

export interface GalleryImage {
  id: number;
  src: string;
  user: string;
  isFavorite?: boolean;
  stickers?: PlacedSticker[];
}

// Settings Types
export type Language = 'en' | 'id' | 'ar';

export type ThemeColor = {
  name: string;
  gradient: string;
  main: string;
};

export interface ThemeSettings {
  home: ThemeColor;
  calculator: ThemeColor;
  translator: ThemeColor;
}

export type ClockFont = 'font-nunito' | 'font-roboto-mono' | 'font-pacifico';
export type ClockPosition = 'center' | 'start' | 'end';

export interface ClockSettings {
  font: ClockFont;
  position: ClockPosition;
}

export interface ChatSettings {
  wallpaper: string;
  myBubbleColor: string;
  otherBubbleColor: string;
  textSize: 'text-sm' | 'text-base' | 'text-lg';
  anonymousMode: boolean;
  autoTranslate: boolean;
  translateToLang: Language;
  translateScope: 'all' | 'hour' | 'future' | null;
}


export interface Settings {
  language: Language;
  theme: ThemeSettings;
  clock: ClockSettings;
  chat: ChatSettings;
  scientificCalculator: boolean;
}

// Music Types
export interface Track {
    name: string;
    url: string; // This will be a blob URL
}

export type PlaybackMode = 'repeat_one' | 'repeat_all' | 'off';