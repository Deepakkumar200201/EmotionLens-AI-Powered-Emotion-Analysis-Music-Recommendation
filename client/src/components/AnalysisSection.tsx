import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmotionalInsights from "./EmotionalInsights";
import MusicRecommendations from "./MusicRecommendations";
import AnalysisHistory from "./AnalysisHistory";
import { Analysis } from "@shared/schema";
import { 
  SmilePlus, Frown, Angry, Meh, CloudFog, Flame, HeartCrack, Sparkles, 
  Brain, Calendar, AlertTriangle, Zap
} from "lucide-react";

interface AnalysisSectionProps {
  analysis: Analysis | null;
  analysisHistory: Analysis[];
  onSelectHistory: (analysis: Analysis) => void;
}

export default function AnalysisSection({ analysis, analysisHistory, onSelectHistory }: AnalysisSectionProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  if (!analysis) return null;

  // Sort emotions by score descending
  const sortedEmotions = [...analysis.emotions].sort((a, b) => b.score - a.score);
  
  // Get all emotions for display
  const allEmotions = sortedEmotions;
  
  // Get the top 3 emotions to display
  const topEmotions = sortedEmotions.slice(0, 3);
  
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Image Preview and Emotions */}
        <div className="lg:col-span-7">
          <Card className="mb-6 overflow-hidden shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Analysis Results</CardTitle>
              <CardDescription>
                We've analyzed your photo to identify emotional expressions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="rounded-md overflow-hidden border mb-4">
                <AspectRatio ratio={4/3}>
                  <img 
                    src={analysis.imageUrl} 
                    alt="Analyzed expression" 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {topEmotions.map((emotion, index) => (
                  <Badge 
                    key={emotion.name}
                    variant="secondary"
                    className={`py-1 px-3 gap-1 ${getEmotionBadgeColor(emotion.name)}`}
                  >
                    {getEmotionIcon(emotion.name)}
                    <span>{getEmotionDisplayName(emotion.name)}</span>
                    <span className="opacity-70">({Math.round(emotion.score * 100)}%)</span>
                  </Badge>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="mb-2">
                  Primary Emotion: <span className="font-medium text-foreground">{getEmotionDisplayName(topEmotions[0]?.name || "Neutral")}</span>
                </p>
                <p className="text-xs leading-relaxed">{analysis.description}</p>
              </div>
            </CardContent>
            
            <div className="border-t p-5">
              <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4 w-full">
                  <TabsTrigger value="details">Top Emotions</TabsTrigger>
                  <TabsTrigger value="emotions">All Emotions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-0 space-y-4">
                  {topEmotions.map((emotion, index) => (
                    <div key={emotion.name} className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${index === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                            {getEmotionIcon(emotion.name)}
                          </div>
                          <span className="font-medium">{getEmotionDisplayName(emotion.name)}</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(emotion.score * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getEmotionColor(index)}`}
                          style={{ width: `${emotion.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 w-full text-primary text-sm justify-center" 
                    onClick={() => setActiveTab("emotions")}
                  >
                    View all emotions
                  </Button>
                </TabsContent>
                
                <TabsContent value="emotions" className="mt-0 space-y-3">
                  {allEmotions.map((emotion, index) => (
                    <div key={emotion.name} className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${index === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                            {getEmotionIcon(emotion.name)}
                          </div>
                          <span className="font-medium">{getEmotionDisplayName(emotion.name)}</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(emotion.score * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getEmotionColor(index)}`}
                          style={{ width: `${emotion.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
          
          <EmotionalInsights analysis={analysis} />
        </div>
        
        {/* Right column: Music Recommendations and History */}
        <div className="lg:col-span-5">
          <MusicRecommendations musicSuggestions={analysis.musicSuggestions} />
          
          <AnalysisHistory 
            history={analysisHistory} 
            onSelectHistory={onSelectHistory}
          />
        </div>
      </div>
    </section>
  );
}

// Helper function to get emotion icon component
function getEmotionIcon(emotion: string): JSX.Element {
  const normalizedEmotion = emotion.toLowerCase();
  
  // Map emotions to Lucide icons
  if (normalizedEmotion.includes('joy') || normalizedEmotion.includes('happy')) {
    return <SmilePlus className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('depress')) {
    return <Frown className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('angry') || normalizedEmotion.includes('rage') || normalizedEmotion.includes('upset')) {
    return <Angry className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('neutral')) {
    return <Meh className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('calm') || normalizedEmotion.includes('relax')) {
    return <CloudFog className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('excite') || normalizedEmotion.includes('energetic')) {
    return <Sparkles className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('fear') || normalizedEmotion.includes('anxious')) {
    return <AlertTriangle className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('content')) {
    return <Sparkles className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('disgust')) {
    return <HeartCrack className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('surprise')) {
    return <Zap className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('thoughtful') || normalizedEmotion.includes('contemplate')) {
    return <Brain className="h-4 w-4" />;
  } else if (normalizedEmotion.includes('confused')) {
    return <Calendar className="h-4 w-4" />;
  } else {
    return <Meh className="h-4 w-4" />;
  }
}

// Helper function to get emotion name for display
function getEmotionDisplayName(emotion: string): string {
  // Format emotion name for better display
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}

function getEmotionColor(index: number): string {
  const colors = [
    'bg-primary', 
    'bg-secondary/80', 
    'bg-accent/90',
    'bg-blue-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-emerald-500'
  ];
  
  return colors[index % colors.length] || 'bg-gray-500';
}

// Get color class based on emotion name for badges
function getEmotionBadgeColor(emotion: string): string {
  const normalizedEmotion = emotion.toLowerCase();
  
  if (normalizedEmotion.includes('joy') || normalizedEmotion.includes('happy') || normalizedEmotion.includes('content')) {
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  } else if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('depress')) {
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  } else if (normalizedEmotion.includes('angry') || normalizedEmotion.includes('rage') || normalizedEmotion.includes('upset')) {
    return 'bg-red-100 text-red-800 hover:bg-red-200';
  } else if (normalizedEmotion.includes('neutral')) {
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  } else if (normalizedEmotion.includes('calm') || normalizedEmotion.includes('relax')) {
    return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
  } else if (normalizedEmotion.includes('excite') || normalizedEmotion.includes('energetic')) {
    return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
  } else if (normalizedEmotion.includes('fear') || normalizedEmotion.includes('anxious')) {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
  } else if (normalizedEmotion.includes('disgust')) {
    return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
  } else if (normalizedEmotion.includes('surprise')) {
    return 'bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200';
  } else {
    return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
  }
}