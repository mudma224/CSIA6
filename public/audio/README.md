# Audio source policy

No recordings have been approved for M0. The manifest at
`src/components/audio/clips.ts` is intentionally empty; the user sees a
text fallback instead of a broken/fictional playback control.

When approved audio arrives, record for every clip: **filename, locale (`ary`
or `en`), exact visible transcript, human reviewer, and recording/use
permission**. Add only reviewed recordings and synchronize the manifest,
transcript, tests, and the current milestone execution guide in the same PR.

No autoplay, microphone recording, generated voice, or external TTS is used.
