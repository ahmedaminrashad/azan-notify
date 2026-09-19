import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

export async function playTakbir(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'duckOthers',
  });

  if (!player) {
    player = createAudioPlayer(require('../../assets/sounds/azansound.wav'));
  }

  await player.seekTo(0);
  player.play();
}
