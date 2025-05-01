import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { User as UserIcon, ListFilter, Calendar, BarChart3, LineChart as LineChartIcon, Settings, Smile, Activity, Music, HeartHandshake } from 'lucide-react';
import CustomPlaylist from '@/components/CustomPlaylist';
import MoodSuggestions from '@/components/MoodSuggestions';

// Types from the backend
import type { UserPreferences, EmotionalPattern, Analysis, Emotion } from '@shared/schema';

// User type definition for this component
interface UserData {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profilePicture: string | null;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [activePatternId, setActivePatternId] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>('weekly');
  
  // Hardcoded user ID for demo (would come from auth context in real app)
  const userId = 1;
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json() as Promise<UserData>;
    }
  });
  
  // Fetch user preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['/api/user', userId, 'preferences'],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/preferences`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch preferences');
      }
      return res.json() as Promise<UserPreferences>;
    },
    retry: (failureCount, error: any) => {
      // Don't retry if we got a 404 (preferences don't exist yet)
      return error.response?.status !== 404 && failureCount < 3;
    }
  });
  
  // Fetch emotional patterns
  const { data: patterns, isLoading: isLoadingPatterns } = useQuery({
    queryKey: ['/api/user', userId, 'emotional-patterns'],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/emotional-patterns`);
      if (!res.ok) throw new Error('Failed to fetch emotional patterns');
      return res.json() as Promise<EmotionalPattern[]>;
    }
  });
  
  // Fetch user analyses
  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['/api/user', userId, 'analyses'],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/analyses`);
      if (!res.ok) throw new Error('Failed to fetch analyses');
      return res.json() as Promise<Analysis[]>;
    }
  });
  
  // Get active pattern
  const activePattern = patterns?.find(p => p.id === activePatternId) || patterns?.[0];
  
  // Create user preferences mutation
  const createPreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      const res = await fetch(`/api/user/${userId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (!res.ok) throw new Error('Failed to create preferences');
      return res.json() as Promise<UserPreferences>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'preferences'] });
      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been saved successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save preferences: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Update user preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      const res = await fetch(`/api/user/${userId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      return res.json() as Promise<UserPreferences>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'preferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update preferences: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Generate emotional pattern mutation
  const generatePatternMutation = useMutation({
    mutationFn: async (period: string) => {
      const res = await fetch(`/api/user/${userId}/emotional-patterns/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate pattern');
      }
      return res.json() as Promise<EmotionalPattern>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'emotional-patterns'] });
      setActivePatternId(data.id);
      toast({
        title: 'Pattern generated',
        description: 'Emotional pattern has been generated successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle preferences save
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const theme = form.theme.value;
    const language = form.language.value;
    const notificationsEnabled = form.notifications.checked;
    const shareEmotionalData = form.shareEmotionalData.checked;
    const publicProfile = form.publicProfile.checked;
    const anonymizeData = form.anonymizeData.checked;
    
    const newPreferences = {
      theme,
      language,
      notificationsEnabled,
      privacySettings: {
        shareEmotionalData,
        publicProfile,
        anonymizeData
      },
      musicPreferences: form.musicPreferences.value.split(',').map((s: string) => s.trim())
    };
    
    if (preferences) {
      updatePreferencesMutation.mutate(newPreferences);
    } else {
      createPreferencesMutation.mutate(newPreferences);
    }
  };
  
  // Handle generate pattern
  const handleGeneratePattern = () => {
    generatePatternMutation.mutate(periodFilter);
  };
  
  // Format emotion data for chart
  const formatEmotionData = (pattern?: EmotionalPattern) => {
    if (!pattern) return [];
    return (pattern.dominantEmotions || []).map(emotion => ({
      name: emotion.name,
      score: emotion.score * 100 // Convert to percentage
    }));
  };
  
  // Format trend data for line chart
  const formatTrendData = (pattern?: EmotionalPattern) => {
    if (!pattern || !pattern.emotionTrends) return [];
    
    const trendData: Record<string, any>[] = [];
    const emotionTrends = pattern.emotionTrends;
    const emotionNames = Object.keys(emotionTrends);
    
    // Get max length of any emotion array
    const maxLength = Math.max(...emotionNames.map(name => {
      return emotionTrends[name]?.length || 0;
    }));
    
    for (let i = 0; i < maxLength; i++) {
      const dataPoint: Record<string, any> = { index: i + 1 };
      
      emotionNames.forEach(emotion => {
        if (emotionTrends[emotion] && emotionTrends[emotion][i] !== undefined) {
          dataPoint[emotion] = emotionTrends[emotion][i] * 100; // Convert to percentage
        }
      });
      
      trendData.push(dataPoint);
    }
    
    return trendData;
  };
  
  // Generate random colors for chart
  const getEmotionColor = (index: number) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC249', '#EA5F89', '#00BFFF', '#FFA07A'
    ];
    return colors[index % colors.length];
  };
  
  // Loading state
  if (isLoadingUser || isLoadingPreferences || isLoadingPatterns || isLoadingAnalyses) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="emotional-patterns" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Emotional Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData?.profilePicture || ''} alt={userData?.username || 'User'} />
                  <AvatarFallback>{userData?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{userData?.username}</CardTitle>
                  <CardDescription>
                    {userData?.firstName} {userData?.lastName}
                    {userData?.email && <div>{userData.email}</div>}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Member since:</h3>
                    <p>{new Date(userData?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Last login:</h3>
                    <p>{new Date(userData?.lastLogin || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Analysis Summary Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Summary
                </CardTitle>
                <CardDescription>Statistics from your emotion analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total analyses:</span>
                    <span className="font-bold">{analyses?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Most frequent emotion:</span>
                    <span className="font-bold">
                      {patterns && patterns.length > 0 && patterns[0].dominantEmotions && patterns[0].dominantEmotions.length > 0
                        ? patterns[0].dominantEmotions[0].name
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emotional stability:</span>
                    <span className="font-bold">
                      {patterns && patterns.length > 0 && patterns[0].emotionalStability
                        ? `${patterns[0].emotionalStability}/10`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Analyses Card */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>Your most recent emotion analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyses && analyses.length > 0 ? (
                    analyses.slice(0, 3).map(analysis => (
                      <div key={analysis.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                          <img src={analysis.imageUrl} alt="Analysis" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{analysis.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No analyses found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Analyses</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Emotional Patterns Tab */}
        <TabsContent value="emotional-patterns">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-4 mb-2">
              <Tabs defaultValue="patterns">
                <TabsList>
                  <TabsTrigger value="patterns" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Emotion Patterns</span>
                  </TabsTrigger>
                  <TabsTrigger value="music" className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span>Custom Playlists</span>
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4" />
                    <span>Mood Suggestions</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="patterns" className="pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Pattern Controls */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListFilter className="h-5 w-5" />
                  Pattern Controls
                </CardTitle>
                <CardDescription>Generate and select patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="period-filter">Time Period</Label>
                  <Select 
                    value={periodFilter} 
                    onValueChange={setPeriodFilter}
                  >
                    <SelectTrigger id="period-filter">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleGeneratePattern}
                  disabled={generatePatternMutation.isPending}
                  className="w-full"
                >
                  {generatePatternMutation.isPending ? 'Generating...' : 'Generate Pattern'}
                </Button>
                
                <div className="space-y-2">
                  <Label>Available Patterns</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {patterns && patterns.length > 0 ? (
                      patterns.map(pattern => (
                        <div 
                          key={pattern.id}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            pattern.id === activePatternId ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                          }`}
                          onClick={() => setActivePatternId(pattern.id)}
                        >
                          <div className="font-medium">{pattern.period.charAt(0).toUpperCase() + pattern.period.slice(1)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(pattern.startDate).toLocaleDateString()} - {new Date(pattern.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">No patterns generated yet</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pattern Details */}
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  Emotional Pattern Details
                </CardTitle>
                {activePattern && (
                  <CardDescription>
                    {new Date(activePattern.startDate).toLocaleDateString()} to {new Date(activePattern.endDate).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {activePattern ? (
                  <div className="space-y-6">
                    {/* Emotion Distribution Chart */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Emotion Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formatEmotionData(activePattern)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                              <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                              <Legend />
                              <Bar dataKey="score" fill="#8884d8">
                                {formatEmotionData(activePattern).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getEmotionColor(index)} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Emotion Trend Chart */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Emotion Trends Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formatTrendData(activePattern)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="index" label={{ value: 'Analysis', position: 'insideBottom', offset: -5 }} />
                              <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                              <RechartsTooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                              <Legend />
                              {activePattern.emotionTrends && Object.keys(activePattern.emotionTrends).map((emotion, index) => (
                                <Line 
                                  key={emotion} 
                                  type="monotone" 
                                  dataKey={emotion} 
                                  stroke={getEmotionColor(index)} 
                                  activeDot={{ r: 8 }}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Pattern Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-lg">Emotional Stability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-4xl font-bold text-center">
                            {activePattern.emotionalStability}/10
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-lg">Mood Swings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-4xl font-bold text-center">
                            {activePattern.moodSwings}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-lg">Top Emotion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-center">
                            {activePattern.dominantEmotions && activePattern.dominantEmotions.length > 0
                              ? activePattern.dominantEmotions[0].name
                              : 'N/A'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Insights and Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{activePattern.insights || 'No insights available'}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{activePattern.recommendations || 'No recommendations available'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                    <LineChartIcon className="h-16 w-16 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-medium">No Pattern Selected</h3>
                      <p className="text-muted-foreground">
                        Generate a new pattern or select an existing one from the sidebar.
                      </p>
                    </div>
                    <Button onClick={handleGeneratePattern}>Generate {periodFilter} Pattern</Button>
                  </div>
                )}
              </CardContent>
            </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="music" className="pt-4">
                  {patterns && patterns.length > 0 ? (
                    <CustomPlaylist userId={userId} emotionalPatterns={patterns} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <Music className="h-16 w-16 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium">No Emotional Patterns Available</h3>
                        <p className="text-muted-foreground">
                          You need to generate emotional patterns before you can create custom playlists.
                        </p>
                      </div>
                      <Button onClick={() => document.querySelector('[value="patterns"]')?.dispatchEvent(new Event('click'))}>
                        Go to Patterns
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="pt-4">
                  {patterns && patterns.length > 0 ? (
                    <MoodSuggestions userId={userId} emotionalPatterns={patterns} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <HeartHandshake className="h-16 w-16 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-medium">No Emotional Patterns Available</h3>
                        <p className="text-muted-foreground">
                          You need to generate emotional patterns before you can get AI mood suggestions.
                        </p>
                      </div>
                      <Button onClick={() => document.querySelector('[value="patterns"]')?.dispatchEvent(new Event('click'))}>
                        Go to Patterns
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Manage your app settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue={preferences?.theme || 'light'}>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue={preferences?.language || 'en'}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="musicPreferences">Music Preferences</Label>
                      <Textarea 
                        id="musicPreferences" 
                        placeholder="Enter music genres (comma separated)" 
                        defaultValue={preferences?.musicPreferences?.join(', ') || ''}
                      />
                      <p className="text-sm text-muted-foreground">Separate genres with commas (e.g. Rock, Pop, Bengali Folk)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Notifications</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications" className="cursor-pointer">Enable notifications</Label>
                        <Switch 
                          id="notifications" 
                          defaultChecked={preferences?.notificationsEnabled || false} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Privacy Settings</h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shareEmotionalData" className="cursor-pointer">Share emotional data anonymously</Label>
                        <Switch 
                          id="shareEmotionalData" 
                          defaultChecked={preferences?.privacySettings?.shareEmotionalData || false} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="publicProfile" className="cursor-pointer">Make profile public</Label>
                        <Switch 
                          id="publicProfile" 
                          defaultChecked={preferences?.privacySettings?.publicProfile || false} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymizeData" className="cursor-pointer">Anonymize data in reports</Label>
                        <Switch 
                          id="anonymizeData" 
                          defaultChecked={preferences?.privacySettings?.anonymizeData || false} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={createPreferencesMutation.isPending || updatePreferencesMutation.isPending}>
                    {createPreferencesMutation.isPending || updatePreferencesMutation.isPending
                      ? 'Saving...'
                      : preferences ? 'Update Preferences' : 'Save Preferences'
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}