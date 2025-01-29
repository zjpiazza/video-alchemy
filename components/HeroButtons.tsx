'use client';

interface HeroButtonsProps {
  isSupabaseConnected: boolean;
}

export default function HeroButtons({ isSupabaseConnected }: HeroButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button 
        onClick={() => window.location.href = '#features'}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Learn More
      </button>
      {isSupabaseConnected && (
        <button 
          onClick={() => document.querySelector('[data-auth-trigger]')?.click()}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Sign Up / Login
        </button>
      )}
    </div>
  );
} 