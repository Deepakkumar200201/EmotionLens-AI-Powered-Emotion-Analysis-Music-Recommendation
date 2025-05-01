import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Analysis } from "@shared/schema";

interface AnalysisHistoryProps {
  history: Analysis[];
  onSelectHistory: (analysis: Analysis) => void;
}

export default function AnalysisHistory({ history, onSelectHistory }: AnalysisHistoryProps) {
  // Only show the most recent 3 analyses
  const recentHistory = history.slice(0, 3);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4">Your Analysis History</h3>
        
        {recentHistory.length === 0 ? (
          <p className="text-[#757575] text-sm">No previous analyses yet. Upload a photo to get started.</p>
        ) : (
          <div className="space-y-4">
            {recentHistory.map((item) => (
              <div 
                key={item.id}
                className="flex items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0 cursor-pointer"
                onClick={() => onSelectHistory(item)}
              >
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-4">
                  <img 
                    src={item.imageUrl} 
                    alt="Previous analysis thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium text-[#121212]">{item.label}</h5>
                    <span className="text-xs text-[#757575]">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons text-sm text-secondary mr-1">
                      {getEmotionIcon(item.emotions[0].name)}
                    </span>
                    <span className="text-sm text-[#757575]">
                      {item.emotions[0].name} ({Math.round(item.emotions[0].score * 100)}%)
                      {item.emotions[1] && `, ${item.emotions[1].name} (${Math.round(item.emotions[1].score * 100)}%)`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {history.length > 3 && (
          <Button 
            variant="link"
            className="text-primary font-medium text-sm flex items-center mt-4 hover:text-accent transition-all p-0"
          >
            View all history
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function getEmotionIcon(emotion: string): string {
  const icons: Record<string, string> = {
    'Joy': 'sentiment_very_satisfied',
    'Happy': 'sentiment_very_satisfied',
    'Sad': 'sentiment_very_dissatisfied',
    'Angry': 'mood_bad',
    'Surprised': 'sentiment_neutral',
    'Fearful': 'highlight_off',
    'Disgusted': 'sick',
    'Neutral': 'sentiment_neutral',
    'Contempt': 'thumb_down',
    'Calm': 'spa',
    'Confused': 'help',
    'Content': 'sentiment_satisfied',
    'Excited': 'celebration',
  };
  
  return icons[emotion] || 'sentiment_neutral';
}
