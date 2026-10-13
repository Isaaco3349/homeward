"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  stopSpeaking,
} from "@/lib/voice/browserSpeech";

export type SendOptions = {
  viaVoice?: boolean;
};

interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string, options?: SendOptions) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const submitText = useCallback(
    (text: string, options?: SendOptions) => {
      const body = text.trim();
      if (!body || disabled) return;
      onSend(body, options);
      setValue("");
    },
    [disabled, onSend],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitText(value);
  }

  const toggleListening = useCallback(() => {
    setVoiceError(null);

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    if (!voiceSupported) {
      setVoiceError("Voice needs Chrome or Edge with microphone access.");
      return;
    }

    stopSpeaking();
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setVoiceError("Could not start speech recognition.");
      return;
    }

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i]![0]!.transcript;
        if (event.results[i]!.isFinal) final += transcript;
        else interim += transcript;
      }
      const draft = final || interim;
      if (draft) setValue(draft.trim());
      if (final.trim()) {
        recognition.stop();
        submitText(final, { viaVoice: true });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") {
        setVoiceError(null);
      } else if (event.error === "no-speech") {
        setVoiceError("I did not hear anything. Try again.");
      } else if (event.error === "not-allowed") {
        setVoiceError("Microphone permission is blocked.");
      } else {
        setVoiceError("Voice failed. You can type instead.");
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
      setListening(true);
    } catch {
      setVoiceError("Could not start listening.");
      setListening(false);
    }
  }, [listening, voiceSupported, submitText]);

  const micDisabled = disabled || !voiceSupported;

  return (
    <div className="border-t border-border bg-surface p-4">
      {voiceError ? (
        <p className="mx-auto mb-2 max-w-3xl text-xs text-semantic-error">
          {voiceError}
        </p>
      ) : null}
      {listening ? (
        <p className="mx-auto mb-2 max-w-3xl text-xs text-text-muted">
          Listening… e.g. &quot;Send five dollars to @isaacony&quot;
        </p>
      ) : null}
      <div className="mx-auto flex max-w-3xl gap-2">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitText(value);
            }
          }}
          placeholder='e.g. Send $100 to @mum every 2nd'
          className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          disabled={micDisabled}
          onClick={toggleListening}
          aria-pressed={listening}
          title={
            listening ? "Stop listening" : "Speak your payment instruction"
          }
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
            listening
              ? "border-accent bg-accent-muted text-accent"
              : "border-border bg-bg text-text-muted hover:text-text"
          } disabled:opacity-50`}
        >
          <MicIcon active={listening} />
        </button>
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={() => submitText(value)}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-hover disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
