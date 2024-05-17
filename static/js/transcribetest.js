let myCodeMirror_small_segment;
let myCodeMirror_prompt_small_segment;
let myCodeMirror_big_segment;
let myCodeMirror_prompt_big_segment;

$(document).ready(function() {
    myCodeMirror_small_segment = CodeMirror(document.getElementById('editor-small-segment'), {
        value: 'Edit the small segments.\nThe transcription will be displayed here once the process is complete.\n...', // Ensure there's an initial newline for a cleaner experience
        mode: "plaintext",
        lineNumbers: true,
        lineWrapping: true
    });
    myCodeMirror_prompt_small_segment = CodeMirror(document.getElementById('editor-prompt-small-segment'), {
        value: "Adopt the role of a researcher in second language acquisition. Your task is to segment the given English text written by an English language learner into clauses (a production unit containing either a subject and a finite verb or a subject and a finite or non-finite verb form). Formatting your response with each clause on a separate line, for the purpose of labeling data to analyze the complexity, accuracy, and fluency (CAF) dimensions of English learners' language production. Only response the segmented text. Don't add, change, delete any words or symbols of the text. Don't add \"-\" or any symbols to the text. Text to be segmented:", 
        mode: "plaintext",
        lineNumbers: true,
        lineWrapping: true,
    });
    myCodeMirror_big_segment = CodeMirror(document.getElementById('editor-big-segment'), {
        value: 'Edit the big segments.\nThe transcription will be displayed here once the process is complete.\n...', // Ensure there's an initial newline for a cleaner experience
        mode: "plaintext",
        lineNumbers: true,
        lineWrapping: true
    });
    myCodeMirror_prompt_big_segment = CodeMirror(document.getElementById('editor-prompt-big-segment'), {
        value: "Adopt the role of a researcher in second language acquisition. Your task is to segment the given English text written by an English language learner into sentences. Formatting your response with each sentence on a separate line, for the purpose of labeling data to analyze the complexity, accuracy, and fluency (CAF) dimensions of English learners' language production. Only response the segmented text. Don't add, change, delete any words or symbols of the text. Don't add \"-\" or any symbols to the text. Text to be segmented:", // Ensure there's an initial newline for a cleaner experience
        mode: "plaintext",
        lineNumbers: true,
        lineWrapping: true
    });

    // Enforce modifications only at spaces or end of lines
    myCodeMirror_small_segment.on('beforeChange', function(cm, change) {
        if (change.origin === "+input" || change.origin === "paste") {
            // Get the position and the line where the change is being made
            var line = cm.getLine(change.from.line);
            var charPos = change.from.ch;

            // Allow Enter only if it's at the end of a line or after a space
            if (change.text[0] === "\n") {
                if (charPos === line.length || line[charPos - 1] === ' ') {
                    return; // Allow the newline
                } else {
                    change.cancel(); // Prevent the newline
                    return;
                }
            }
        }

        // Allow deletions only if they are complete lines
        if (change.origin === "+delete" || change.origin === "cut") {
            if (change.from.line !== change.to.line || // Multiple lines are being completely removed
                (change.from.ch === 0 && change.to.ch === cm.getLine(change.from.line).length)) { // The whole line is being removed
                return; // Allow line deletions
            } else {
                change.cancel(); // Prevent partial line deletions
            }
        }

        // Handle normal typing and enforce no inline edits
        if (change.text[0] !== "\n" && change.from.line === change.to.line) {
            if (change.from.ch !== change.to.ch || (line.length !== 0 && line[change.from.ch - 1] !== ' ' && line[change.to.ch] !== ' ')) {
                change.cancel(); // Prevent editing inside lines not at space boundaries
            }
        }
    });
    myCodeMirror_big_segment.on('beforeChange', function(cm, change) {
        if (change.origin === "+input" || change.origin === "paste") {
            // Get the position and the line where the change is being made
            var line = cm.getLine(change.from.line);
            var charPos = change.from.ch;

            // Allow Enter only if it's at the end of a line or after a space
            if (change.text[0] === "\n") {
                if (charPos === line.length || line[charPos - 1] === ' ') {
                    return; // Allow the newline
                } else {
                    change.cancel(); // Prevent the newline
                    return;
                }
            }
        }

        // Allow deletions only if they are complete lines
        if (change.origin === "+delete" || change.origin === "cut") {
            if (change.from.line !== change.to.line || // Multiple lines are being completely removed
                (change.from.ch === 0 && change.to.ch === cm.getLine(change.from.line).length)) { // The whole line is being removed
                return; // Allow line deletions
            } else {
                change.cancel(); // Prevent partial line deletions
            }
        }

        // Handle normal typing and enforce no inline edits
        if (change.text[0] !== "\n" && change.from.line === change.to.line) {
            if (change.from.ch !== change.to.ch || (line.length !== 0 && line[change.from.ch - 1] !== ' ' && line[change.to.ch] !== ' ')) {
                change.cancel(); // Prevent editing inside lines not at space boundaries
            }
        }
    });

    $('#upload-form').on('submit', function(event) {
        event.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            type: 'POST',
            url: '/upload',
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                myCodeMirror_small_segment.setValue(data);
                myCodeMirror_big_segment.setValue(data);
            },
            error: function(response) {
                console.error('Failed to process the file:', response.responseText);
                alert('Failed to process the file.');
            }
        });
    });

    $('#save-button-small-segment').click(function() {
        var textContent = myCodeMirror_small_segment.getValue();
        $.ajax({
            type: 'POST',
            url: '/save_transcription_small_segment',
            data: JSON.stringify({ text: textContent }),
            contentType: 'application/json;charset=UTF-8',
            success: function() {
                alert('Transcription of small segment saved successfully.');
            },
            error: function() {
                alert('Failed to save the transcription of small segment.');
            }
        });
    });
    $('#save-button-big-segment').click(function() {
        var textContent = myCodeMirror_big_segment.getValue();
        $.ajax({
            type: 'POST',
            url: '/save_transcription_big_segment',
            data: JSON.stringify({ text: textContent }),
            contentType: 'application/json;charset=UTF-8',
            success: function() {
                alert('Transcription of big segment saved successfully');
            },
            error: function() {
                alert('Failed to save the transcription of big segment.');
            }
        });
    });
});

