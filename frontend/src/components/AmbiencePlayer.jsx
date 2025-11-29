import { useState, useRef, useEffect } from 'react';
import { CloudRain, Coffee, Volume2, VolumeX, Volume1, Music, Headphones } from 'lucide-react';
import { clsx } from 'clsx';

const SOUNDS = [
    { id: 'rain', label: 'Gotham Rain', icon: CloudRain, url: '/sounds/rain.ogg' },
    { id: 'whitenoise', label: 'Batcave Hum', icon: Coffee, url: '/sounds/whitenoise.ogg' },
    { id: 'batman_2022', label: 'The Batman (2022)', icon: Music, url: '/sounds/batman_2022.mp3' },
    { id: 'dark_knight', label: 'The Dark Knight', icon: Headphones, url: '/sounds/dark_knight.mp3' }
];

function AmbiencePlayer() {
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;

        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsLoading(false);
            setActiveSound(null); // Reset on error
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('error', handleError);

        return () => {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        const playAudio = async () => {
            try {
                if (activeSound) {
                    const sound = SOUNDS.find(s => s.id === activeSound);
                    if (sound && audio.src !== sound.url) {
                        setIsLoading(true);
                        audio.src = sound.url;
                        audio.load(); // Explicitly load
                    }
                    await audio.play();
                } else {
                    audio.pause();
                }
            } catch (error) {
                console.error("Playback failed:", error);
                setActiveSound(null);
            }
        };

        playAudio();
    }, [activeSound]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const toggleSound = (id) => {
        if (activeSound === id) {
            setActiveSound(null);
        } else {
            setActiveSound(id);
            setIsMuted(false); // Unmute when selecting new sound
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Sound Toggles */}
            <div className="bg-[#09090b] border border-white/10 p-2 flex items-center space-x-2 shadow-2xl backdrop-blur-sm bg-opacity-95">
                {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const isActive = activeSound === sound.id;
                    return (
                        <button
                            key={sound.id}
                            onClick={() => toggleSound(sound.id)}
                            className={clsx(
                                "p-3 transition-all duration-300 relative group",
                                isActive
                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20 scale-110"
                                    : "text-slate-500 hover:text-red-400 hover:bg-white/5"
                            )}
                            title={sound.label}
                        >
                            <Icon className={clsx("w-5 h-5", isLoading && isActive && "animate-pulse")} />
                            {isActive && !isLoading && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 border-2 border-[#09090b]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default AmbiencePlayer;
