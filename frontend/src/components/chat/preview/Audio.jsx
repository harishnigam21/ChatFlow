import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

const Audio = ({ url, name = "Glimpse of Us", artist = "Joji" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frequencies, setFrequencies] = useState(new Array(12).fill(0));

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // --- Audio Visualizer Logic ---
  const setupAudioVisualizer = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      const source = context.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(context.destination);

      analyser.fftSize = 64; 
      audioContextRef.current = context;
      analyserRef.current = analyser;
    }
  };

  const updateVisualizer = () => {
    if (analyserRef.current && isPlaying) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Map data to the 12 bars inside the circle
      const simplifiedData = Array.from(dataArray.slice(0, 12)).map(val => val / 255);
      setFrequencies(simplifiedData);
      
      animationRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      animationRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      cancelAnimationFrame(animationRef.current);
      setFrequencies(new Array(12).fill(0));
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // --- Handlers ---
  const togglePlay = () => {
    setupAudioVisualizer();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);

  // --- UI Calculations ---
  const svgSize = 300;
  const strokeWidth = 8;
  const radius = (svgSize / 2) - (strokeWidth * 2);
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - ((currentTime / (duration || 1)) * circumference);

  // --- Style Classes ---
  const neumorphicButton = "bg-[#282C33] text-[#34A853] flex items-center justify-center rounded-full hover:scale-105 transition-all duration-200";

  return (
    <div className="flex items-center justify-center font-sans w-full">
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata} 
        onDurationChange={handleLoadedMetadata}
        crossOrigin="anonymous" 
      />

      <div className="w-full bg-[#282C33] p-8 rounded-[45px] border border-[#2b3038]">
        
        {/* Progress & Visualizer Container */}
        <div className="relative aspect-square max-w-100 m-auto flex items-center justify-center mb-10">
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`}>
            <circle className="text-gray-800/30" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={svgSize / 2} cy={svgSize / 2} />
            <circle className="text-[#34A853] transition-all duration-200" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={svgSize / 2} cy={svgSize / 2} />
          </svg>

          {/* Inner Circle Artwork + Reacting Bars */}
          <div className="absolute inset-0 m-8 bg-linear-to-tr from-[#20c37f] via-[#103E5D] to-[#1C3253] rounded-full shadow-lg overflow-hidden flex items-end justify-center gap-1 pb-10 px-8">
             {frequencies.map((scale, i) => (
               <div 
                key={i}
                className="w-1.5 bg-white/50 rounded-full transition-all duration-75"
                style={{ 
                  height: `${Math.max(12, scale * 65)}%`, 
                  opacity: 0.4 + (scale * 0.6) 
                }}
               />
             ))}
          </div>
        </div>

        {/* Dynamic Name & Artist */}
        <div className="text-center mb-10">
          <h2 className="text-xl line-clamp-2 font-bold text-gray-200 truncate px-2">{name}</h2>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className={`w-12 h-12 ${neumorphicButton} text-[#34A853]/60`}>
            <SkipBack size={20} fill="currentColor" />
          </button>
          
          <button onClick={togglePlay} className={`w-20 h-20 ${neumorphicButton}`}>
            {isPlaying ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} className="ml-1" fill="currentColor" />
            )}
          </button>

          <button className={`w-12 h-12 ${neumorphicButton} text-[#34A853]/60`}>
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Audio;