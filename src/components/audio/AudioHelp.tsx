"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/locale";
import { translate } from "@/i18n/messages";
import { audioClips } from "./clips";
import type { AudioTopic } from "./clips";

type AudioState = "idle" | "playing" | "paused" | "error";

type AudioHelpProps = {
  locale: Locale;
  topic: AudioTopic;
  text: string;
  firstVisit?: boolean;
  /** For isolated tests only; real app audio comes from the reviewed manifest. */
  testSource?: string;
};

export function AudioHelp({ locale, topic, text, firstVisit = false, testSource }: AudioHelpProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<AudioState>("idle");
  const source = testSource ?? audioClips[locale][topic];

  useEffect(() => {
    const player = audioRef.current;
    if (player && !player.paused) player.pause();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- audio source change must reset UI.
    setState("idle");
  }, [locale, source]);

  async function play(startOver = false) {
    const player = audioRef.current;
    if (!player) return;
    try {
      if (startOver) player.currentTime = 0;
      await player.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }

  function pause() {
    audioRef.current?.pause();
    setState("paused");
  }

  return (
    <section aria-label={translate(locale, "audioHelp")} className="rounded-[var(--radius-lg)] bg-mint p-5">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-white">
          {firstVisit && source && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-2 border-leaf motion-safe:animate-ping" />
          )}
          <Volume2 size={22} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-forest">{translate(locale, "audioHelp")}</h2>
      </div>
      <p className="mt-3 text-base text-ink">{text}</p>
      {!source ? (
        <p role="status" className="mt-3 text-sm text-forest">{translate(locale, "audioMissing")}</p>
      ) : (
        <>
          <audio
            ref={audioRef}
            data-testid="audio-element"
            src={source}
            preload="none"
            onEnded={() => setState("idle")}
            onError={() => setState("error")}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            {state === "playing" ? (
              <Button variant="outline" onClick={pause}><Pause size={18} aria-hidden="true" />{translate(locale, "pauseAudio")}</Button>
            ) : (
              <Button variant="primary" onClick={() => void play()}>
                <Play size={18} aria-hidden="true" />
                {translate(locale, state === "paused" ? "resumeAudio" : "playAudio")}
              </Button>
            )}
            <Button variant="soft" onClick={() => void play(true)}>
              <RotateCcw size={18} aria-hidden="true" />{translate(locale, "replayAudio")}
            </Button>
          </div>
          {state === "error" && <p role="alert" className="mt-3 text-sm text-danger">{translate(locale, "audioError")}</p>}
        </>
      )}
    </section>
  );
}
