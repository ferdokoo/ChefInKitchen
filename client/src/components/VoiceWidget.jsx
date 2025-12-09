import React, { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export function VoiceWidget() {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, connecting, connected, error

    const conversation = useConversation({
        onConnect: () => setStatus('connected'),
        onDisconnect: () => {
            setStatus('idle');
            setIsActive(false);
        },
        onError: (error) => {
            console.error('Conversation error:', error);
            setStatus('error');
            setIsActive(false);
        },
        onModeChange: (mode) => {
            // mode can be 'listening', 'speaking', 'processing'
            console.log('Mode changed:', mode);
        }
    });

    const toggleConversation = useCallback(async () => {
        if (isActive) {
            await conversation.endSession();
            setIsActive(false);
        } else {
            setStatus('connecting');
            try {
                // Fetch signed URL from our backend
                const response = await fetch('https://chef-kitchen-server-295000943592.us-central1.run.app/api/get-signed-url');
                if (!response.ok) {
                    throw new Error('Failed to get signed URL');
                }
                const { signedUrl } = await response.json();

                // Start session with signed URL
                await conversation.startSession({
                    signedUrl,
                });
                setIsActive(true);
            } catch (error) {
                console.error("Failed to start session:", error);
                setStatus('error');
            }
        }
    }, [isActive, conversation]);

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Chef Assistant</h2>
                <p className="text-gray-500">Tap to start cooking with voice</p>
            </div>

            <button
                onClick={toggleConversation}
                disabled={status === 'connecting'}
                className={`
          relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300
          ${isActive ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}
          shadow-lg hover:scale-105 active:scale-95
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
            >
                {status === 'connecting' ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : isActive ? (
                    <MicOff className="w-10 h-10 text-white" />
                ) : (
                    <Mic className="w-10 h-10 text-white" />
                )}

                {isActive && (
                    <span className="absolute -inset-1 rounded-full border-4 border-red-500 opacity-20 animate-ping"></span>
                )}
            </button>

            <div className="h-6 text-sm font-medium text-gray-600">
                {status === 'idle' && "Ready"}
                {status === 'connecting' && "Connecting..."}
                {status === 'connected' && "Listening..."}
                {status === 'error' && <span className="text-red-500">Connection Failed</span>}
            </div>
        </div>
    );
}
