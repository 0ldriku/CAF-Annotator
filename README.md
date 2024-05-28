# Maruko
Maruko is an annotation tool designed to help researchers and students in the field of Second Language Acquisition (SLA) efficiently transcribe, annotate, computate CAF (Complexity, Accuracy, and Fluency) measures for audio files.

## Motivation
Currently, when extracting CAF measures from audio files, researchers often use a complex workflow involving multiple tools. They may use Praat for annotation, a separate transcription tool for transcribing the audio, and tools like Coh-Metrix to calculate transcription-based measures. This fragmented workflow can be time-consuming and cumbersome.
Maruko aims to simplify and streamline this process by integrating the entire workflow into a single web application. This tool enables researchers to perform transcription, annotation, and computation tasks within a unified interface.

## Features

- User-friendly interface for annotating audio files
- Automatic transcription, segmentation, annotation and pause detection.
- Cross-platform compatibility

## Requirements
- Python 3.9 or greater

## Getting started
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```


2. Navigate to your project directory:

   ```bash
   cd /path/to/your/project
   ```

3. Create a virtual environment:

   ```bash
   python -m venv .venv
   ```

4. Activate the virtual environment:

   - For Linux/Mac:

     ```bash
     source .venv/bin/activate
     ```

   - For Windows:

     ```bash
     .venv\Scripts\activate
     ```

4. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Run the application:
   ```bash
   python app.py
   ```

5. Access the application through your web browser at `http://localhost:5000` (or the appropriate URL).

### Compatibility
Best work with Chrome and Edge. Safari is not recommended.

### Workflow Instructions

