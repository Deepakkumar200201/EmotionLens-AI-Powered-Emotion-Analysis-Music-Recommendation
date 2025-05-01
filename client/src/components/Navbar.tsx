import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface NavbarProps {
  onUploadClick: () => void;
}

export default function Navbar({ onUploadClick }: NavbarProps) {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <span className="material-icons text-primary mr-2">sentiment_satisfied_alt</span>
            <h1 className="text-xl font-medium text-primary">
              Emotion<span className="text-accent">Lens</span>
            </h1>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`transition-all font-medium ${location === '/' ? 'text-primary' : 'text-[#121212] hover:text-primary'}`}>
            Dashboard
          </Link>
          <Link href="/history" className={`transition-all font-medium ${location === '/history' ? 'text-primary' : 'text-[#121212] hover:text-primary'}`}>
            History
          </Link>
          <Link href="/music" className={`transition-all font-medium ${location === '/music' ? 'text-primary' : 'text-[#121212] hover:text-primary'}`}>
            Music
          </Link>
          <Link href="/profile" className={`transition-all font-medium ${location === '/profile' ? 'text-primary' : 'text-[#121212] hover:text-primary'}`}>
            Profile
          </Link>
          <Link href="/settings" className={`transition-all font-medium ${location === '/settings' ? 'text-primary' : 'text-[#121212] hover:text-primary'}`}>
            Settings
          </Link>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="default" 
            className="rounded-full bg-primary text-white"
            onClick={onUploadClick}
          >
            <span className="material-icons mr-1">add_a_photo</span>
            <span className="hidden md:inline-block">Upload</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
