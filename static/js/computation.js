let regiondataFile = null;

document.addEventListener('DOMContentLoaded', function() {
  fetch('/regiondatafilelist')
    .then(response => response.json())
    .then(files => {
      const RegiondatafileSelector = document.getElementById('RegiondatafileSelector');
      files.forEach(file => {
        if (file.endsWith('.regionData.json')) {
          const option = document.createElement('option');
          option.value = file;
          option.textContent = file;
          RegiondatafileSelector.appendChild(option);
        }
      });
    });
});

document.getElementById('RegiondatafileSelector').addEventListener('change', function() {
  regiondataFile = this.value;
  console.log('Selected region data file:', regiondataFile);
});

document.getElementById('LoadRegiondataFromListBtn').addEventListener('click', function() {
  if (regiondataFile) {
    fetch(`/regiondatafiles/${regiondataFile}`)
      .then(response => response.json())
      .then(data => {
        computeCAF(data);
      })
      .catch(error => {
        console.error("Error fetching region data file:", error);
        alert("Failed to load region data file. Please try again.");
      });
  } else {
    alert("Please select a region data file first.");
  }
});
//

function loadFile() {
    const fileInput = document.getElementById('regiondatajsonfileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            computeCAF(data);
        } catch (e) {
            alert('Invalid JSON file.');
            console.error('Error parsing JSON:', e);
        }
    };
    reader.readAsText(file);
}

function computeCAF(data) {
    fetch('/compute_caf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            console.error('Error:', data.error);
        } else {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `
                <p>Speed Rate: ${data.speed_rate.toFixed(3)}</p>
                <p>Articulation Rate: ${data.articulation_rate.toFixed(3)}</p>
                <p>Mid-Clause Pause Ratio: ${data.mid_clause_pause_ratio.toFixed(3)}</p>
                <p>Final-Clause Pause Ratio: ${data.final_clause_pause_ratio.toFixed(3)}</p>
                <p>Mid-Clause Pause Duration: ${data.mid_clause_pause_duration.toFixed(3)}</p>
                <p>Final-Clause Pause Duration: ${data.final_clause_pause_duration.toFixed(3)}</p>
                <p>Number of small segments: ${data.num_small_segments.toFixed(3)}</p>
                <p>Mean length of small segments: ${data.mean_small_segment_length.toFixed(3)}</p>
                <p>Number of dysfluencies: ${data.dysf_number.toFixed(3)}</p>
            `;
        }
    })
    .catch(error => {
        alert('An error occurred while computing the CAF values.');
        console.error('Error:', error);
    });
}
