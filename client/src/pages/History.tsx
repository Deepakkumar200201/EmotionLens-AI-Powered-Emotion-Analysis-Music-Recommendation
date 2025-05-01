import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { Analysis } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function History() {
  // Query to fetch analysis history
  const { data: analysisHistory = [] } = useQuery<Analysis[]>({
    queryKey: ['/api/analysis/history'],
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onUploadClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-8">
        <h1 className="text-3xl font-bold mb-6">Your Analysis History</h1>
        
        {analysisHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-[#757575]">No analysis history yet. Upload a photo to get started.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {analysisHistory.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.label} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-grow p-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-medium">{item.label}</h3>
                      <span className="text-sm text-[#757575]">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.emotions.slice(0, 3).map((emotion) => (
                        <span 
                          key={emotion.name}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {emotion.name} ({Math.round(emotion.score * 100)}%)
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-[#757575] mb-4">{item.description}</p>
                    
                    <div className="text-sm text-primary">
                      {item.musicSuggestions.length} music suggestions available
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      <MobileNavigation onUploadClick={() => {}} />
    </div>
  );
}