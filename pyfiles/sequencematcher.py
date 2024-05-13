import json
import sys

# Check if the required command-line arguments are provided
if len(sys.argv) != 3:
    print("Usage: python script.py <text_file> <json_file>")
    sys.exit(1)

text_file = sys.argv[1]
json_file = sys.argv[2]

# Read the JSON file
with open(json_file) as json_data:
    data = json.load(json_data)

# Read the text file
with open(text_file, 'r') as txt_data:
    text = txt_data.read()

# Split the text into segments based on the edited segmentation
segments = text.split('\n')

# Initialize variables
word_timestamps = []

# Flatten the word_timestamps from the JSON data
for item in data:
    word_timestamps.extend(item['word_timestamps'])

# Initialize a list to store the segment dictionaries
segment_data = []

# Iterate over each segment
for segment in segments:
    # Split the segment into words
    words = segment.strip().split()

    segment_timestamps = []

    start_time = None
    end_time = None

    # Iterate over each word in the segment
    for word in words:
        # Find the corresponding timestamp for the word
        timestamp = next((ts for ts in word_timestamps if ts['text'].strip() == word), None)
        if timestamp:
            if start_time is None:
                start_time = timestamp['start']
            end_time = timestamp['end']
            segment_timestamps.append(timestamp)
            # Remove the used timestamp to avoid confusion
            word_timestamps.remove(timestamp)

    # Create a dictionary for the segment
    segment_dict = {
        "start": start_time,
        "end": end_time,
        "subtitle": segment,
        "word_timestamps": segment_timestamps
    }

    # Append the segment dictionary to the list
    segment_data.append(segment_dict)

# Write the segment data to a JSON file
# Change the output file's name to include text_file with a suffix
output_file = text_file.replace(".txt", "") + ".matched.json"

with open(output_file, 'w') as output_json:
    json.dump(segment_data, output_json, indent=2)

print(f"Output JSON file generated: {output_file}")