export { myCodeMirror_small_segment, myCodeMirror_prompt_small_segment, myCodeMirror_prompt_big_segment, myCodeMirror_big_segment };

let subtitleFile=null;
// to read list of files of subtitles
document.addEventListener('DOMContentLoaded', function() {
    fetch('/subtitlefilelist')
      .then(response => response.json())
      .then(files => {
        const SubtitlefileSelector = document.getElementById('SubtitlefileSelector');
        files.forEach(file => {
          if (file.endsWith('.subtitles.txt')) {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            SubtitlefileSelector.appendChild(option);
          }
        });
      });
  });

document.getElementById('SubtitlefileSelector').addEventListener('change', function() {
    subtitleFile = this.value;
    console.log('Selected subtitle file:', subtitleFile); // Debugging line to check the selected file
});

document.getElementById('LoadSubtitleFromListBtn').addEventListener('click', function() {
    if (subtitleFile) {
      fetch(`/subtitlefiles/${subtitleFile}`)
        .then(response => response.text())
        .then(data => {
          myCodeMirror_small_segment.setValue(data);
          myCodeMirror_big_segment.setValue(data);
        })
        .catch(error => {
          console.error("Error fetching subtitle file:", error);
          alert("Failed to load subtitle file. Please try again.");
        });
    } else {
      alert("Please select a subtitle file first.");
    }
});


let audioFile = null;

document.addEventListener('DOMContentLoaded', function() {
  const supportedAudioFormats = ['.wav', '.mp3', '.ogg'];

  fetch('/audiofilelist')
    .then(response => response.json())
    .then(files => {
      const AudiofileSelector = document.getElementById('AudiofileSelector');
      files.forEach(file => {
        const fileExtension = file.slice(file.lastIndexOf('.')).toLowerCase();
        if (supportedAudioFormats.includes(fileExtension)) {
          const option = document.createElement('option');
          option.value = file;
          option.textContent = file;
          AudiofileSelector.appendChild(option);
        }
      });
    });
});

document.getElementById('AudiofileSelector').addEventListener('change', function() {
  audioFile = this.value;
  console.log('Selected audio file:', audioFile);
});

document.getElementById('TranscribeBtn').addEventListener('click', function() {
  if (audioFile) {
    $.ajax({
      type: 'POST',
      url: '/transcribe',
      data: JSON.stringify({ filename: audioFile }),
      contentType: 'application/json',
      success: function(data) {
        myCodeMirror_small_segment.setValue(data);
        myCodeMirror_big_segment.setValue(data);
      },
      error: function(response) {
        console.error('Failed to transcribe the file:', response.responseText);
        alert('Failed to transcribe the file.');
      }
    });
  } else {
    alert("Please select an audio file first.");
  }
});