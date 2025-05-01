import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Music, BarChart2, PlayCircle, ExternalLink, Download } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";
import { Emotion } from '@shared/schema';
import MusicRecommendations from './MusicRecommendations';

interface CustomPlaylistProps {
  userId: number;
  emotionalPatterns: any[];
}

interface EmotionFilterState {
  name: string;
  score: number;
  enabled: boolean;
}

interface CustomPlaylistResponse {
  id: string;
  name: string;
  description: string;
  tracks: any[];
  createdAt: string;
}

export default function CustomPlaylist({ userId, emotionalPatterns }: CustomPlaylistProps) {
  const [trackLimit, setTrackLimit] = useState<number>(10);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<CustomPlaylistResponse | null>(null);
  
  // Extract all unique emotions from patterns
  const allEmotions: Set<string> = new Set();
  emotionalPatterns.forEach(pattern => {
    pattern.dominantEmotions?.forEach((emotion: Emotion) => {
      allEmotions.add(emotion.name);
    });
  });
  
  // Create filter state for each emotion
  const [emotionFilters, setEmotionFilters] = useState<EmotionFilterState[]>(
    Array.from(allEmotions).map(name => ({
      name,
      score: 0.5,
      enabled: false
    }))
  );
  
  // Generate playlist mutation
  const generatePlaylistMutation = useMutation({
    mutationFn: async () => {
      // Filter enabled emotions
      const enabledEmotions = emotionFilters
        .filter(filter => filter.enabled)
        .map(filter => ({
          name: filter.name,
          score: filter.score
        }));
      
      if (enabledEmotions.length === 0) {
        throw new Error('Please select at least one emotion');
      }
      
      const res = await fetch(`/api/user/${userId}/custom-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions: enabledEmotions,
          limit: trackLimit
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate playlist');
      }
      
      return res.json() as Promise<CustomPlaylistResponse>;
    },
    onSuccess: (data) => {
      setPlaylist(data);
      setShowPlaylist(true);
      toast({
        title: 'Playlist created',
        description: `Successfully created "${data.name}" with ${data.tracks.length} tracks`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle toggling an emotion
  const toggleEmotion = (name: string) => {
    setEmotionFilters(prev => 
      prev.map(filter => 
        filter.name === name ? { ...filter, enabled: !filter.enabled } : filter
      )
    );
  };
  
  // Handle changing emotion intensity/score
  const changeEmotionScore = (name: string, value: number[]) => {
    setEmotionFilters(prev => 
      prev.map(filter => 
        filter.name === name ? { ...filter, score: value[0] } : filter
      )
    );
  };
  
  // Handle generating playlist
  const handleGeneratePlaylist = () => {
    generatePlaylistMutation.mutate();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Custom Playlist Generator
          </CardTitle>
          <CardDescription>
            Create a personalized playlist based on your emotional patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Select Emotions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which emotions to include and adjust their intensity
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emotionFilters.map(filter => (
                  <Card key={filter.name} className={`border ${filter.enabled ? 'border-primary bg-primary/5' : ''}`}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{filter.name}</h4>
                        <Switch 
                          checked={filter.enabled}
                          onCheckedChange={() => toggleEmotion(filter.name)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Subtle</span>
                          <span>Intense</span>
                        </div>
                        <Slider
                          defaultValue={[0.5]}
                          max={1}
                          step={0.01}
                          value={[filter.score]}
                          onValueChange={(value) => changeEmotionScore(filter.name, value)}
                          disabled={!filter.enabled}
                          className={filter.enabled ? '' : 'opacity-30'}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="track-limit">Number of Tracks</Label>
                <span className="text-sm font-medium">{trackLimit}</span>
              </div>
              <Slider
                id="track-limit"
                defaultValue={[10]}
                min={5}
                max={20}
                step={1}
                value={[trackLimit]}
                onValueChange={(value) => setTrackLimit(value[0])}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGeneratePlaylist}
            disabled={generatePlaylistMutation.isPending || emotionFilters.every(f => !f.enabled)}
            className="w-full"
          >
            {generatePlaylistMutation.isPending ? 'Generating...' : 'Generate Playlist'}
          </Button>
        </CardFooter>
      </Card>
      
      {showPlaylist && playlist && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{playlist.name}</h2>
            <Button variant="ghost" onClick={() => setShowPlaylist(false)}>Hide Playlist</Button>
          </div>
          <p className="text-muted-foreground">{playlist.description}</p>
          
          <MusicRecommendations musicSuggestions={playlist.tracks} />
        </div>
      )}
    </div>
  );
}