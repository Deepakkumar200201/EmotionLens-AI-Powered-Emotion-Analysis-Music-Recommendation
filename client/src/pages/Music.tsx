import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AudioWave from "@/components/AudioWave";
import { useState } from "react";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  category: string;
}

export default function Music() {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = ["all", "happy", "calm", "energetic", "focus", "sad"];
  
  const musicTracks: MusicTrack[] = [
    {
      id: "m1",
      title: "Happy",
      artist: "Pharrell Williams",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273f456d0514f4864989d918c94",
      category: "happy"
    },
    {
      id: "m2",
      title: "Walking on Sunshine",
      artist: "Katrina & The Waves",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2736fcf7fce663652e14bc0eadb",
      category: "happy"
    },
    {
      id: "m3",
      title: "River Flows In You",
      artist: "Yiruma",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273c232d70cb2c8a95943156734",
      category: "calm"
    },
    {
      id: "m4",
      title: "Someone Like You",
      artist: "Adele",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b2736a75f532fb5658ffa1976089",
      category: "sad"
    },
    {
      id: "m5",
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273e4a3c9507c26a3fb8188dbea",
      category: "energetic"
    },
    {
      id: "m6",
      title: "Weightless",
      artist: "Marconi Union",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273b86dd49c5f79d2a9c2fef858",
      category: "focus"
    }
  ];
  
  const handlePlayTrack = (trackId: string) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };
  
  const filteredTracks = activeCategory === "all" 
    ? musicTracks 
    : musicTracks.filter(track => track.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onUploadClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-8">
        <h1 className="text-3xl font-bold mb-6">Music Recommendations</h1>
        
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {categories.map(category => (
            <Button 
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={activeCategory === category ? "bg-primary text-white" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map(track => (
            <Card key={track.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={track.coverUrl} 
                  alt={`${track.title} album cover`}
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="default"
                  className="absolute bottom-3 right-3 rounded-full w-12 h-12 p-0 bg-primary bg-opacity-90 hover:bg-opacity-100"
                  onClick={() => handlePlayTrack(track.id)}
                >
                  <span className="material-icons">
                    {playingTrack === track.id ? 'pause' : 'play_arrow'}
                  </span>
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{track.title}</h3>
                    <p className="text-[#757575]">{track.artist}</p>
                  </div>
                  {playingTrack === track.id && <AudioWave />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
      <Footer />
      <MobileNavigation onUploadClick={() => {}} />
    </div>
  );
}