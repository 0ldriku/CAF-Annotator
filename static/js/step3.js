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
  hideScrollbar: true,
});

const wavesurfer3 = WaveSurfer.create({
  container: "#waveform3",
  waveColor: 'rgba(200, 0, 200, 0)',
  progressColor: 'rgba(100, 0, 100)',
  height: "auto",
  minPxPerSec: 100,
  hideScrollbar: true,
});

const wavesurfer4 = WaveSurfer.create({
  container: "#waveform4",
  waveColor: 'rgba(200, 0, 200, 0)',
  progressColor: 'rgba(100, 0, 100)',
  height: "auto",
  minPxPerSec: 100,
  hideScrollbar: true,
});

const wavesurfer5 = WaveSurfer.create({
  container: "#waveform5",
  waveColor: 'rgba(200, 0, 200, 0)',
  progressColor: 'rgba(100, 0, 100)',
  height: "auto",
  minPxPerSec: 100,
  plugins: [TimelinePlugin.create()],
});

// Assuming wavesurfer1 and wavesurfer2 are already initialized
const wavesurfers = [wavesurfer1, wavesurfer2, wavesurfer3, wavesurfer4, wavesurfer5];


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
  wavesurfer3.load(audioUrl, peaks, duration);
  wavesurfer4.load(audioUrl, peaks, duration);
  wavesurfer5.load(audioUrl, peaks, duration);
});

wavesurfer2.setVolume(0);
wavesurfer3.setVolume(0);
wavesurfer4.setVolume(0);
wavesurfer5.setVolume(0);





// Initialize the Regions plugin
//const wsRegions1 = wavesurfer1.registerPlugin(RegionsPlugin.create()); // for test track 1
const wsRegions2 = wavesurfer2.registerPlugin(RegionsPlugin.create());
const wsRegions3 = wavesurfer3.registerPlugin(RegionsPlugin.create());
const wsRegions4 = wavesurfer4.registerPlugin(RegionsPlugin.create());
const wsRegions5 = wavesurfer5.registerPlugin(RegionsPlugin.create());

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

// Add a segment to the waveform 1


// Add a segment to the waveform 2
document.getElementById('addSegmentBtn2').addEventListener('click', function() {
  const currentTime = wavesurfer1.getCurrentTime();
  const maxDuration = wavesurfer1.getDuration();
  const segmentDuration = 2; // Duration of the segment in seconds
  let endTime = currentTime + segmentDuration;

  // Ensure the end time does not exceed max duration - 0.01 seconds
  if (endTime > maxDuration - 0.01) {
    endTime = maxDuration - 0.01;
  }

  // Calculate remaining time
  const remainingTime = endTime - currentTime;

  // Create a custom content element
  const contentElement = document.createElement('div');
  contentElement.textContent = 'marker';

  // Apply right alignment if remaining time is less than 0.5 seconds
  if (remainingTime < 0.5) {
    contentElement.style.textAlign = 'right';
  }

  // Create region with custom content element
  wsRegions2.addRegion({
    start: currentTime,
    end: endTime,
    data: { label: 'Segment' }, // Additional data for the segment
    content: contentElement,
    color: 'rgba(50, 1, 47, 0.5)',
    contentEditable: true,
  });
});


// Add a segment to the waveform 3
document.getElementById('addSegmentBtn3').addEventListener('click', function() {
  const currentTime = wavesurfer1.getCurrentTime();
  const maxDuration = wavesurfer1.getDuration();
  const segmentDuration = 2; // Duration of the segment in seconds
  let endTime = currentTime + segmentDuration;

  // Ensure the end time does not exceed max duration - 0.01 seconds
  if (endTime > maxDuration - 0.01) {
    endTime = maxDuration - 0.01;
  }

  // Calculate remaining time
  const remainingTime = endTime - currentTime;

  // Create a custom content element
  const contentElement = document.createElement('div');
  contentElement.textContent = 'marker';

  // Apply right alignment if remaining time is less than 0.5 seconds
  if (remainingTime < 0.5) {
    contentElement.style.textAlign = 'right';
  }

  // Create region with custom content element
  wsRegions3.addRegion({
    start: currentTime,
    end: endTime,
    data: { label: 'Segment' }, // Additional data for the segment
    content: contentElement,
    color: 'rgba(226, 223, 208, 0.5)',
    contentEditable: true,
  });
});


