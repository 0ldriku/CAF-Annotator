import WaveSurfer from '/node_modules/wavesurfer.js/dist/wavesurfer.js';
import RegionsPlugin from '/node_modules/wavesurfer.js/dist/plugins/regions.esm.js';



const wavesurfer1 = WaveSurfer.create({
  container: "#waveform1",
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
  hideScrollbar: true,
  height: "auto",
});

const wavesurfer2 = WaveSurfer.create({
  container: "#waveform2",
  waveColor: 'rgba(200, 0, 200, 0)',
  progressColor: 'rgba(100, 0, 100)',
  height: "auto",
});




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



// Attach event listener to wavesurfer2 for scroll event
wavesurfer2.on('ready', function() {
  wavesurfer2.on('scroll', (visibleStartTime, visibleEndTime) => {
    //console.log('Scroll', visibleStartTime + 's', visibleEndTime + 's');
    wavesurfer1.setScrollTime(visibleStartTime);
  });
});

// Sync the cursor with wavesurfer
wavesurfer1.on('click', () => {
  const currentTime = wavesurfer1.getCurrentTime(); // Get current time of wavesurfer2
  wavesurfer2.setTime(currentTime); // Set this time on wavesurfer
});

// Click event on wavesurfer2 to sync its time to wavesurfer
wavesurfer2.on('click', () => {
  const currentTime = wavesurfer2.getCurrentTime(); // Get current time of wavesurfer2
  wavesurfer1.setTime(currentTime); // Set this time on wavesurfer
});



// Update the zoom level on slider change
wavesurfer1.once('decode', () => {
  const slider = document.querySelector('input[type="range"]');
  slider.addEventListener('input', (e) => {
    const minPxPerSec = e.target.valueAsNumber;
    wavesurfer2.zoom(minPxPerSec);
    wavesurfer1.zoom(minPxPerSec);
    
  });
  

  const playPauseBtn = document.getElementById('play-pause-btn');
  playPauseBtn.addEventListener('click', () => {
    wavesurfer1.playPause();
    wavesurfer2.playPause();
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
// Initialize a storage for region data
const regionDataStore2 = {};

// Function to save region data
function saveRegionData(region) {
  try {
    regionDataStore2[region.id] = {
      start: region.start,
      end: region.end,
      content: region.content
    };
    console.log("Region data saved:", region);
  } catch (error) {
    console.error("Error saving region data:", error);
  }
}

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