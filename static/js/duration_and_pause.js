import WaveSurfer from '/node_modules/wavesurfer.js/dist/wavesurfer.js';
import RegionsPlugin from '/node_modules/wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from '/node_modules/wavesurfer.js/dist/plugins/timeline.esm.js'

// Create a timeline plugin instance with custom options
const topTimeline = TimelinePlugin.create({
  height: 20,
  insertPosition: 'beforebegin',
  timeInterval: 0.2,
  primaryLabelInterval: 5,
  secondaryLabelInterval: 1,
  style: {
    fontSize: '20px',
    color: '#2D5B88',
  },
})

const wavesurfer1 = WaveSurfer.create({
  container: "#waveform1",
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
  hideScrollbar: true,
  height: "auto",
  minPxPerSec: 100,
  plugins: [topTimeline],
});

const wavesurfer2 = WaveSurfer.create({
  container: "#waveform2",
  waveColor: 'rgba(200, 0, 200, 0)',
  progressColor: 'rgba(100, 0, 100)',
  height: "auto",
  minPxPerSec: 100,
  plugins: [TimelinePlugin.create()],
});


// Assuming wavesurfer1 and wavesurfer2 are already initialized
const wavesurfers = [wavesurfer1, wavesurfer2];

// Load the audio file into the first instance
const audioUrl = '/static/audio/en_example.wav';
wavesurfer1.load(audioUrl);
//wavesurfer2.load("/static/audio/silentaudio.wav");

wavesurfer1.on('ready', function() {
  const duration = wavesurfer1.getDuration(); // Get the duration of the audio in seconds
  const resolution = 1; // Define how many peaks per second you want (e.g., 10 peaks per second)
  const peaks = new Array(Math.ceil(duration * resolution)).fill(0); // Calculate total peaks and fill with zeros

  // Load the silent waveform into wavesurfer2 with the calculated peaks
  wavesurfer2.load(audioUrl, peaks, duration);
});
wavesurfer2.setVolume(0);







// Initialize the Regions plugin
//const wsRegions1 = wavesurfer1.registerPlugin(RegionsPlugin.create()); // for test track 1

const wsRegions2 = wavesurfer2.registerPlugin(RegionsPlugin.create());

// Get the RegionsPlugin prototype
const RegionsPluginProto = Object.getPrototypeOf(wsRegions2);

// Override the avoidOverlapping method with an empty implementation
RegionsPluginProto.avoidOverlapping = function(region) {
  // Empty implementation
};


// Sync functions

// Ensure each WaveSurfer instance is ready before syncing actions
wavesurfers.forEach(ws => {
  ws.once('decode', () => {
    ws.isReady = true;
  });
});

// Function to sync zoom across all WaveSurfer instances
const syncZoom = (pxPerSec) => {
  if (pxPerSec < 1) pxPerSec = 1;
  wavesurfers.forEach(ws => {
    if (ws.isReady) {
      ws.zoom(pxPerSec);
      if (ws.drawer && typeof ws.drawer.updateSize === 'function') {
        ws.drawer.updateSize();
      }
    }
  });
};

// Function to sync play/pause state across all WaveSurfer instances
const syncPlayPause = () => {
  wavesurfers.forEach(ws => ws.playPause());
};

// Function to sync cursor time across all WaveSurfer instances
const syncCursor = (source) => {
  if (!source.isReady) return;
  const currentTime = source.getCurrentTime();
  wavesurfers.forEach(target => {
    if (target !== source && target.isReady) {
      target.setTime(currentTime);
    }
  });
};

// Function to sync scroll time across all WaveSurfer instances
const syncScroll = (source, visibleStartTime) => {
  if (!source.isReady) return;
  wavesurfers.forEach(target => {
    if (target !== source && target.isReady) {
      target.setScrollTime(visibleStartTime);
    }
  });
};

// Event listener for the input slider to sync zoom
const slider = document.querySelector('input[type="range"]');
slider.addEventListener('input', (e) => {
  const minPxPerSec = e.target.valueAsNumber;
  syncZoom(minPxPerSec);
});

// Event listener for the play/pause button to sync play/pause state
const playPauseBtn = document.getElementById('play-pause-btn');
playPauseBtn.addEventListener('click', syncPlayPause);

