import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [musicRecommendations, setMusicRecommendations] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onUploadClick={() => {}} />
      
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                      <p className="text-sm text-[#757575]">Switch to dark theme</p>
                    </div>
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" className="text-base">Notifications</Label>
                      <p className="text-sm text-[#757575]">Receive analysis notifications</p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={notifications} 
                      onCheckedChange={setNotifications} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="music-recommendations" className="text-base">Music Recommendations</Label>
                      <p className="text-sm text-[#757575]">Show personalized music recommendations</p>
                    </div>
                    <Switch 
                      id="music-recommendations" 
                      checked={musicRecommendations} 
                      onCheckedChange={setMusicRecommendations} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="save-history" className="text-base">Save History</Label>
                      <p className="text-sm text-[#757575]">Save your analysis history</p>
                    </div>
                    <Switch 
                      id="save-history" 
                      checked={saveHistory} 
                      onCheckedChange={setSaveHistory} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">Data & Privacy</h2>
                
                <p className="text-[#757575] mb-4">
                  Manage your personal data and privacy settings
                </p>
                
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="material-icons mr-2">download</span>
                    Download Your Data
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <span className="material-icons mr-2">delete</span>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">About</h2>
                
                <div className="mb-6">
                  <p className="text-primary text-lg font-medium">
                    Emotion<span className="text-accent">Lens</span>
                  </p>
                  <p className="text-sm text-[#757575]">Version 1.0.0</p>
                </div>
                
                <p className="text-[#757575] mb-4">
                  EmotionLens analyzes your photos, determines your mood, and provides personalized music recommendations.
                </p>
                
                <div className="space-y-2">
                  <a href="#" className="text-primary hover:underline text-sm block">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-primary hover:underline text-sm block">
                    Terms of Service
                  </a>
                  <a href="#" className="text-primary hover:underline text-sm block">
                    Contact Support
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNavigation onUploadClick={() => {}} />
    </div>
  );
}