// Add a segment to the waveform 4
document.getElementById('addSegmentBtn4').addEventListener('click', function() {
  const currentTime = wavesurfer1.getCurrentTime();
  const maxDuration = wavesurfer1.getDuration();
  const segmentDuration = 2; // Duration of the segment in seconds
  let endTime = currentTime + segmentDuration;

  // Ensure the end time does not exceed max duration - 0.01 seconds
  if (endTime > maxDuration - 0.01) {
    endTime = maxDuration - 0.01;
  }

  // Calculate remaining time
  const remainingTime = endTime - currentTime;

  // Create a custom content element
  const contentElement = document.createElement('div');
  contentElement.textContent = 'marker';

  // Apply right alignment if remaining time is less than 0.5 seconds
  if (remainingTime < 0.5) {
    contentElement.style.textAlign = 'right';
  }

  // Create region with custom content element
  wsRegions4.addRegion({
    start: currentTime,
    end: endTime,
    data: { label: 'Segment' }, // Additional data for the segment
    content: contentElement,
    color: 'rgba(82, 76, 66, 0.5)',
    contentEditable: true,
  });
});


// Add a segment to the waveform 5
document.getElementById('addSegmentBtn5').addEventListener('click', function() {
  const currentTime = wavesurfer1.getCurrentTime();
  const maxDuration = wavesurfer1.getDuration();
  const segmentDuration = 2; // Duration of the segment in seconds
  let endTime = currentTime + segmentDuration;

  // Ensure the end time does not exceed max duration - 0.01 seconds
  if (endTime > maxDuration - 0.01) {
    endTime = maxDuration - 0.01;
  }

  // Calculate remaining time
  const remainingTime = endTime - currentTime;

  // Create a custom content element
  const contentElement = document.createElement('div');
  contentElement.textContent = 'marker';

  // Apply right alignment if remaining time is less than 0.5 seconds
  if (remainingTime < 0.5) {
    contentElement.style.textAlign = 'right';
  }

  // Create region with custom content element
  wsRegions5.addRegion({
    start: currentTime,
    end: endTime,
    data: { label: 'Segment' }, // Additional data for the segment
    content: contentElement,
    color: 'rgba(249, 115, 0, 0.5)',
    contentEditable: true,
  });
});

// Below is the code for saving the region data of tack2-5
// Initialize a storage for region data
const regionDataStores = {
  wsRegions2: {},
  wsRegions3: {},
  wsRegions4: {},
  wsRegions5: {}
};
function saveRegionData(region, store) {
  try {
    store[region.id] = {
      start: region.start,
      end: region.end,
      content: region.content.innerText || region.content // Ensure content is captured correctly
    };
    console.log("Region data saved:", region);
  } catch (error) {
    console.error("Error saving region data:", error);
  }
}
function saveRegionDataToServer() {
  const combinedRegionData = {
    wsRegions2: regionDataStores.wsRegions2,
    wsRegions3: regionDataStores.wsRegions3,
    wsRegions4: regionDataStores.wsRegions4,
    wsRegions5: regionDataStores.wsRegions5
  };

  fetch('/save-region-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(combinedRegionData)
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

const wsRegions = [wsRegions2, wsRegions3, wsRegions4, wsRegions5];
const stores = [regionDataStores.wsRegions2, regionDataStores.wsRegions3, regionDataStores.wsRegions4, regionDataStores.wsRegions5];

wsRegions.forEach((wsRegion, index) => {
  const store = stores[index];

  wsRegion.on('region-created', (region) => {
    console.log(`Region created event triggered for wsRegions${index + 2}`);
    saveRegionData(region, store);
    console.log(`Region created in track ${index + 2}:`, store);
  });

  wsRegion.on('region-updated', (region) => {
    console.log(`Region update event triggered for wsRegions${index + 2}`);
    saveRegionData(region, store);
    console.log(`Region updated in track ${index + 2}:`, store);
  });

  wsRegion.on('region-removed', (region) => {
    console.log(`Region removed event triggered for wsRegions${index + 2}`);
    delete store[region.id];
    console.log(`Region removed in track ${index + 2}:`, store);
  });
});

// remove region
const deleteActiveRegion = () => {
  if (activeRegion) {
    activeRegion.remove();
    activeRegion = null;
  }
};
let activeRegion = null;

wsRegions.forEach((wsRegion, index) => {
  const store = stores[index];

  // Attach region creation, update, and removal listeners
  wsRegion.on('region-created', (region) => {
    console.log(`Region created event triggered for wsRegions${index + 2}`);
    saveRegionData(region, store);
    console.log(`Region created in track ${index + 2}:`, store);
  });

  wsRegion.on('region-updated', (region) => {
    console.log(`Region update event triggered for wsRegions${index + 2}`);
    saveRegionData(region, store);
    console.log(`Region updated in track ${index + 2}:`, store);
  });

  wsRegion.on('region-removed', (region) => {
    console.log(`Region removed event triggered for wsRegions${index + 2}`);
    delete store[region.id];
    console.log(`Region removed in track ${index + 2}:`, store);
  });

  // Set active region on click
  wsRegion.on('region-clicked', (region, e) => {
    e.stopPropagation() 
    activeRegion = region;
  });
});

// Add event listener for the 'Delete' key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && activeRegion) {
    deleteActiveRegion();
  }
});

