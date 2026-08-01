import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Voice input is fully wired on web via the browser's SpeechRecognition API.
 * Native (iOS/Android) speech-to-text needs a native module (e.g. a config
 * plugin wrapping platform Speech frameworks) that requires a custom dev
 * build to install and verify — outside what this environment can build or
 * test, so native taps surface a clear "not available yet" state instead of
 * pretending to listen.
 */

export type VoiceInputState = 'idle' | 'listening' | 'unsupported';

function getSpeechRecognitionCtor(): any {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [state, setState] = useState<VoiceInputState>('idle');
  const recognitionRef = useRef<any>(null);

  const isSupported = getSpeechRecognitionCtor() !== null;

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setState('unsupported');
      return;
    }

    const recognition = new Ctor();
    recognition.lang = 'en-CA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    recognition.onerror = () => setState('idle');
    recognition.onend = () => setState((prev) => (prev === 'listening' ? 'idle' : prev));

    recognitionRef.current = recognition;
    recognition.start();
    setState('listening');
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  return { state, isSupported, start, stop };
}
