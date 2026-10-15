/** User-facing copy for SpeechRecognitionErrorEvent.error codes. */
export function speechErrorMessage(code: string): string {
  switch (code) {
    case "aborted":
      return "";
    case "no-speech":
      return "No speech detected. Tap the mic and try again.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone blocked. Allow mic for localhost in the browser site settings, then reload.";
    case "audio-capture":
      return "No microphone found or it is in use by another app.";
    case "network":
      return "Speech recognition needs internet (Chrome uses online recognition). Check connection or type instead.";
    case "language-not-supported":
      return "English (en-US) recognition is not available in this browser.";
    default:
      return `Voice error (${code}). Use Chrome or Edge on desktop, allow mic, stay online, or type instead.`;
  }
}