1. **Prepare Audio Files and Transcriptions:**
   - Place your audio files in `/files`. Then click the transcribe button to transcribe the audio files. The transcriptions will be stored in `/results/transcriptions`.
   - - Alternatively, use the [Google Colab notebook](https://colab.research.google.com/github/0ldriku/Maruko/blob/main/Maruko_Whisper.ipynb) to transcribe the audio files and store the generated files in `/results/transcriptions`. Check the [The CPU Usage in the Transcription Step](#the-cpu-usage-in-the-transcription-step) section for more information.



2. **Segment Text:**
   - Segment the text into the units you want to analyze.
   - You can't change the words in this step. You can only add or remove lines.
   - Auto segmentation can be done with NLP tools like Stanza or SpaCy, but they may not be as accurate for spoken language as they are for written text. Therefore, I decided to let the user manually adjust the segments for now. If you want, you can use those tools to segment and load the data in the next steps.


3. **Adjust Segment Boundaries:**
   - Load the transcribed audio.
   - Load the segmentation. After selecting the audio file, the system will automatically detect the segmentation files. Simply click the "Load Small/Big Segments" button to proceed.
   - Since the faster-whisper tool is not perfect, you may need to add or delete regions, or adjust the boundaries of the segments as necessary.


4. **Edit Text:**
   - Edit the text in track 2 if necessary. The text in track 3 is not used to compute the CAF measures, so it does not require editing.

5. **Pause Detection:**
   - Press the pause detection button to automatically detect pause durations.
   - Verify the accuracy of detected pauses and adjust manually if necessary.

7. **Annotate Accuracy and Dysfluency:**
   - Annotate the accuracy in track 5 and dysfluency in track 6.

8. **Save Annotations:**
   - Save all annotations upon completion.

9. **Compute CAF Measures:**
   - Load the annotations and compute the CAF measures.




## About the Tracks in the Annotation Step
![Annotation Screenshot](https://github.com/0ldriku/Maruko/blob/main/static/img/AnnotationScreenshot.png?raw=true)
- **Track 1: Waveform**
  - Displays the waveform of the audio.

- **Track 2: Small Segments Annotation**
  - Used for annotating small segments of the audio, such as clauses or any other user-defined segments.

- **Track 3: Large Segments Annotation**
  - Used for annotating large segments of the audio, which can include sentences, AS-units, or any other user-defined segments.

- **Track 4: Pause Duration Annotation**
  - Maruko supports automatic pause detection. Users can click the "Auto Detect Pause" button to automatically detect pause durations. Pauses within small segments are labeled as "M," and pauses between large segments are labeled as "E." Users can also manually annotate pause durations by clicking the "+ PAUSE" button.

- **Track 5: Accuracy Annotation**
  - This track is designated for annotating accuracy in the audio. Currently can only be performed manually by the user.

- **Track 6: Dysfluency Annotation**
  - This track is designated for annotating dysfluency. Currently can only be performed manually by the user.


## Data Structure

- `/files`  
  Place your audio files here.

- `/results/transcriptions`  
  Contains transcriptions of the audio files.  
  - `[filename].[extension].transcribe.json`: File with word-level timestamps.  
  - `[filename].[extension].subtitles.txt`: Plain text file containing only text without timestamps.

- `/results/textfiles`  
  Contains segmented files.  
  - `[filename].[extension].bigsegment.txt`: Contains big segments of text.  
  - `[filename].[extension].smallsegment.txt`: Contains small segments of text.

- `/results/matchedjson`  
  Contains JSON files with word-level timestamps of segmented files.  
  - `[filename].[extension].bigsegment.matched.json`: Big segment file with timestamps.  
  - `[filename].[extension].smallsegment.matched.json`: Small segment file with timestamps.  

- `/results/adjustedRegions`  
  - `[filename].[extension].regionData.json`: Contains all annotations added in Step 2 (Annotate). Computations in Step 3 are based on this file.



## Supported CAF Measures

For academic purposes, it is important to review the computation methods used. Please check the `compute_caf_values()` function defined in `app.py` for detailed implementation.


- Syntactic complexity
  - Mean length of clause: The mean number of words produeced per segment.


- Speed fluency
  - Speed rate: The mean number of words produced per second, divided by total audio duration.
  - Articulation rate: The mean number of words per second, divided by total phonation time (ie., total speech duration excludingpauses).

- Breakdown fluency (if the user segment the small segment as clauses)
  - Mid-clause pause ratio: The total number of unfilled pauses within clauses was divided by the total number of words.
  - Final-clause pause ratio: The total number of unfilled pauses between clauses was divided by the total number of words.
  - Mid-clause pause duration: Mean duration of pauses within clauses, expressed in seconds.
  - Final-clause pause duration: Mean duration of pauses between clauses, expressed in seconds.

### CAF Measures on working
I plan to implement the following measures on a separate page. Since initializing the NLP tools can be time-consuming, this will be set up on a different page to optimize performance.

***Important Note:***
The labeling of content words and the total word count heavily depend on the configuration of the NLP tools. I strongly recommend verifying the labeling results before proceeding with the analysis.

- Syntactic complexity
    - Mean length of noun phrases: The mean number of words per noun phrases. 
- Lexical complexity
    - Measure of textual lexical diversity (MTLD): The mean length of sequential word strings in a text that maintains a giventype-token ratio value. 
    - CELEX log frequency: The averaged logarithmic frequency of content words produced in a text based on the CELEX corpus.
    - Lexical density: The proportion of content words to the total words produced. 

- Accuracy and Dysfluency
    - I have no idea how to auto detect the accuracy and dyfluency. The user can only manually annotate the accuracy and dysfluency. But I will make the function to computate accuracy and dysfluency soon.



## The CPU usage in the transcription step
Many researchers in this field may not have a GPU or CUDA installed, so the default setting for the faster-whisper tool is to use the CPU mode for audio transcription. On an Apple M1 Max CPU, it takes about 1 minute to transcribe a 1-minute audio file. However, if your CPU is not very powerful, transcribing audio can be time-consuming. For those without a powerful computer or who prefer not to strain their system, I recommend using Google Colab, which provides free access to T4 GPUs. I have created a Google Colab notebook that implements this feature. You can access the notebook here: [Click here](https://colab.research.google.com/github/0ldriku/Maruko/blob/main/Maruko_Whisper.ipynb).




## Experimental Features
 
### Gemini API Integration
The AI segment feature is currently an experimental feature. The effectiveness of this function heavily depends on the prompt provided. I have included an example prompt that you can use to segment text into clauses or sentences. You should modify it according to your needs. To use this feature, you need access to the Gemini API. Google offers free usage of Gemini; for details, please visit [this link](https://ai.google.dev/pricing). To integrate the API, enter your API key in the `/static/js/geminiapi.js` file.

## Tools and Libraries

### Transcription
- **Faster-Whisper**: [GitHub Repository](https://github.com/SYSTRAN/faster-whisper)

### Annotation
- **Wavesurfer.js**: [GitHub Repository](https://github.com/katspaugh/wavesurfer.js)

### Google Colab Notebook
- **N46Whisper**: [GitHub Repository](https://github.com/Ayanaminn/N46Whisper)

## Roadmap

- [x] Refine the file management system.
- [ ] Implement the feature to export data into a CSV file.
- [ ] Enable conversion of annotated JSON files into Praat TextGrid files.
- [ ] Add support for languages other than English.
- [ ] Integrate speaker diarization support.
- [ ] Support to computate lexical complexity.


## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.
## License

This project is licensed under the [MIT License](https://github.com/0ldriku/Maruko/blob/main/LICENSE.md).

## Contact

For any questions or inquiries, please fell free to post here or [contact me](mailto:liquid.riku@gmail.com).
