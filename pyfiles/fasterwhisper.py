import sys, glob, json, re
import os
os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"

print("########## Start of character arrival ##########")

try:
#    from torch import cuda // if you want to use GPU
    from faster_whisper import WhisperModel
except ImportError:
    sys.stderr.write("The 'faster_whisper' module was not found.\n")
    sys.exit(1)
    
mediaSourcePath = sys.argv[1]
mediaFilePath = sys.argv[1]
model_size = sys.argv[2]
useLang = sys.argv[3] if len(sys.argv) > 3 else None
transcribe_results = []

# float16 or int8
# For GPU,
# model = WhisperModel(model_size, device="cuda", compute_type="float16")
# or run on GPU with INT8
# model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
model = WhisperModel(
    model_size, compute_type="int8",
    device= 'cpu'
)
segments, info = model.transcribe(
    mediaFilePath, beam_size=5, word_timestamps=True,
    language=useLang
)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    transcribe_tmp = { "start": segment.start, "end": segment.end, "subtitle": segment.text, "word_timestamps": [] }
    for word in segment.words:
        transcribe_tmp["word_timestamps"].append({ "start": word[0], "end": word[1], "text": word[2] })
    transcribe_results.append( transcribe_tmp )
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))

with open( f"{mediaSourcePath}.transcribe.json", "w", encoding="utf-8" ) as json_file:
    json.dump( transcribe_results, json_file, indent=2, ensure_ascii=False )

# Extract and save subtitles to a text file
subtitles_path = f"{mediaSourcePath}.subtitles.txt"
with open(subtitles_path, "w", encoding="utf-8") as file:
    for result in transcribe_results:
        file.write(result["subtitle"] + "\n")