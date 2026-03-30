import { useState, useEffect } from 'react';

export default function Loading({ messages }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 500);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-accent-maroon border-t-transparent animate-spin mx-auto"></div>
        </div>
        <p
          className={`text-xl text-gray-600 transition-opacity duration-500 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {messages[currentIndex]}
        </p>
      </div>
    </div>
  );
}
