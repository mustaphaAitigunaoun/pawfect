import { useState } from 'react';
import { Heart, X, MessageCircle, User, Dog, Search, Settings } from 'lucide-react';

// Sample pet data
const initialPets = [
  {
    id: 1,
    name: 'Luna',
    age: '2 years',
    breed: 'Golden Retriever',
    distance: '1.2 miles away',
    bio: 'Friendly and playful, loves to fetch and swim! Looking for buddies to run around with at the park.',
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false
  },
  {
    id: 2,
    name: 'Max',
    age: '3 years',
    breed: 'French Bulldog',
    distance: '0.8 miles away',
    bio: 'Couch potato who occasionally likes short walks. Seeking a nap buddy who enjoys snacks.',
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false
  },
  {
    id: 3,
    name: 'Bella',
    age: '1 year',
    breed: 'Siamese Cat',
    distance: '2.4 miles away',
    bio: 'Independent but affectionate. Loves chasing toys and sunbathing. Looking for a calm companion.',
    images: ["/api/placeholder/800/600"],
    liked: false
  },
  {
    id: 4,
    name: 'Rocky',
    age: '4 years',
    breed: 'German Shepherd',
    distance: '3.5 miles away',
    bio: 'Intelligent and protective. Enjoys hiking and training sessions. Seeking an active playmate.',
    images: ["/api/placeholder/800/600", "/api/placeholder/800/600"],
    liked: false
  }
];

// Main App Component
export default function PawfectMatch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pets, setPets] = useState(initialPets);
  const [activeTab, setActiveTab] = useState('discover');
  const [imageIndex, setImageIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedPet, setMatchedPet] = useState(null);

  const currentPet = pets[currentIndex];

  const handleLike = () => {
    const newPets = [...pets];
    newPets[currentIndex].liked = true;
    setPets(newPets);
    
    // Simulate a match about 50% of the time
    if (Math.random() > 0.5) {
      setMatchedPet(currentPet);
      setMatches([...matches, currentPet]);
      setShowMatch(true);
      setTimeout(() => setShowMatch(false), 2000);
    }
    
    nextPet();
  };

  const handleDislike = () => {
    nextPet();
  };

  const nextPet = () => {
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageIndex(0); // Reset image index for next pet
    } else {
      // End of pets, could restart or show a message
      setCurrentIndex(0);
    }
  };

  const nextImage = () => {
    if (imageIndex < currentPet.images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  };

  const prevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  };

  // Match popup component
  const MatchPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center p-8 rounded-lg">
        <div className="text-4xl text-white font-bold mb-4">It's a Match!</div>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 mr-2">
            <img src="/api/placeholder/100/100" alt="Your pet" className="w-full h-full object-cover" />
          </div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 ml-2">
            <img src={matchedPet?.images[0]} alt={matchedPet?.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="text-lg text-white mb-6">You and {matchedPet?.name} like each other!</div>
        <div className="flex justify-center space-x-4">
          <button className="bg-transparent border border-white text-white px-6 py-2 rounded-full">
            Send Message
          </button>
          <button 
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-full"
            onClick={() => setShowMatch(false)}
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );

  // Discover tab content
  const DiscoverContent = () => (
    <div className="h-full flex flex-col">
      <div className="relative flex-grow overflow-hidden rounded-2xl shadow-xl">
        {/* Pet image */}
        <img 
          src={currentPet.images[imageIndex]} 
          alt={currentPet.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Image navigation dots */}
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="flex space-x-1 bg-black bg-opacity-30 px-2 py-1 rounded-full">
            {currentPet.images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full ${idx === imageIndex ? 'bg-white' : 'bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Touch areas for image navigation */}
        <div className="absolute inset-y-0 left-0 w-1/4" onClick={prevImage}></div>
        <div className="absolute inset-y-0 right-0 w-1/4" onClick={nextImage}></div>
        
        {/* Pet info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold">{currentPet.name}, {currentPet.age}</h2>
            <div className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
              {currentPet.breed}
            </div>
          </div>
          <p className="text-sm mb-2">{currentPet.distance}</p>
          <p className="text-sm">{currentPet.bio}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center space-x-8 py-6">
        <button 
          onClick={handleDislike}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200"
        >
          <X className="text-red-500" size={32} />
        </button>
        <button 
          onClick={handleLike}
          className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg text-white"
        >
          <Heart className="text-white" size={32} />
        </button>
      </div>
    </div>
  );

  // Messages tab content
  const MessagesContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map(pet => (
              <div key={pet.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{pet.name}</h3>
                  <p className="text-gray-500 text-sm">Tap to start chatting</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
            <Dog size={48} className="mb-4" />
            <p>No matches yet</p>
            <p className="text-sm">Keep swiping to find perfect pet friends</p>
          </div>
        )}
      </div>
    </div>
  );

  // Profile tab content
  const ProfileContent = () => (
    <div className="h-full flex flex-col p-4">
      <div className="text-center mb-6">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-pink-400">
          <img src="/api/placeholder/200/200" alt="Your pet" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold mt-3">Your Pet's Name</h2>
        <p className="text-gray-500">Edit your profile to get more matches</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-2">About</h3>
        <p className="text-gray-700 text-sm">
          Add a bio to tell other pets about your furry friend's personality, likes, and what they're looking for!
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="font-semibold mb-2">Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
            <img src="/api/placeholder/150/150" alt="Pet photo" className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
            <img src="/api/placeholder/150/150" alt="Pet photo" className="w-full h-full object-cover rounded-md" />
          </div>
          <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
            +
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold mb-2">Preferences</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p>Distance</p>
            <p className="text-gray-500">5 miles</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Age range</p>
            <p className="text-gray-500">All ages</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Species</p>
            <p className="text-gray-500">Dogs, Cats</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen max-w-lg mx-auto flex flex-col bg-gray-50">
      {/* App header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Dog className="text-pink-500" size={24} />
          <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">
            Pawfect Match
          </h1>
        </div>
        {activeTab === 'discover' && (
          <div className="flex">
            <button className="w-10 h-10 flex items-center justify-center rounded-full">
              <Settings size={20} className="text-gray-500" />
            </button>
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="flex">
            <button className="w-10 h-10 flex items-center justify-center rounded-full">
              <Search size={20} className="text-gray-500" />
            </button>
          </div>
        )}
      </header>
      
      {/* Main content area */}
      <main className="flex-grow overflow-hidden px-4 pb-4">
        {activeTab === 'discover' && <DiscoverContent />}
        {activeTab === 'messages' && <MessagesContent />}
        {activeTab === 'profile' && <ProfileContent />}
      </main>
      
      {/* Bottom navigation */}
      <nav className="border-t border-gray-200 bg-white">
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`py-3 flex flex-col items-center flex-1 ${activeTab === 'discover' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <Dog size={24} />
            <span className="text-xs mt-1">Discover</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`py-3 flex flex-col items-center flex-1 ${activeTab === 'messages' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <MessageCircle size={24} />
            <span className="text-xs mt-1">Messages</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`py-3 flex flex-col items-center flex-1 ${activeTab === 'profile' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
      
      {/* Match popup */}
      {showMatch && <MatchPopup />}
    </div>
  );
}