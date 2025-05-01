import { Card, CardContent } from "@/components/ui/card";
import { Analysis } from "@shared/schema";

interface EmotionalInsightsProps {
  analysis: Analysis;
}

export default function EmotionalInsights({ analysis }: EmotionalInsightsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-4">Emotional Insights</h3>
      <p className="text-[#757575] mb-4">{analysis.description}</p>
      
      <div className="flex items-start mt-6">
        <span className="material-icons text-primary mr-3">lightbulb</span>
        <div>
          <h5 className="font-medium mb-1">Recommended Activities</h5>
          <p className="text-[#757575] text-sm">{analysis.recommendedActivities}</p>
        </div>
      </div>
    </Card>
  );
}
