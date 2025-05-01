import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, FileUp, ArrowRight, HelpCircle, Loader2, Music } from "lucide-react";

interface UploadSectionProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadSection({ onImageUpload, isLoading }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };
  
  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}
          transition-all duration-200 ease-in-out
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Image className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Upload your image</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Upload a photo with facial expressions for AI-powered emotion analysis and personalized recommendations
            </p>
          </div>
          
          <div className="grid gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoading}
              className="gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>Select Image</span>
                </>
              )}
            </Button>
            
            <input
              id="image-upload"
              type="file"
              className="sr-only" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              ref={fileInputRef}
            />
            
            <p className="text-xs text-muted-foreground">
              Or drag and drop your image here
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground px-1">
        <p>Supported formats: JPG, PNG, GIF</p>
        <Button variant="link" size="sm" className="h-auto p-0 gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Help</span>
        </Button>
      </div>
      
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold">How it works</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium">Upload Photo</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a clear photo showing your facial expression
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium">AI Analysis</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Our AI analyzes your emotions with advanced technology
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card border">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium">Get Recommendations</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Receive personalized music and mood improvement suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
