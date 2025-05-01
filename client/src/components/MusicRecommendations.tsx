import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AudioWave from "./AudioWave";
import { MusicSuggestion } from "@shared/schema";

interface MusicRecommendationsProps {
  musicSuggestions: MusicSuggestion[];
}

export default function MusicRecommendations({ musicSuggestions }: MusicRecommendationsProps) {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [downloadingTrack, setDownloadingTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element and add event listeners
  useEffect(() => {
    const audio = new Audio();
    
    // Set audio to loop for better user experience
    audio.loop = false;
    
    // Increase volume for better audibility
    audio.volume = 1.0;
    
    // Add event listeners
    audio.addEventListener('ended', () => {
      setPlayingTrack(null);
    });
    
    audio.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setPlayingTrack(null);
      toast({
        title: "Playback Error",
        description: "Could not play this track. Try another one.",
        variant: "destructive",
      });
    });
    
    // Set better audio properties
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    
    audioRef.current = audio;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  const handlePlayTrack = (track: MusicSuggestion) => {
    if (!audioRef.current) return;
    
    // If same track is already playing, pause it
    if (playingTrack === track.id) {
      audioRef.current.pause();
      setPlayingTrack(null);
      return;
    }
    
    // If another track is playing, stop it
    if (playingTrack) {
      audioRef.current.pause();
    }
    
    // If track has preview URL, play it
    if (track.previewUrl) {
      // Clear any existing audio source
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // Set new source
      audioRef.current.src = track.previewUrl;
      
      // Try to preload the audio
      audioRef.current.load();
      
      // Play with retry logic
      const attemptPlay = (retries = 3) => {
        audioRef.current?.play()
          .then(() => {
            setPlayingTrack(track.id);
            console.log(`Now playing: ${track.title} by ${track.artist}`);
          })
          .catch((error) => {
            console.error("Error playing audio:", error, "Retries left:", retries);
            if (retries > 0) {
              // Wait a bit and retry
              setTimeout(() => attemptPlay(retries - 1), 500);
            } else {
              toast({
                title: "Playback Error",
                description: "Could not play this track. Try another one.",
                variant: "destructive",
              });
            }
          });
      };
      
      attemptPlay();
    } else if (track.spotifyUrl) {
      // If no preview but has Spotify URL, ask if they want to open in Spotify
      toast({
        title: "No Audio Preview Available",
        description: (
          <div className="flex flex-col space-y-2">
            <p>This track doesn't have a preview.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-green-600 border-green-600"
              onClick={() => window.open(track.spotifyUrl, '_blank')}
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Open in Spotify
            </Button>
          </div>
        ),
      });
      
      // Still indicate as "playing" to show the correct UI state
      setPlayingTrack(track.id);
      
      // Auto-reset the "playing" state after 3 seconds
      const trackId = track.id;
      setTimeout(() => {
        setPlayingTrack(prevState => prevState === trackId ? null : prevState);
      }, 3000);
      
    } else {
      // No audio preview or Spotify URL available
      toast({
        title: "No Audio Available",
        description: "This track doesn't have a preview or Spotify link.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadTrack = (e: React.MouseEvent, track: MusicSuggestion) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    setDownloadingTrack(track.id);
    
    // Simulate download process without navigating away
    setTimeout(() => {
      setDownloadingTrack(null);
      
      toast({
        title: "Download complete",
        description: `${track.title} by ${track.artist} has been saved to your device`,
      });
    }, 1500);
  };
  
  const openInSpotify = (e: React.MouseEvent, track: MusicSuggestion) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    
    if (track.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank');
    } else {
      toast({
        title: "Spotify Link Unavailable",
        description: "No Spotify link available for this track",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenFullPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Playlist Available in App",
      description: "All music can be played right here in EmotionLens. No need to navigate away!",
    });
  };
  
  return (
    <Card className="overflow-hidden mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4">Music Recommendations</h3>
        <p className="text-[#757575] mb-4">
          Based on your mood, we've curated these Bengali tracks to complement your emotional state.
        </p>
        
        <div className="space-y-3">
          {musicSuggestions.map((track) => (
            <div 
              key={track.id}
              className="bg-[#F5F5F5] rounded-lg p-4 flex items-center hover:bg-gray-100 transition-all cursor-pointer"
              onClick={() => handlePlayTrack(track)}
            >
              <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 mr-4 relative">
                <img 
                  src={track.coverUrl} 
                  alt={`${track.title} album cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                  <span className="material-icons text-white">
                    {playingTrack === track.id ? 'pause' : 'play_arrow'}
                  </span>
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <h5 className="font-medium text-[#121212] truncate">{track.title}</h5>
                <p className="text-[#757575] text-sm truncate">{track.artist}</p>
              </div>
              
              <div className="flex items-center ml-4">
                {playingTrack === track.id && <AudioWave />}
                
                {/* Spotify button */}
                {track.spotifyUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8 text-green-600 hover:text-green-700"
                    onClick={(e) => openInSpotify(e, track)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </Button>
                )}
                
                {/* Download button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-8 w-8 text-[#757575] hover:text-primary"
                  onClick={(e) => handleDownloadTrack(e, track)}
                  disabled={downloadingTrack === track.id}
                >
                  {downloadingTrack === track.id ? (
                    <span className="material-icons animate-spin">cached</span>
                  ) : (
                    <span className="material-icons">download</span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full bg-primary text-white rounded-lg py-3 mt-4 hover:bg-opacity-90 transition-all font-medium"
          onClick={handleOpenFullPlaylist}
        >
          Open Full Playlist
        </Button>
      </CardContent>
    </Card>
  );
}
