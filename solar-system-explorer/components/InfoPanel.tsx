import React, { useState, useEffect } from 'react';
import { PlanetData } from '../types';
import { generatePlanetFact, askAstronomer } from '../services/geminiService';
import { X, Sparkles, MessageCircle, Loader2 } from 'lucide-react';

interface InfoPanelProps {
  selectedPlanet: PlanetData | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedPlanet, onClose }) => {
  const [aiFact, setAiFact] = useState<string>('');
  const [loadingFact, setLoadingFact] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);

  useEffect(() => {
    setAiFact('');
    setAiResponse('');
    setQuestion('');
    
    if (selectedPlanet) {
      handleGetFact(selectedPlanet.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanet]);

  const handleGetFact = async (name: string) => {
    setLoadingFact(true);
    const fact = await generatePlanetFact(name);
    setAiFact(fact);
    setLoadingFact(false);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanet || !question.trim()) return;

    setLoadingResponse(true);
    const answer = await askAstronomer(selectedPlanet.name, question);
    setAiResponse(answer);
    setLoadingResponse(false);
  };

  if (!selectedPlanet) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 text-white overflow-y-auto transition-all duration-300 z-20 shadow-2xl">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="mt-8">
        <h2 className="text-4xl font-bold mb-2" style={{ color: selectedPlanet.color }}>
          {selectedPlanet.name}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          {selectedPlanet.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Distance</div>
            <div className="text-lg font-semibold">{selectedPlanet.distance} AU (scaled)</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Radius</div>
            <div className="text-lg font-semibold">{selectedPlanet.radius} units</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="flex items-center gap-2 mb-3 text-purple-300 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>Gemini Insights</span>
          </div>
          
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 min-h-[80px]">
            {loadingFact ? (
              <div className="flex items-center justify-center h-full py-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : (
              <p className="text-purple-100 text-sm italic">
                "{aiFact}"
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-3 text-blue-300 font-semibold">
            <MessageCircle className="w-5 h-5" />
            <span>Ask Astronomer</span>
          </div>
          
          <form onSubmit={handleAskQuestion} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask about ${selectedPlanet.name}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={loadingResponse || !question.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
              >
                {loadingResponse ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask'}
              </button>
            </div>
          </form>

          {aiResponse && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <p className="text-blue-100 text-sm">
                {aiResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;