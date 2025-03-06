'use client';

export default function Footer() {
  return (
    <footer className="bg-[#13131A] py-2 px-4 border-t border-gray-800 w-full">
      <div className="flex items-center justify-between text-[10px] md:text-sm text-gray-400">
        <div>
          <span>SubsWise v1.4</span>
          <span className="mx-1 md:mx-2">•</span>
          <span>© 2025 All rights reserved</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <span>Created by</span>
          <a 
            href="https://github.com/lazutlivera" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#6C5DD3] hover:text-[#5B4EC2] transition-colors"
          >
            Dogan Ozturk
          </a>
        </div>
      </div>
    </footer>
  );
} 