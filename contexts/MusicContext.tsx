import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Track, PlaybackMode } from '../types';

interface MusicContextType {
  playlist: Track[];
  currentTrack: Track | null;
  currentTrackIndex: number | null;
  isPlaying: boolean;
  volume: number;
  playbackMode: PlaybackMode;
  addTrack: (track: Track) => void;
  removeTrack: (index: number) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (volume: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('repeat_all');

  useEffect(() => {
    try {
      const storedPlaylist = localStorage.getItem('sayangku-playlist');
      if (storedPlaylist) {
        setPlaylist(JSON.parse(storedPlaylist));
      }
    } catch (error) {
      console.error("Failed to load playlist from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
      try {
        const playlistToStore = playlist.map(t => ({name: t.name})); // Don't store blob URLs
        localStorage.setItem('sayangku-playlist', JSON.stringify(playlistToStore));
      } catch (error) {
          console.error("Failed to save playlist to localStorage", error);
      }
  }, [playlist])


  const addTrack = (track: Track) => {
    setPlaylist(prev => [...prev, track]);
    if (currentTrackIndex === null) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
    }
  };

  const removeTrack = (index: number) => {
    if (index === currentTrackIndex) {
        if (playlist.length === 1) {
            setCurrentTrackIndex(null);
            setIsPlaying(false);
        } else {
            playNext();
        }
    }
    setPlaylist(prev => prev.filter((_, i) => i !== index));
  };
  
  const playTrack = (index: number) => {
      if(index === currentTrackIndex) {
          togglePlay();
      } else {
          setCurrentTrackIndex(index);
          setIsPlaying(true);
      }
  }

  const togglePlay = () => {
    if (currentTrackIndex !== null) {
      setIsPlaying(prev => !prev);
    } else if (playlist.length > 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(prev => {
        if (prev === null) return 0;
        return (prev + 1) % playlist.length;
    });
    setIsPlaying(true);
  }, [playlist.length]);

  const playPrev = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(prev => {
        if (prev === null) return 0;
        return (prev - 1 + playlist.length) % playlist.length;
    });
    setIsPlaying(true);
  };
  
  const reorderPlaylist = (fromIndex: number, toIndex: number) => {
      setPlaylist(prev => {
          const newPlaylist = [...prev];
          const [movedItem] = newPlaylist.splice(fromIndex, 1);
          newPlaylist.splice(toIndex, 0, movedItem);
          return newPlaylist;
      });
  };


  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  return (
    <MusicContext.Provider value={{
      playlist,
      currentTrack,
      currentTrackIndex,
      isPlaying,
      volume,
      playbackMode,
      addTrack,
      removeTrack,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      setVolume,
      setPlaybackMode,
      reorderPlaylist
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};