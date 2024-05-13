import WaveSurfer from '/node_modules/wavesurfer.js/dist/wavesurfer.js';
import RegionsPlugin from '/node_modules/wavesurfer.js/dist/plugins/regions.esm.js';



const wavesurfer = WaveSurfer.create({
  container: "#waveform1",
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
  hideScrollbar: true,
});

const wavesurfer2 = WaveSurfer.create({
  container: "#waveform2",
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
});



// Load the audio file into the first instance
const audioUrl = '/static/audio/en_example.wav';
wavesurfer.load(audioUrl);
//wavesurfer2.load("/static/audio/silentaudio.wav");

wavesurfer.on('ready', function() {
  const duration = wavesurfer.getDuration(); // Get the duration of the audio in seconds
  const resolution = 1; // Define how many peaks per second you want (e.g., 10 peaks per second)
  const peaks = new Array(Math.ceil(duration * resolution)).fill(0); // Calculate total peaks and fill with zeros

  // Load the silent waveform into wavesurfer2 with the calculated peaks
  wavesurfer2.load(audioUrl, peaks, duration);
});
wavesurfer2.setVolume(0);







// Initialize the Regions plugin
const wsRegions2 = wavesurfer2.registerPlugin(RegionsPlugin.create());

// Get the RegionsPlugin prototype
const RegionsPluginProto = Object.getPrototypeOf(wsRegions2);

// Override the avoidOverlapping method with an empty implementation
RegionsPluginProto.avoidOverlapping = function(region) {
  // Empty implementation
};



// Attach event listener to wavesurfer2 for scroll event
wavesurfer2.on('ready', function() {
  wavesurfer2.on('scroll', (visibleStartTime, visibleEndTime) => {
    console.log('Scroll', visibleStartTime + 's', visibleEndTime + 's');
    wavesurfer.setScrollTime(visibleStartTime);
  });
});

// Sync the cursor with wavesurfer
wavesurfer.on('click', () => {
  const currentTime = wavesurfer.getCurrentTime(); // Get current time of wavesurfer2
  wavesurfer2.setTime(currentTime); // Set this time on wavesurfer
});

// Click event on wavesurfer2 to sync its time to wavesurfer
wavesurfer2.on('click', () => {
  const currentTime = wavesurfer2.getCurrentTime(); // Get current time of wavesurfer2
  wavesurfer.setTime(currentTime); // Set this time on wavesurfer
});



// Update the zoom level on slider change
wavesurfer.once('decode', () => {
  const slider = document.querySelector('input[type="range"]');
  slider.addEventListener('input', (e) => {
    const minPxPerSec = e.target.valueAsNumber;
    wavesurfer.zoom(minPxPerSec);
    wavesurfer2.zoom(minPxPerSec);
  });

  document.querySelector('button').addEventListener('click', () => {
    wavesurfer.playPause();
    wavesurfer2.playPause();
  });
});

// above is the code of multitrack

// below is the code of subtitle loading


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
          wsRegions2.addRegion({
            start: sub.start,
            end: sub.end,
            //data: { label: sub.text },
            content: sub.text,
            contentEditable: true,
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

// Play a region on click
/*
let activeRegion = null
wsRegions.on('region-clicked', (region, e) => {
  e.stopPropagation()
  region.play()
  activeRegion = region
})
wavesurfer2.on('timeupdate', (currentTime) => {
  // When the end of the region is reached
  if (activeRegion && currentTime >= activeRegion.end) {
    // Stop playing
    wavesurfer2.pause()
    activeRegion = null
  }
});
*/


// Add a segment to the waveform
document.getElementById('addSegmentBtn').addEventListener('click', function() {
  const currentTime = wavesurfer.getCurrentTime();
  const duration = 2; // Duration of the segment in seconds
  wsRegions2.addRegion({
    start: currentTime,
    end: currentTime + duration,
    data: { label: 'Segment' }, // Additional data for the segment
    content: "marker",
    contentEditable: true
  });
});

