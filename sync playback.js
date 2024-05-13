import WaveSurfer from '/node_modules/wavesurfer.js/dist/wavesurfer.js';

// Create the first WaveSurfer instance
const wavesurfer = WaveSurfer.create({
  container: document.body,
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
})

// Create the second WaveSurfer instance
const wavesurfer2 = WaveSurfer.create({
  container: document.body,
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
})

// Load the same audio file into both instances
wavesurfer.load('/static/audio/en_example.wav');
wavesurfer2.load('/static/audio/en_example.wav');

let isSyncingWavesurfer1 = false;
let isSyncingWavesurfer2 = false;

wavesurfer.once('decode', () => {
  const slider = document.querySelector('input[type="range"]');
  
  // Event listener for the zoom control
  slider.addEventListener('input', (e) => {
    const zoomLevel = e.target.valueAsNumber;
    wavesurfer.zoom(zoomLevel);
    wavesurfer2.zoom(zoomLevel); // Sync the zoom level of the second instance
  });

  // Toggle play/pause on both instances
  document.querySelector('button').addEventListener('click', () => {
    wavesurfer.playPause();
    wavesurfer2.playPause();
  });
});

// Sync the playback position when playing
wavesurfer.on('seek', position => {
  if (!isSyncingWavesurfer2) {
    isSyncingWavesurfer1 = true;
    wavesurfer2.seekTo(position);
    isSyncingWavesurfer1 = false;
  }
});

wavesurfer2.on('seek', position => {
  if (!isSyncingWavesurfer1) {
    isSyncingWavesurfer2 = true;
    wavesurfer.seekTo(position);
    isSyncingWavesurfer2 = false;
  }
});

// Sync the playhead position during playback
wavesurfer.on('audioprocess', time => {
  if (!isSyncingWavesurfer2 && wavesurfer2.isPlaying()) {
    isSyncingWavesurfer1 = true;
    wavesurfer2.seekTo(time / wavesurfer.getDuration());
    isSyncingWavesurfer1 = false;
  }
});
wavesurfer2.on('audioprocess', time => {
  if (!isSyncingWavesurfer1 && wavesurfer.isPlaying()) {
    isSyncingWavesurfer2 = true;
    wavesurfer.seekTo(time / wavesurfer2.getDuration());
    isSyncingWavesurfer2 = false;
  }
});
