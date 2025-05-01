import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadSection from "@/components/UploadSection";
import AnalysisSection from "@/components/AnalysisSection";
import MobileNavigation from "@/components/MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Analysis } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, BarChart2, Music, Clock, Upload, Calendar, FileUp, Eye, History as HistoryIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Query to fetch analysis history
  const { data: analysisHistory = [], refetch: refetchHistory } = useQuery<Analysis[]>({
    queryKey: ['/api/analysis/history'],
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result: Analysis = await response.json();
      
      setCurrentAnalysis(result);
      setShowAnalysis(true);
      refetchHistory();
      
      toast({
        title: "Analysis complete",
        description: "Your image has been analyzed successfully",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistory = (analysis: Analysis) => {
    setCurrentAnalysis(analysis);
    setShowAnalysis(true);
  };

  const isMobile = useIsMobile();
  const recentAnalyses = analysisHistory.slice(0, 3);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onUploadClick={() => setShowAnalysis(false)} />
      
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-8">
        {!showAnalysis ? (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">EmotionLens Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Upload an image for emotion analysis and personalized recommendations
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => document.getElementById('image-upload')?.click()}
                className="gap-2"
              >
                <FileUp className="h-5 w-5" />
                Upload Image
              </Button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center text-blue-600 dark:text-blue-400">
                    <Camera className="h-4 w-4 mr-2" />
                    Total Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysisHistory.length}</div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Images analyzed so far
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center text-purple-600 dark:text-purple-400">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Emotions Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analysisHistory.reduce((sum, analysis) => 
                      sum + (analysis.emotions?.length || 0), 0)}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Across all analyses
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center text-green-600 dark:text-green-400">
                    <Music className="h-4 w-4 mr-2" />
                    Music Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analysisHistory.reduce((sum, analysis) => 
                      sum + (analysis.musicSuggestions?.length || 0), 0)}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Songs suggested to you
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center text-rose-600 dark:text-rose-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    First Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {analysisHistory.length > 0
                      ? new Date(analysisHistory[analysisHistory.length - 1].createdAt).toLocaleDateString()
                      : 'No analyses yet'}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    Started tracking emotions
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Upload Section */}
              <div className="lg:col-span-3">
                <Card className="bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-blue-600" />
                      Image Analysis
                    </CardTitle>
                    <CardDescription>
                      Upload an image for AI-powered emotion detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UploadSection 
                      onImageUpload={handleImageUpload} 
                      isLoading={isAnalyzing}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Analyses */}
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-gray-800 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HistoryIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Recent Analyses
                      </div>
                      <Link href="/history">
                        <Button variant="outline" size="sm" className="h-8">
                          View All
                        </Button>
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Your most recent emotion analyses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentAnalyses.length > 0 ? (
                      <div className="space-y-4">
                        {recentAnalyses.map((analysis) => (
                          <div 
                            key={analysis.id} 
                            className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => handleSelectHistory(analysis)}
                          >
                            <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                              <img src={analysis.imageUrl} alt="Analysis" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{analysis.label}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysis.emotions?.slice(0, 2).map((emotion, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {emotion.name} ({Math.round(emotion.score * 100)}%)
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(analysis.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                          <HistoryIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-sm font-medium">No analyses yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload your first image to get started
                        </p>
                      </div>
                    )}
                  </CardContent>
                  {recentAnalyses.length > 0 && (
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full gap-2" onClick={() => setShowAnalysis(true)}>
                        <Eye className="h-4 w-4" />
                        View Latest Analysis
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisSection 
            analysis={currentAnalysis}
            analysisHistory={analysisHistory}
            onSelectHistory={handleSelectHistory}
          />
        )}
      </main>
      
      <Footer />
      <MobileNavigation 
        onUploadClick={() => setShowAnalysis(false)}
      />
    </div>
  );
}
