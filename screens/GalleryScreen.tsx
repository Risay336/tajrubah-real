import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GalleryImage, PlacedSticker, SavedSticker } from '../types';
import useTranslation from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

const initialImages: GalleryImage[] = [
  { id: 1, src: 'https://picsum.photos/seed/gallery1/500/500', user: 'Alex', isFavorite: false, stickers: [] },
  { id: 2, src: 'https://picsum.photos/seed/gallery2/500/500', user: 'Bella', isFavorite: true, stickers: [] },
  { id: 3, src: 'https://picsum.photos/seed/gallery3/500/500', user: 'Chris', isFavorite: false, stickers: [] },
  { id: 4, src: 'https://picsum.photos/seed/gallery4/500/500', user: 'Dana', isFavorite: false, stickers: [] },
];

type InteractionState = {
    type: 'move' | 'resize';
    stickerId: number;
    startX: number;
    startY: number;
    startStickerX: number;
    startStickerY: number;
    startStickerWidth: number;
} | null;

interface GalleryScreenProps {
    onReplyToImage: (image: GalleryImage) => void;
    viewImageId: number | null;
    onClearViewImageId: () => void;
}

const GalleryScreen: React.FC<GalleryScreenProps> = ({ onReplyToImage, viewImageId, onClearViewImageId }) => {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  
  // Fullscreen editor state
  const [isColorInverted, setIsColorInverted] = useState(false);
  const [isImageMirrored, setIsImageMirrored] = useState(false);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [savedStickers, setSavedStickers] = useState<SavedSticker[]>([]);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [interaction, setInteraction] = useState<InteractionState>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleImageClick = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
    // Reset editor state and load stickers
    setIsColorInverted(false);
    setIsImageMirrored(false);
    setPlacedStickers(image.stickers || []);
  }, []);

  useEffect(() => {
    if (viewImageId) {
      const imageToView = images.find(img => img.id === viewImageId);
      if (imageToView) {
        handleImageClick(imageToView);
      }
      onClearViewImageId(); // Clear the ID so it doesn't trigger again
    }
  }, [viewImageId, images, onClearViewImageId, handleImageClick]);

  useEffect(() => {
    try {
      const storedStickers = localStorage.getItem('sayangku-stickers');
      if (storedStickers) {
        setSavedStickers(JSON.parse(storedStickers));
      }
    } catch (error) {
      console.error("Failed to load stickers from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sayangku-stickers', JSON.stringify(savedStickers));
    } catch (error) {
      console.error("Failed to save stickers to localStorage", error);
    }
  }, [savedStickers]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: GalleryImage = {
          id: Date.now(),
          src: reader.result as string,
          user: user?.username || 'You',
          isFavorite: false,
          stickers: [],
        };
        setImages(prevImages => [newImage, ...prevImages]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleStickerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const newSticker: SavedSticker = {
                src: img.src,
                aspectRatio: img.width / img.height,
            };
            setSavedStickers(prev => [...prev, newSticker]);
            placeSticker(newSticker);
            setIsStickerPickerOpen(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const placeSticker = (sticker: SavedSticker) => {
    const newPlacedSticker: PlacedSticker = {
        ...sticker,
        id: Date.now(),
        x: 50,
        y: 50,
        width: 20,
    };
    setPlacedStickers(prev => [...prev, newPlacedSticker]);
  }

  const removeSticker = (idToRemove: number) => {
    setPlacedStickers(prev => prev.filter(sticker => sticker.id !== idToRemove));
  };

  const handleCloseFullscreen = () => {
    if (selectedImage) {
        // Save stickers back to the image in the main list
        setImages(prevImages => prevImages.map(img => 
            img.id === selectedImage.id ? { ...img, stickers: placedStickers } : img
        ));
    }
    setSelectedImage(null);
  };

  const toggleFavorite = (id: number) => {
    setImages(currentImages =>
      currentImages.map(img =>
        img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
      )
    );
    if (selectedImage && selectedImage.id === id) {
      setSelectedImage(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleInteractionStart = (
    e: React.MouseEvent<HTMLDivElement>,
    stickerId: number,
    type: 'move' | 'resize'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const sticker = placedStickers.find(s => s.id === stickerId);
    if (!sticker) return;
    setInteraction({
        type,
        stickerId,
        startX: e.clientX,
        startY: e.clientY,
        startStickerX: sticker.x,
        startStickerY: sticker.y,
        startStickerWidth: sticker.width,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interaction || !imageContainerRef.current) return;
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - interaction.startX) / containerRect.width) * 100;
    const dy = ((e.clientY - interaction.startY) / containerRect.height) * 100;

    setPlacedStickers(prevStickers => prevStickers.map(sticker => {
        if (sticker.id === interaction.stickerId) {
            const newSticker = { ...sticker };
            if (interaction.type === 'move') {
                newSticker.x = interaction.startStickerX + dx;
                newSticker.y = interaction.startStickerY + dy;
            } else if (interaction.type === 'resize') {
                const newWidth = interaction.startStickerWidth + dx;
                newSticker.width = Math.max(5, newWidth); // min width 5%
            }
            return newSticker;
        }
        return sticker;
    }));
  }, [interaction]);

  const handleMouseUp = useCallback(() => {
    setInteraction(null);
  }, []);

  useEffect(() => {
    if (interaction) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interaction, handleMouseMove, handleMouseUp]);


  const displayedImages = viewMode === 'favorites' ? images.filter(img => img.isFavorite) : images;

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm">
      <header className="bg-black/30 p-4 text-white text-center shadow-md flex justify-between items-center">
        <div className="w-12"></div>
        <h1 className="text-xl font-bold">{t('gallery_title')}</h1>
        <div className="flex items-center gap-2">
            <button onClick={() => setViewMode(viewMode === 'all' ? 'favorites' : 'all')} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label={t('toggle_favorites_view')}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${viewMode === 'favorites' ? 'text-pink-400' : 'text-white'}`} fill={viewMode === 'favorites' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
            </button>
            <button onClick={handleUploadClick} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors" aria-label={t('upload_image')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <input type="file" ref={stickerInputRef} onChange={handleStickerFileChange} className="hidden" accept="image/*" />
      </header>
      <div className="flex-grow p-2 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {displayedImages.map((image) => (
            <div key={image.id} className="relative group overflow-hidden rounded-lg cursor-pointer" onClick={() => handleImageClick(image)}>
              <img src={image.src} alt={`${t('image_by')} ${image.user}`} className="w-full h-full object-cover aspect-square" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <p className="text-white text-sm">{t('by')} {image.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in p-4">
          <div className="absolute top-4 right-4 flex items-center gap-4 z-[60]">
             <button
                onClick={() => onReplyToImage(selectedImage)}
                className="text-white hover:text-blue-300"
                aria-label={t('reply_to_image')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </button>
            <button onClick={handleCloseFullscreen} className="text-white hover:text-blue-300" aria-label={t('close_fullscreen')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            <div ref={imageContainerRef} className="relative">
                <img 
                    src={selectedImage.src} 
                    alt={`${t('fullscreen_image_by')} ${selectedImage.user}`} 
                    className={`max-w-[90vw] max-h-[80vh] object-contain transition-all duration-300 ${isColorInverted ? 'invert' : ''} ${isImageMirrored ? 'scale-x-[-1]' : ''}`}
                />
                <div className="absolute inset-0 pointer-events-none">
                     {placedStickers.map(sticker => (
                        <div key={sticker.id}
                            className="absolute cursor-move pointer-events-auto group/sticker"
                            style={{ 
                                left: `${sticker.x}%`, 
                                top: `${sticker.y}%`, 
                                width: `${sticker.width}%`,
                                transform: 'translate(-50%, -50%)' 
                            }}
                            onMouseDown={(e) => handleInteractionStart(e, sticker.id, 'move')}
                        >
                            <img src={sticker.src} className="w-full h-auto" alt="sticker" style={{aspectRatio: sticker.aspectRatio}}/>
                            
                            <button
                                onClick={() => removeSticker(sticker.id)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute -left-1 -bottom-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white cursor-pointer flex items-center justify-center text-white opacity-0 group-hover/sticker:opacity-100 transition-opacity"
                                aria-label={t('remove_sticker')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            <div 
                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-se-resize"
                                onMouseDown={(e) => handleInteractionStart(e, sticker.id, 'resize')}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="absolute bottom-4 flex gap-4 bg-black/50 p-3 rounded-full backdrop-blur-md z-[60]">
            <button onClick={() => toggleFavorite(selectedImage.id)} className="text-white hover:text-pink-400" aria-label={t('toggle_favorite')}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${selectedImage.isFavorite ? 'text-pink-400' : ''}`} fill={selectedImage.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
            </button>
             <button onClick={() => setIsImageMirrored(!isImageMirrored)} className="text-white hover:text-blue-300" aria-label={t('mirror_image')}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V2M3 12h18M12 15l3 3 3-3M12 9l-3-3-3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 22L4.5 2" transform="translate(24, 0) scale(-1, 1)" />
                 </svg>
            </button>
            <button onClick={() => setIsColorInverted(!isColorInverted)} className="text-white hover:text-blue-300" aria-label={t('invert_colors')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                <path d="M10 2a8 8 0 100 16V2z" />
              </svg>
            </button>
            <button onClick={() => setIsStickerPickerOpen(true)} className="text-white hover:text-blue-300" aria-label={t('add_sticker')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          {isStickerPickerOpen && (
            <div className="absolute inset-0 bg-black/70 z-[70] flex flex-col items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                    <header className="p-4 border-b border-gray-600 flex justify-between items-center">
                        <h2 className="text-white text-lg font-bold">{t('your_stickers')}</h2>
                        <button onClick={() => setIsStickerPickerOpen(false)} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <div className="p-4 overflow-y-auto grid grid-cols-4 gap-4">
                        {savedStickers.map((sticker, index) => (
                            <button key={index} onClick={() => placeSticker(sticker)} className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors">
                                <img src={sticker.src} alt={t('saved_sticker')} className="w-full h-full object-contain"/>
                            </button>
                        ))}
                    </div>
                    <footer className="p-4 border-t border-gray-600">
                        <button onClick={() => stickerInputRef.current?.click()} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            {t('upload_new_sticker')}
                        </button>
                    </footer>
                </div>
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .invert { filter: invert(1); }
      `}</style>
    </div>
  );
};

export default GalleryScreen;