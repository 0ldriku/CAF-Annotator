import sys
import json
import whisper_timestamped as whisper

def convert_to_schema(result):
    segments = []
    for segment in result['segments']:
        word_timestamps = []
        for word in segment['words']:
            word_timestamps.append({
                'start': word['start'],
                'end': word['end'],
                'text': word['text']
            })
        segments.append({
            'start': segment['start'],
            'end': segment['end'],
            'subtitle': segment['text'],
            'word_timestamps': word_timestamps
        })
    return segments

def transcribe_audio(file_name, model_size, language):
    # Load the Whisper model
    model = whisper.load_model(model_size, device="cpu")

    # Perform the transcription
    result = whisper.transcribe(model, file_name, language=language, beam_size=5, best_of=5,
                                temperature=(0.0, 0.2, 0.4, 0.6, 0.8, 1.0), vad="auditok", detect_disfluencies=True)

    # Convert the result to the desired schema
    converted_result = convert_to_schema(result)

    # Save the transcription results to a JSON file
    output_file = f"{file_name}.transcribe.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(converted_result, json_file, indent=2, ensure_ascii=False)

    # Extract and save subtitles to a text file
    subtitles_path = f"{file_name}.subtitles.txt"
    with open(subtitles_path, "w", encoding="utf-8") as file:
        for result in converted_result:
            file.write(result["subtitle"] + "\n")

    print(f'File {file_name} was completed!')

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python script.py <file_name> <model_size> <language>")
        sys.exit(1)

    file_name = sys.argv[1]
    model_size = sys.argv[2]
    language = sys.argv[3]

    transcribe_audio(file_name, model_size, language)