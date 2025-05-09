'use client';
import { useState, useEffect, useCallback, useMemo, CSSProperties } from 'react';
import { Heart, X, MessageCircle, User, Dog, Search, Settings, ChevronLeft, ChevronRight, Camera, Edit, MapPin, Calendar, Filter } from 'lucide-react';

// CSS animations as a style element
const animationStyles = `
  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes slide-right {
    0% {
      transform: translateX(-50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slide-left {
    0% {
      transform: translateX(50px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-bounce-in {
    animation: bounce-in 0.5s;
  }

  .animate-fade-in {
    animation: fade-in 0.3s;
  }

  .animate-slide-right {
    animation: slide-right 0.5s;
  }

  .animate-slide-left {
    animation: slide-left 0.5s;
  }
`;

// TypeScript interfaces
interface Pet {
  id: number;
  name: string;
  age: string;
  breed: string;
  distance: string;
  bio: string;
  interests: string[];
  personality: string[];
  images: string[];
  liked: boolean;
  lastActive: string;
}

interface SwipeGesture {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface PetSwiperHook {
  currentPet: Pet;
  imageIndex: number;
  matches: Pet[];
  showMatch: boolean;
  matchedPet: Pet | null;
  swipeDirection: string | null;
  isAnimating: boolean;
  handleLike: () => void;
  handleDislike: () => void;
  nextImage: () => void;
  prevImage: () => void;
  dismissMatch: () => void;
  swipeHandlers: SwipeGesture;
}

interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

interface PetCardProps {
  pet: Pet;
  imageIndex: number;
  onNextImage: () => void;
  onPrevImage: () => void;
  swipeHandlers: SwipeGesture;
  swipeDirection: string | null;
  isAnimating: boolean;
}

interface MatchPopupProps {
  pet: Pet | null;
  onDismiss: () => void;
  onMessage: () => void;
}

interface MessageItemProps {
  pet: Pet;
  unread?: boolean;
  lastMessage?: string;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ProfilePhotoProps {
  url: string;
  editable?: boolean;
  onEdit?: () => void;
  size?: 'small' | 'medium' | 'large';
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
}

interface PreferenceSliderProps {
  label: string;
  value: string | number;
  min?: number;
  max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DiscoverContentProps {
  petSwiper: PetSwiperHook;
}

interface MessagesContentProps {
  matches: Pet[];
}

// Sample pet data - extended with more details and realistic content
const initialPets: Pet[] = [
  {
    id: 1,
    name: 'Luna',
    age: '2 years',
    breed: 'Golden Retriever',
    distance: '1.2 miles away',
    bio: 'Friendly and playful, loves to fetch and swim! Looking for buddies to run around with at the park. Enjoys long walks and making new friends.',
    interests: ['Fetch', 'Swimming', 'Hiking'],
    personality: ['Friendly', 'Energetic', 'Social'],
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false,
    lastActive: '10 min ago'
  },
  {
    id: 2,
    name: 'Max',
    age: '3 years',
    breed: 'French Bulldog',
    distance: '0.8 miles away',
    bio: 'Couch potato who occasionally likes short walks. Seeking a nap buddy who enjoys snacks. Very affectionate and loves belly rubs!',
    interests: ['Napping', 'Treats', 'Short walks'],
    personality: ['Laid-back', 'Affectionate', 'Foodie'],
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false,
    lastActive: '2 hours ago'
  },
  {
    id: 3,
    name: 'Bella',
    age: '1 year',
    breed: 'Siamese Cat',
    distance: '2.4 miles away',
    bio: 'Independent but affectionate. Loves chasing toys and sunbathing. Looking for a calm companion who respects personal space.',
    interests: ['Bird watching', 'Sunbathing', 'Toys'],
    personality: ['Independent', 'Curious', 'Playful'],
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false,
    lastActive: '5 min ago'
  },
  {
    id: 4,
    name: 'Rocky',
    age: '4 years',
    breed: 'German Shepherd',
    distance: '3.5 miles away',
    bio: 'Intelligent and protective. Enjoys hiking and training sessions. Seeking an active playmate for adventures and learning new tricks.',
    interests: ['Training', 'Hiking', 'Puzzle toys'],
    personality: ['Intelligent', 'Loyal', 'Athletic'],
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false,
    lastActive: '1 day ago'
  },
  {
    id: 5,
    name: 'Coco',
    age: '2 years',
    breed: 'Maine Coon',
    distance: '1.5 miles away',
    bio: 'Gentle giant with a luxurious coat. Enjoys climbing and watching birds from windows. Looking for a calm friend for occasional play.',
    interests: ['Climbing', 'Birdwatching', 'Grooming'],
    personality: ['Gentle', 'Majestic', 'Observant'],
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false,
    lastActive: '3 hours ago'
  }
];

// Custom hook for swipe gestures
const useSwipeGesture = (onSwipeLeft: () => void, onSwipeRight: () => void): SwipeGesture => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

// Custom hook for managing pet data and swipes
const usePetSwiper = (initialData: Pet[]): PetSwiperHook => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pets, setPets] = useState(initialData);
  const [imageIndex, setImageIndex] = useState(0);
  const [matches, setMatches] = useState<Pet[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentPet = useMemo(() => pets[currentIndex], [pets, currentIndex]);
  
  const handleLike = useCallback(() => {
    if (isAnimating) return;
    
    setSwipeDirection('right');
    setIsAnimating(true);
    
    setTimeout(() => {
      const newPets = [...pets];
      newPets[currentIndex].liked = true;
      setPets(newPets);
      
      // Simulate a match about 70% of the time
      if (Math.random() > 0.3) {
        setMatchedPet(currentPet);
        setMatches(prev => [...prev, currentPet]);
        setTimeout(() => setShowMatch(true), 500);
      }
      
      nextPet();
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, currentPet, isAnimating, pets]);
  
  const handleDislike = useCallback(() => {
    if (isAnimating) return;
    
    setSwipeDirection('left');
    setIsAnimating(true);
    
    setTimeout(() => {
      nextPet();
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);
  
  const nextPet = useCallback(() => {
    setImageIndex(0); // Reset image index for next pet
    
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of pets, could restart or show a message
      setCurrentIndex(0);
    }
  }, [currentIndex, pets.length]);
  
  const nextImage = useCallback(() => {
    if (currentPet && imageIndex < currentPet.images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  }, [currentPet, imageIndex]);
  
  const prevImage = useCallback(() => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  }, [imageIndex]);
  
  const dismissMatch = useCallback(() => {
    setShowMatch(false);
  }, []);
  
  // Handle swipe gestures
  const swipeHandlers = useSwipeGesture(handleDislike, handleLike);
  
  return {
    currentPet,
    imageIndex,
    matches,
    showMatch,
    matchedPet,
    swipeDirection,
    isAnimating,
    handleLike,
    handleDislike,
    nextImage,
    prevImage,
    dismissMatch,
    swipeHandlers
  };
};

// Image Carousel Component
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, currentIndex, onNext, onPrev }) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Pet image with smooth transition */}
      <div 
        className="w-full h-full flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => (
          <img 
            key={idx} 
            src={src} 
            alt={`Pet photo ${idx + 1}`} 
            className="w-full h-full object-cover flex-shrink-0"
            loading="lazy"
          />
        ))}
      </div>
      
      {/* Image navigation arrows */}
      {currentIndex > 0 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {images.length > 1 && currentIndex < images.length - 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      )}
      
      {/* Image dots indicator */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="flex space-x-1.5 bg-black bg-opacity-30 px-3 py-1.5 rounded-full">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-gray-400'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Go to image ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                if (idx < currentIndex) onPrev();
                if (idx > currentIndex) onNext();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Pet Card Component
const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  imageIndex, 
  onNextImage, 
  onPrevImage, 
  swipeHandlers, 
  swipeDirection, 
  isAnimating 
}) => {
  if (!pet) return null;
  
  const cardClass = isAnimating
    ? `transform transition-all duration-300 ease-out ${
        swipeDirection === 'left' 
          ? 'translate-x-[-120%] rotate-[-20deg]' 
          : swipeDirection === 'right' 
            ? 'translate-x-[120%] rotate-[20deg]' 
            : ''
      }`
    : '';
  
  return (
    <div 
      className={`relative h-full rounded-2xl shadow-xl overflow-hidden ${cardClass}`}
      {...swipeHandlers}
    >
      <ImageCarousel 
        images={pet.images} 
        currentIndex={imageIndex}
        onNext={onNextImage}
        onPrev={onPrevImage}
      />
      
      {/* Pet info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
        <div className="flex items-center">
          <h2 className="text-3xl font-bold">{pet.name}, {pet.age}</h2>
          <div className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
            {pet.breed}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm mb-2">
          <MapPin size={14} />
          <p>{pet.distance}</p>
          <span className="mx-1">•</span>
          <p>Active {pet.lastActive}</p>
        </div>
        <p className="text-sm mb-3">{pet.bio}</p>
        
        {/* Pet interests/personality */}
        <div className="mb-2">
          <h3 className="text-xs uppercase text-gray-300 mb-1">Interests</h3>
          <div className="flex flex-wrap gap-1">
            {pet.interests.map((interest, idx) => (
              <span key={idx} className="text-xs bg-pink-500 bg-opacity-30 px-2 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xs uppercase text-gray-300 mb-1">Personality</h3>
          <div className="flex flex-wrap gap-1">
            {pet.personality.map((trait, idx) => (
              <span key={idx} className="text-xs bg-purple-500 bg-opacity-30 px-2 py-1 rounded-full">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Match Popup Component
const MatchPopup: React.FC<MatchPopupProps> = ({ pet, onDismiss, onMessage }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center p-8 rounded-lg max-w-sm w-full">
        <div className="text-4xl text-white font-bold mb-4 animate-bounce-in">It's a Match!</div>
        <div className="flex justify-center items-center mb-6 relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 mr-2 z-10 animate-slide-right">
            <img src="/api/placeholder/100/100" alt="Your pet" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Heart size={32} className="text-pink-500 animate-pulse" fill="#ec4899" />
          </div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 ml-2 z-10 animate-slide-left">
            <img src={pet?.images[0]} alt={pet?.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="text-lg text-white mb-6">You and {pet?.name} like each other!</div>
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-transparent border border-white text-white px-6 py-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            onClick={onMessage}
          >
            Send Message
          </button>
          <button 
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
            onClick={onDismiss}
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

// Messages Item Component
const MessageItem: React.FC<MessageItemProps> = ({ pet, unread = false, lastMessage = "Tap to start chatting" }) => {
  return (
    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
          <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover" />
        </div>
        {unread && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{pet.name}</h3>
        <p className="text-gray-500 text-sm truncate">{lastMessage}</p>
      </div>
      <div className="text-xs text-gray-400">{pet.lastActive}</div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 p-4">
      {icon}
      <p className="mt-4 font-medium text-gray-600">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
};

// Profile Photo Component
const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ url, editable = false, onEdit = null, size = "medium" }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-32 h-32",
    large: "w-40 h-40"
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}>
      <img src={url} alt="Profile" className="w-full h-full object-cover" />
      {editable && (
        <button 
          className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full shadow-lg text-white"
          onClick={onEdit ? onEdit : undefined}
          aria-label="Edit profile photo"
        >
          <Camera size={16} />
        </button>
      )}
    </div>
  );
};

// Profile Section Component
const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children, editable = false, onEdit = null }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{title}</h3>
        {editable && (
          <button 
            className="text-gray-400 hover:text-pink-500 transition-colors"
            onClick={onEdit ? onEdit : undefined}
            aria-label={`Edit ${title.toLowerCase()}`}
          >
            <Edit size={16} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

// Preference Slider Component
const PreferenceSlider: React.FC<PreferenceSliderProps> = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  onChange 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={typeof value === 'string' ? parseInt(value) : value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
      />
    </div>
  );
};

// Discover Tab Component
const DiscoverContent: React.FC<DiscoverContentProps> = ({ petSwiper }) => {
  const {
    currentPet,
    imageIndex,
    handleLike,
    handleDislike,
    nextImage,
    prevImage,
    swipeHandlers,
    swipeDirection,
    isAnimating
  } = petSwiper;
  
  return (
    <div className="h-full flex flex-col">
      <div className="relative flex-grow">
        <PetCard
          pet={currentPet}
          imageIndex={imageIndex}
          onNextImage={nextImage}
          onPrevImage={prevImage}
          swipeHandlers={swipeHandlers}
          swipeDirection={swipeDirection}
          isAnimating={isAnimating}
        />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center space-x-8 py-6">
        <button 
          onClick={handleDislike}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-200"
          disabled={isAnimating}
          aria-label="Dislike pet"
        >
          <X className="text-red-500" size={32} />
        </button>
        <button 
          onClick={handleLike}
          className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg text-white transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400"
          disabled={isAnimating}
          aria-label="Like pet"
        >
          <Heart className="text-white" size={32} />
        </button>
      </div>
    </div>
  );
};

// Messages Tab Component
const MessagesContent: React.FC<MessagesContentProps> = ({ matches }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const filteredMatches = matches.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Search messages"
          >
            <Search size={20} className="text-gray-500" />
          </button>
        </div>
        
        {showSearch && (
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        
        {matches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches.map((pet, index) => (
              <MessageItem 
                key={pet.id} 
                pet={pet} 
                unread={index === 0 || index === 2} 
                lastMessage={index === 0 ? "Hey there! Want to meet up at the dog park?" : "Tap to start chatting"}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Dog size={48} className="text-gray-300" />}
            title="No matches yet"
            description="Keep swiping to find perfect pet friends"
          />
        )}
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileContent: React.FC = () => {
  const [distance, setDistance] = useState(5);
  const [ageRange, setAgeRange] = useState([1, 10]);
  const [activeSettings, setActiveSettings] = useState('info'); // 'info', 'photos', 'preferences'
  
  const user = {
    name: "Charlie",
    bio: "Playful Labrador who loves beaches, parks, and making new friends. Always up for an adventure or a good nap!",
    age: "3 years",
    breed: "Labrador Retriever",
    photos: [
      "/api/placeholder/200/200",
      "/api/placeholder/200/200",
      "/api/placeholder/200/200"
    ],
    interests: ["Beach", "Parks", "Toys", "Naps"],
    personality: ["Friendly", "Energetic", "Loving"]
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-center mb-6">
        <ProfilePhoto url={user.photos[0]} editable={true} size="large" />
        <h2 className="text-xl font-bold mt-3">{user.name}</h2>
        <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 mt-1">
          <Dog size={14} className="mr-1" />
          {user.breed}
        </div>
      </div>
      
      {/* Navigation tabs for profile sections */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeSettings === 'info' 
              ? 'text-pink-500 border-b-2 border-pink-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSettings('info')}
        >
          Info
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeSettings === 'photos' 
              ? 'text-pink-500 border-b-2 border-pink-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSettings('photos')}
        >
          Photos
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium ${
            activeSettings === 'preferences' 
              ? 'text-pink-500 border-b-2 border-pink-500' 
              : 'text-gray-500'
          }`}
          onClick={() => setActiveSettings('preferences')}
        >
          Preferences
        </button>
      </div>
      
      {activeSettings === 'info' && (
        <>
          <ProfileSection title="About" editable={true}>
            <p className="text-gray-700 text-sm">{user.bio}</p>
            
            <div className="mt-4">
              <h4 className="text-xs uppercase text-gray-400 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, idx) => (
                  <span key={idx} className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                    {interest}
                  </span>
                ))}
                <button className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-400 border border-dashed border-gray-300">
                  + Add
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-xs uppercase text-gray-400 mb-2">Personality</h4>
              <div className="flex flex-wrap gap-2">
                {user.personality.map((trait, idx) => (
                  <span key={idx} className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                    {trait}
                  </span>
                ))}
                <button className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-400 border border-dashed border-gray-300">
                  + Add
                </button>
              </div>
            </div>
          </ProfileSection>
          
          <ProfileSection title="Basic Info" editable={true}>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{user.age}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Dog size={18} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Breed</p>
                  <p className="font-medium">{user.breed}</p>
                </div>
              </div>
            </div>
          </ProfileSection>
        </>
      )}
      
      {activeSettings === 'photos' && (
        <ProfileSection title="Photos">
          <div className="grid grid-cols-3 gap-2">
            {user.photos.map((photo, idx) => (
              <div key={idx} className="aspect-square bg-gray-100 rounded-md overflow-hidden relative group">
                <img src={photo} alt={`Pet photo ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white p-2 rounded-full">
                    <Edit size={16} className="text-gray-700" />
                  </button>
                </div>
              </div>
            ))}
            <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center text-gray-400">
                <Camera size={24} />
                <span className="text-xs mt-1">Add Photo</span>
              </div>
            </div>
          </div>
        </ProfileSection>
      )}
      
      {activeSettings === 'preferences' && (
        <ProfileSection title="Match Preferences">
          <div className="space-y-4">
            <PreferenceSlider
              label="Maximum Distance"
              value={`${distance} miles`}
              min={1}
              max={50}
              onChange={(e) => setDistance(parseInt(e.target.value))}
            />
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">Age Range</label>
                <span className="text-sm text-gray-500">{ageRange[0]}-{ageRange[1]} years</span>
              </div>
              <div className="relative pt-5">
                <div className="h-2 bg-gray-200 rounded-lg">
                  <div 
                    className="absolute h-2 bg-pink-500 rounded-lg"
                    style={{
                      left: `${(ageRange[0] - 1) * 10}%`,
                      width: `${(ageRange[1] - ageRange[0]) * 10}%`
                    }}
                  ></div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                  className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none"
                />
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                  className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Species</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer">
                  <input type="checkbox" id="dogs" defaultChecked className="mr-2 accent-pink-500" />
                  <label htmlFor="dogs" className="flex items-center cursor-pointer">
                    <Dog size={16} className="mr-2" />
                    Dogs
                  </label>
                </div>
                <div className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer">
                  <input type="checkbox" id="cats" defaultChecked className="mr-2 accent-pink-500" />
                  <label htmlFor="cats" className="flex items-center cursor-pointer">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,15 C10.8954305,15 10,14.1045695 10,13 C10,11.8954305 10.8954305,11 12,11 C13.1045695,11 14,11.8954305 14,13 C14,14.1045695 13.1045695,15 12,15 Z M7.5,9 C7.5,8.17157288 8.17157288,7.5 9,7.5 C9.82842712,7.5 10.5,8.17157288 10.5,9 C10.5,9.82842712 9.82842712,10.5 9,10.5 C8.17157288,10.5 7.5,9.82842712 7.5,9 Z M13.5,9 C13.5,8.17157288 14.1715729,7.5 15,7.5 C15.8284271,7.5 16.5,8.17157288 16.5,9 C16.5,9.82842712 15.8284271,10.5 15,10.5 C14.1715729,10.5 13.5,9.82842712 13.5,9 Z" />
                    </svg>
                    Cats
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ProfileSection>
      )}
      
      <button className="mt-auto bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400">
        Save Changes
      </button>
    </div>
  );
};

// Main App Component
export default function PawfectMatch(): JSX.Element {
  const [activeTab, setActiveTab] = useState('discover');
  
  // Use custom hook for pet swiping functionality
  const petSwiper = usePetSwiper(initialPets);
  
  const goToMessages = useCallback(() => {
    petSwiper.dismissMatch();
    setActiveTab('messages');
  }, [petSwiper, setActiveTab]);

  return (
    <>
      {/* Include animations stylesheet */}
      <style>{animationStyles}</style>
      
      <div className="h-screen max-w-lg mx-auto flex flex-col bg-gray-50">
        {/* App header */}
        <header className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
          <div className="flex items-center">
            <Dog className="text-pink-500" size={24} />
            <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
              Petfectly
            </h1>
          </div>
          {activeTab === 'discover' && (
            <div className="flex gap-2">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Filter pets"
              >
                <Filter size={20} className="text-gray-500" />
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-500" />
              </button>
            </div>
          )}
        </header>
        
        {/* Main content area */}
        <main className="flex-grow overflow-hidden px-4 pb-4 pt-2">
          {activeTab === 'discover' && <DiscoverContent petSwiper={petSwiper} />}
          {activeTab === 'messages' && <MessagesContent matches={petSwiper.matches} />}
          {activeTab === 'profile' && <ProfileContent />}
        </main>
        
        {/* Bottom navigation */}
        <nav className="border-t border-gray-200 bg-white">
          <div className="flex justify-around">
            <button 
              onClick={() => setActiveTab('discover')}
              className={`py-3 flex flex-col items-center flex-1 ${
                activeTab === 'discover' ? 'text-pink-500' : 'text-gray-500'
              }`}
              aria-label="Discover pets"
            >
              <Dog size={24} />
              <span className="text-xs mt-1">Discover</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`py-3 flex flex-col items-center flex-1 ${
                activeTab === 'messages' ? 'text-pink-500' : 'text-gray-500'
              } relative`}
              aria-label="Messages"
            >
              <MessageCircle size={24} />
              <span className="text-xs mt-1">Messages</span>
              {petSwiper.matches.length > 0 && (
                <span className="absolute top-2.5 right-8 w-5 h-5 bg-pink-500 rounded-full text-white text-xs flex items-center justify-center">
                  {petSwiper.matches.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`py-3 flex flex-col items-center flex-1 ${
                activeTab === 'profile' ? 'text-pink-500' : 'text-gray-500'
              }`}
              aria-label="Your profile"
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </nav>
        
        {/* Match popup */}
        {petSwiper.showMatch && (
          <MatchPopup 
            pet={petSwiper.matchedPet} 
            onDismiss={petSwiper.dismissMatch}
            onMessage={goToMessages}
          />
        )}
      </div>
    </>
  );
}
