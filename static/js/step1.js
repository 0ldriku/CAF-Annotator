let myCodeMirror_small_segment;
let myCodeMirror_big_segment;

$(document).ready(function() {
    myCodeMirror_small_segment = CodeMirror(document.getElementById('editor-small-segment'), {
        value: 'Edit the small segments.\nThe transcription will be displayed here once the process is complete.\n...', // Ensure there's an initial newline for a cleaner experience
        mode: "plaintext",
        lineNumbers: true,
        lineWrapping: true
    });

    myCodeMirror_big_segment = CodeMirror(document.getElementById('editor-big-segment'), {
        value: 'Edit the big segments.\nThe transcription will be displayed here once the process is complete.\n...', // Ensure there's an initial newline for a cleaner experience
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
            success: function(response) {
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
            success: function(response) {
                alert('Transcription of big segment saved successfully.');
            },
            error: function() {
                alert('Failed to save the transcription of big segment.');
            }
        });
    });
});

export { myCodeMirror_small_segment, myCodeMirror_big_segment };
