import { useState } from 'react';
import { Emotion } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, Activity, Coffee, Clock, Zap, Brain, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface MoodSuggestionsProps {
  userId: number;
  emotionalPatterns?: any[];
}

interface Suggestion {
  title: string;
  description: string;
  timeRequired: string;
  category: string;
}

interface LongTermPractice {
  title: string;
  description: string;
  benefits: string;
}

interface MoodSuggestionsResponse {
  id: string;
  createdAt: string;
  emotions: Emotion[];
  summary: string;
  suggestions: Suggestion[];
  quickTips: string[];
  longTermPractices: LongTermPractice[];
}

export default function MoodSuggestions({ userId, emotionalPatterns }: MoodSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MoodSuggestionsResponse | null>(null);
  const [context, setContext] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get the most recent emotional pattern if available
  const latestPattern = emotionalPatterns && emotionalPatterns.length > 0 
    ? emotionalPatterns[0] 
    : null;
  
  const handleGenerateSuggestions = async () => {
    if (!latestPattern?.dominantEmotions || latestPattern.dominantEmotions.length === 0) {
      toast({
        title: "No emotions available",
        description: "We need emotion data to generate suggestions. Upload a photo first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Extract emotions from the most recent emotional pattern
      const emotions = latestPattern.dominantEmotions;
      
      const response = await apiRequest(
        "POST", 
        `/api/user/${userId}/mood-suggestions`,
        { emotions, context }
      );
      
      const data = await response.json();
      setSuggestions(data);
      
      toast({
        title: "Suggestions generated",
        description: "Your personalized mood improvement suggestions are ready!",
      });
    } catch (error) {
      console.error("Error generating mood suggestions:", error);
      toast({
        title: "Failed to generate suggestions",
        description: "There was an error generating your mood suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'physical':
        return <Activity className="h-5 w-5" />;
      case 'mental':
        return <Brain className="h-5 w-5" />;
      case 'social':
        return <Coffee className="h-5 w-5" />;
      case 'creative':
        return <Zap className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 items-start`}>
        <div className={`${isMobile ? 'w-full' : 'w-2/3'} space-y-4`}>
          <Card>
            <CardHeader>
              <CardTitle>AI Mood Improvement Suggestions</CardTitle>
              <CardDescription>
                Get personalized suggestions to improve your mood based on your emotional patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestPattern ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your recent emotional pattern:</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {latestPattern.dominantEmotions?.map((emotion: Emotion, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="bg-primary/10"
                        >
                          {emotion.name} ({Math.round(emotion.score * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No emotional patterns found. Upload a photo to analyze your emotions first.
                  </p>
                )}
                
                <div>
                  <label htmlFor="context" className="block text-sm font-medium mb-2">
                    Additional context (optional)
                  </label>
                  <Textarea
                    id="context"
                    placeholder="Add any additional context about your day, challenges, or what you need help with..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateSuggestions} 
                disabled={isLoading || !latestPattern}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating suggestions...
                  </>
                ) : "Generate Mood Improvement Suggestions"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {suggestions && (
          <div className={`${isMobile ? 'w-full' : 'w-1/3'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Mood Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {suggestions.summary}
                </p>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Emotions Analyzed:</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.emotions?.map((emotion, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-primary/10"
                      >
                        {emotion.name} ({Math.round(emotion.score * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Plan</CardTitle>
            <CardDescription>
              Activities, tips, and practices tailored to your current emotional state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="suggestions">
                  <Activity className="h-4 w-4 mr-2" />
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="quickTips">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger value="longTerm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Long-Term Practices
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.suggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center">
                            {getCategoryIcon(suggestion.category)}
                            <span className="ml-2">{suggestion.title}</span>
                          </CardTitle>
                          
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {suggestion.timeRequired}
                          </Badge>
                        </div>
                        <Badge className="mt-1">{suggestion.category}</Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="quickTips">
                <div className="space-y-2">
                  {suggestions.quickTips.map((tip, index) => (
                    <div key={index} className="flex p-3 border rounded-lg items-start">
                      <Zap className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="longTerm">
                <div className="space-y-4">
                  {suggestions.longTermPractices.map((practice, index) => (
                    <Card key={index}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{practice.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description:</h4>
                          <p className="text-sm text-muted-foreground">
                            {practice.description}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Benefits:</h4>
                          <p className="text-sm text-muted-foreground">
                            {practice.benefits}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}