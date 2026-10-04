import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
interface SpeechResult { results: { [key: number]: { [key: number]: { transcript: string } }; length: number }; }
interface SpeechRecognition {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: SpeechResult) => void) | null; onend: (() => void) | null; onerror: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition };
export function VoiceInput({ onText, disabled = false }: { onText: (text: string) => void; disabled?: boolean }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<SpeechRecognition | null>(null);
  useEffect(() => () => { if (active.current) { active.current.onend = null; active.current.onerror = null; active.current.abort(); } }, []);
  const Constructor = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
  if (!Constructor) return <p className="text-xs text-muted-foreground">Voice input is unavailable in this browser. You can type your message.</p>;
  function start() {
    if (listening) { active.current?.stop(); return; }
    if (!Constructor) return;
    const speech = new Constructor(); active.current = speech;
    speech.lang = 'en-NG'; speech.interimResults = false; speech.continuous = false;
    speech.onresult = event => onText(Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript).join(' '));
    speech.onend = () => setListening(false);
    speech.onerror = () => { setListening(false); setError('Microphone unavailable. Check browser permission or type instead.'); };
    setError('');
    try { speech.start(); setListening(true); } catch { setError('Could not start voice input.'); }
  }
  return <div className="space-y-1"><Button type="button" variant="outline" disabled={disabled} onClick={start}>{listening ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}{listening ? 'Stop listening' : 'Use voice'}</Button><p className="text-xs text-muted-foreground">Your browser’s speech service transcribes audio. Review the text before sending.</p>{error && <p role="alert" className="text-sm">{error}</p>}</div>;
}
