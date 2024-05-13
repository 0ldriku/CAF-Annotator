import WaveSurfer from '/node_modules/wavesurfer.js/dist/wavesurfer.js';
import RegionsPlugin from '/node_modules/wavesurfer.js/dist/plugins/regions.esm.js';

// Create an instance of WaveSurfer
const ws = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'violet',
  progressColor: 'purple',
});



// Initialize the Regions plugin
const wsRegions = ws.registerPlugin(RegionsPlugin.create());

ws.on('ready', function() {
  console.log('WaveSurfer is ready');
});

// Load your audio
ws.load('/static/audio/en_example.wav');



// Function to parse ASS subtitle format
function parseASS(data) {
  const events = [];
  let format = [];
  const lines = data.split('\n');
  lines.forEach(line => {
    if (line.startsWith('Format:')) {
      format = line.split(': ')[1].split(',').map(item => item.trim());
    } else if (line.startsWith('Dialogue:')) {
      const parts = line.split(',').map(item => item.trim());
      if (parts.length > 9) {
        const startTime = parts[1];
        const endTime = parts[2];
        const text = parts.slice(9).join(',').replace(/\\N/g, ' ');
        events.push({
          start: parseTime(startTime),
          end: parseTime(endTime),
          text: text
        });
      }
    }
  });
  return events;
}

// Helper function to convert time format from ASS to seconds
function parseTime(timeString) {
  const [h, m, s] = timeString.split(':');
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
}

// Function to load subtitles
function loadSubtitles() {
  const fileInput = document.getElementById('subtitle-file');
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const subtitles = parseASS(e.target.result);
        subtitles.forEach(sub => {
          wsRegions.addRegion({
            start: sub.start,
            end: sub.end,
            data: { label: sub.text },
            content: sub.text
          });
        });
      } catch (error) {
        console.error('Error parsing the subtitle file:', error);
      }
    };
    reader.readAsText(file);
  }
}


// Expose the loadSubtitles function to the global scope
window.loadSubtitles = loadSubtitles;

// Update the zoom level on slider change
ws.once('decode', () => {
  const slider = document.querySelector('input[type="range"]');
  slider.addEventListener('input', (e) => {
    const minPxPerSec = e.target.valueAsNumber;
    ws.zoom(minPxPerSec);
  });
});



// Play a region on click
let activeRegion = null
wsRegions.on('region-clicked', (region, e) => {
  e.stopPropagation()
  region.play()
  activeRegion = region
})
ws.on('timeupdate', (currentTime) => {
  // When the end of the region is reached
  if (activeRegion && currentTime >= activeRegion.end) {
    // Stop playing
    ws.pause()
    activeRegion = null
  }
})