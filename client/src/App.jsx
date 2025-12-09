import React from 'react';
import { VoiceWidget } from './components/VoiceWidget';
import { ChefHat } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-center gap-2">
        <ChefHat className="w-8 h-8 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-800">Chef In Kitchen</h1>
      </header>

      <main className="w-full max-w-md mx-auto">
        <VoiceWidget />

        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg text-sm text-gray-600 text-center">
          <p>Make sure your microphone is enabled.</p>
          <p className="mt-2 text-xs text-gray-400">Powered by ElevenLabs & Gemini</p>
        </div>
      </main>
    </div>
  );
}

export default App;
