import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, Utensils } from 'lucide-react';

export function RecipeDisplay() {
    const [sessionState, setSessionState] = useState(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:3000/session/status');
                const data = await res.json();
                setSessionState(data);
            } catch (err) {
                console.error("Failed to fetch session status", err);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, []);

    if (!sessionState || sessionState.status === 'idle') {
        return (
            <div className="mt-8 text-center text-gray-500">
                <p>Start talking to generate a recipe...</p>
            </div>
        );
    }

    const { recipe, currentStepIndex, currentStep } = sessionState;

    return (
        <div className="mt-8 w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-orange-500 p-4 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {recipe.title}
                </h2>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ing, i) => (
                            <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-100">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Current Step</h3>
                    {currentStep ? (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                    {currentStepIndex + 1}
                                </div>
                                <p className="text-lg text-gray-800 leading-relaxed">
                                    {currentStep.text}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-green-600 font-medium">
                            Bon Appétit! Recipe Completed. 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
