import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  Modal,
} from 'react-native';
import {Clock, ShieldAlert, Zap} from 'lucide-react-native';
import {useAuth} from '../context/AuthContext';

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_START = 60; // 60 seconds

const InactivityOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);
  const {logout} = useAuth();

  // Timer refs
  const inactivityTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setIsVisible(false);
    setSecondsLeft(COUNTDOWN_START);
    inactivityTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, INACTIVITY_TIME);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (isVisible && secondsLeft > 0) {
      countdownInterval.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      logout();
    }
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [isVisible, secondsLeft, logout]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
      onMoveShouldSetPanResponder: () => {
        resetTimer();
        return false;
      },
    }),
  ).current;

  if (!isVisible) {
    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
        }}
      />
    );
  }

  return (
    <Modal transparent visible={isVisible} animationType="fade"><View className="flex-1 bg-[#0C0A09]/95 items-center justify-center px-10"><View className="shadow-2xl shadow-orange-600/30 elevation-2xl w-full"><View className="bg-[#171412] w-full p-12 rounded-[32px] border border-stone-800 items-center overflow-hidden"><View className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16" /><View className="w-24 h-24 bg-orange-600/10 rounded-3xl items-center justify-center mb-8 border border-orange-600/20"><ShieldAlert color="#EA580C" size={40} strokeWidth={2.5} /></View><Text className="text-textPrimary text-3xl font-bold tracking-tight text-center mb-4">
              Inactivity Alert
            </Text><Text className="text-stone-500 text-center font-bold tracking-tight text-sm leading-relaxed mb-10 px-4">
              We've detected a pause in telemetry. Session will self-terminate
              to maintain grid security.
            </Text><View className="w-full bg-[#0C0A09] p-8 rounded-[40px] border border-stone-800 items-center justify-center mb-10 relative"><View
                className="absolute left-0 top-0 bottom-0 bg-orange-600/5"
                style={{width: `${(secondsLeft / COUNTDOWN_START) * 100}%`}}
              /><Text className="text-stone-700 text-xs font-bold tracking-tight mb-3 uppercase">
                Time to Termination
              </Text><Text className="text-orange-600 text-3xl font-bold tracking-tight tabular-nums">
                {secondsLeft}s
              </Text></View><TouchableOpacity
                onPress={resetTimer}
                className="bg-orange-600 py-5 rounded-2xl items-center justify-center active:scale-95 transition-all w-full"><Text className="text-white font-bold tracking-tight text-xs uppercase">
                  Resume Session
                </Text></TouchableOpacity><TouchableOpacity onPress={logout} className="mt-6"><Text className="text-stone-700 font-bold tracking-tight text-xs uppercase">
                Sign Out Now
              </Text></TouchableOpacity></View></View></View></Modal>
  );
};

export default InactivityOverlay;
