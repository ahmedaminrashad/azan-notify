import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

export async function playTakbir(): Promise<void> {
  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
    allowsRecording: false,
  });

  if (!player) {
    player = createAudioPlayer(require('../../assets/sounds/azansound.wav'));
  }

  player.muted = false;
  player.volume = 1;
  await player.seekTo(0);
  player.play();
}