// Call the syncZoom function initially if you want to set an initial zoom level
slider.addEventListener('change', () => {
  const initialZoomLevel = slider.valueAsNumber;
  syncZoom(initialZoomLevel);
});

// Attach click event listeners to sync cursor across WaveSurfer instances
wavesurfers.forEach(ws => {
  ws.on('click', () => {
    syncCursor(ws);
  });
});

// Attach scroll event listeners to sync scroll across WaveSurfer instances
wavesurfers.forEach(ws => {
  ws.on('ready', () => {
    ws.on('scroll', (visibleStartTime, visibleEndTime) => {
      syncScroll(ws, visibleStartTime);
    });
  });
});

// above is the code of multitrack
// below is the code of subtitle loading


document.addEventListener('DOMContentLoaded', function() {
  console.log("Document is ready!");
  const loadButton = document.getElementById('load-subtitles-btn');
  loadButton.addEventListener('click', function() {
    console.log("Button was clicked!");
    loadJSONSubtitles();
  });
});


// Function to load subtitles from a JSON file
function loadJSONSubtitles() {
  wsRegions2.clearRegions();
  const fileInput = document.getElementById('subtitle-file');
  const file = fileInput.files[0];
  console.log("File selected:", file);

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("File read complete!");
      try {
        const subtitleData = JSON.parse(e.target.result);
        console.log("Parsed data:", subtitleData);
        subtitleData.forEach(sub => {
          wsRegions2.addRegion({
            start: sub.start,
            end: sub.end,
            content: sub.subtitle,
            contentEditable: true,
          });
        });
      } catch (error) {
        console.error('Error parsing the subtitle JSON file:', error);
      }
    };
    reader.readAsText(file);
  } else {
    console.log("No file selected.");
  }
}


// Expose the loadJSONSubtitles function to the global scope
window.loadJSONSubtitles = loadJSONSubtitles;



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

// Set active region on click
let activeRegion = null;
wsRegions2.on('region-clicked', (region, e) => {
  activeRegion = region;
});

// Add event listener for the 'Delete' key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && activeRegion) {
    deleteActiveRegion();
  }
});


// Function to delete the active region
const deleteActiveRegion = () => {
  if (activeRegion) {
    activeRegion.remove();
    activeRegion = null;
  }
};

// Add a segment to the waveform
document.getElementById('addSegmentBtn2').addEventListener('click', function() {
  const currentTime = wavesurfer1.getCurrentTime();
  const duration = 2; // Duration of the segment in seconds
  wsRegions2.addRegion({
    start: currentTime,
    end: currentTime + duration,
    data: { label: 'Segment' }, // Additional data for the segment
    content: "marker",
    contentEditable: true
  });
});


// Below is the code for saving the region data
// Initialize a storage for region data
const regionDataStore2 = {};

// Function to save region data
function saveRegionData(region) {
  try {
    regionDataStore2[region.id] = {
      start: region.start,
      end: region.end,
      content: region.content.innerText,
    };
    console.log("Region data saved:", region);
  } catch (error) {
    console.error("Error saving region data:", error);
  }
}

// Function to send region data to the server
function saveRegionDataToServer() {
  fetch('/save-region-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(regionDataStore2)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    alert('Region data saved successfully');
  })
  .catch((error) => {
    console.error('Error:', error);
    alert('Error saving region data');
  });
}

// Add event listener to the save button
document.getElementById("save-region-data-btn").addEventListener("click", saveRegionDataToServer);


// Add regions with initial data loading (if any)
wsRegions2.on('region-created', (region) => {
  console.log("Region created event triggered");
  saveRegionData(region);
  console.log("Region created in track 2:", regionDataStore2);
});

// Listen to region update events to save the new data
wsRegions2.on('region-updated', (region) => {
  console.log("Region update event triggered");
  saveRegionData(region);
  console.log("Region updated in track 2:", regionDataStore2);
});

// If you need to delete a region and update the store
wsRegions2.on('region-removed', (region) => {
  console.log("Region removed event triggered");
  delete regionDataStore2[region.id];
  console.log("Region removed in track 2:", regionDataStore2);
});