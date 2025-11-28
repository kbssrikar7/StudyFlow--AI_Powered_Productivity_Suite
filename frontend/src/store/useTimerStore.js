import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTimerStore = create(
    persist(
        (set, get) => ({
            time: 1500, // 25 minutes default
            duration: 25, // Default duration in minutes
            isRunning: false,
            isPaused: false,
            sessionId: null,
            timerInterval: null,
            error: null,

            setDuration: (minutes) => {
                set({
                    duration: minutes,
                    time: minutes * 60,
                    isRunning: false,
                    isPaused: false
                });
            },

            startTimer: () => {
                try {
                    const { isRunning, timerInterval } = get();

                    if (isRunning && timerInterval) {
                        console.warn('Timer already running');
                        return;
                    }

                    const interval = setInterval(() => {
                        set((state) => {
                            if (state.time <= 0) {
                                get().stopTimer();
                                return { time: 0, isRunning: false };
                            }
                            return { time: state.time - 1 };
                        });
                    }, 1000);

                    set({
                        isRunning: true,
                        isPaused: false,
                        timerInterval: interval,
                        error: null
                    });
                } catch (error) {
                    console.error('Error starting timer:', error);
                    set({ error: error.message });
                }
            },

            pauseTimer: () => {
                try {
                    const { timerInterval } = get();
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                    set({
                        isRunning: false,
                        isPaused: true,
                        timerInterval: null,
                        error: null
                    });
                } catch (error) {
                    console.error('Error pausing timer:', error);
                    set({ error: error.message });
                }
            },

            stopTimer: () => {
                try {
                    const { timerInterval, duration } = get();
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                    set({
                        isRunning: false,
                        isPaused: false,
                        time: duration * 60,
                        timerInterval: null,
                        sessionId: null,
                        error: null
                    });
                } catch (error) {
                    console.error('Error stopping timer:', error);
                    set({ error: error.message });
                }
            },

            resetTimer: () => {
                try {
                    const { timerInterval, duration } = get();
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                    set({
                        time: duration * 60,
                        isRunning: false,
                        isPaused: false,
                        timerInterval: null,
                        error: null
                    });
                } catch (error) {
                    console.error('Error resetting timer:', error);
                    set({ error: error.message });
                }
            },

            setSessionId: (id) => set({ sessionId: id }),

            clearError: () => set({ error: null }),
        }),
        {
            name: 'timer-storage',
            partialize: (state) => ({
                time: state.time,
                duration: state.duration,
                isPaused: state.isPaused,
                sessionId: state.sessionId,
            }),
        }
    )
);

export default useTimerStore;
