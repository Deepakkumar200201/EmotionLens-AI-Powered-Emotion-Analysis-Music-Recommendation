import { Link, useLocation } from "wouter";

interface MobileNavigationProps {
  onUploadClick: () => void;
}

export default function MobileNavigation({ onUploadClick }: MobileNavigationProps) {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around items-center">
        <Link href="/" className={`flex flex-col items-center justify-center p-3 ${location === '/' ? 'text-primary' : 'text-[#757575]'}`}>
          <span className="material-icons">dashboard</span>
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link href="/history" className={`flex flex-col items-center justify-center p-3 ${location === '/history' ? 'text-primary' : 'text-[#757575]'}`}>
          <span className="material-icons">history</span>
          <span className="text-xs mt-1">History</span>
        </Link>
        
        <button 
          className="flex flex-col items-center justify-center p-3 text-white bg-primary rounded-full w-14 h-14 -mt-5 shadow-md border-none"
          onClick={onUploadClick}
        >
          <span className="material-icons">add_a_photo</span>
        </button>
        
        <Link href="/music" className={`flex flex-col items-center justify-center p-3 ${location === '/music' ? 'text-primary' : 'text-[#757575]'}`}>
          <span className="material-icons">music_note</span>
          <span className="text-xs mt-1">Music</span>
        </Link>
        
        <Link href="/profile" className={`flex flex-col items-center justify-center p-3 ${location === '/profile' ? 'text-primary' : 'text-[#757575]'}`}>
          <span className="material-icons">person</span>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
