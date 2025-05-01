export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="material-icons text-primary mr-2">sentiment_satisfied_alt</span>
            <h2 className="text-lg font-medium text-primary">
              Emotion<span className="text-accent">Lens</span>
            </h2>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-[#757575] hover:text-primary transition-all text-sm">Privacy Policy</a>
            <a href="#" className="text-[#757575] hover:text-primary transition-all text-sm">Terms of Service</a>
            <a href="#" className="text-[#757575] hover:text-primary transition-all text-sm">Help Center</a>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-icons text-sm">facebook</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-icons text-sm">twitter</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-icons text-sm">instagram</span>
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center md:text-left text-sm text-[#757575]">
          &copy; {new Date().getFullYear()} EmotionLens. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
