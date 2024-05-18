import sys
import json
from faster_whisper import WhisperModel
from faster_whisper.tokenizer import Tokenizer

def transcribe_audio(mediaSourcePath, model_size, useLang=None):
    model = WhisperModel(model_size, compute_type="int8", device='cpu')
    tokenizer = Tokenizer(tokenizer=model.hf_tokenizer, task="transcribe", language=useLang, multilingual=True)

    number_tokens = [i for i in range(tokenizer.eot) if all(c in "0123456789$@\\*" for c in tokenizer.decode([i]).removeprefix(" "))]

    segments, info = model.transcribe(
        mediaSourcePath,
        suppress_tokens=[-1] + number_tokens,
        beam_size=5,
        word_timestamps=True,
        language=useLang
    )

    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    transcribe_results = []

    for segment in segments:
        transcribe_tmp = {
            "start": segment.start,
            "end": segment.end,
            "subtitle": segment.text,
            "word_timestamps": []
        }
        for word in segment.words:
            transcribe_tmp["word_timestamps"].append({
                "start": word[0],
                "end": word[1],
                "text": word[2]
            })
        transcribe_results.append(transcribe_tmp)
        print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

    # Save the transcription results to a JSON file
    output_file = f"{mediaSourcePath}.transcribe.json"
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(transcribe_results, json_file, indent=2, ensure_ascii=False)

    # Extract and save subtitles to a text file
    subtitles_path = f"{mediaSourcePath}.subtitles.txt"
    with open(subtitles_path, "w", encoding="utf-8") as file:
        for result in transcribe_results:
            file.write(result["subtitle"] + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <mediaSourcePath> <model_size> [useLang]")
        sys.exit(1)

    mediaSourcePath = sys.argv[1]
    model_size = sys.argv[2]
    useLang = sys.argv[3] if len(sys.argv) > 3 else None

    transcribe_audio(mediaSourcePath, model_size, useLang)