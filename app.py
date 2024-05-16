from flask import Flask, request, render_template, send_from_directory, session, json, jsonify
import os
import subprocess
from werkzeug.utils import secure_filename
import shutil
import glob

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'shimomaruko'  # Use a real secret key in production
APP_ROOT = os.path.dirname(os.path.abspath(__file__))  # Get the directory of the app.py file
UPLOAD_FOLDER = os.path.join(APP_ROOT, 'files')  # Use the 'files' directory for uploads
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Set the folder in Flask's config
app.config['MAX_CONTENT_LENGTH'] = 128 * 1024 * 1024  # Limit the maximum upload size
app.config['TEXT_FOLDER'] = os.path.join(app.root_path, 'results', 'textfiles')
app.config['JSON_FOLDER'] = os.path.join(app.root_path, 'results', 'matchedjson')
app.config['TRANS_FOLDER'] = os.path.join(app.root_path, 'results', 'transcriptions')
app.config['ADJUSTEDREGIONS_FOLDER'] = os.path.join(app.root_path, 'results', 'adjustedRegions')

# Ensure directories exist
os.makedirs(app.config['TEXT_FOLDER'], exist_ok=True)
os.makedirs(app.config['JSON_FOLDER'], exist_ok=True)
os.makedirs(app.config['TRANS_FOLDER'], exist_ok=True)
os.makedirs(app.config['ADJUSTEDREGIONS_FOLDER'], exist_ok=True)

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/node_modules/<path:filename>')
def serve_node_module(filename):
    node_modules_dir = os.path.join(app.root_path, 'node_modules')
    return send_from_directory(node_modules_dir, filename)

@app.route('/')
def index():
    return render_template('app.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audiofile' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['audiofile']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file.filename is None:
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Store the filename in the session
    session['uploaded_filename'] = filename

    # Call to your transcription function
    run_transcription(filepath)  # Ensure this is correctly creating the output file

    # Use the original file extension in the result filename
    base_filename = filename.rsplit('.', 1)[0]
    file_extension = filename.rsplit('.', 1)[1] if len(filename.rsplit('.', 1)) > 1 else ''
    result_filename = f"{base_filename}.{file_extension}.subtitles.txt"
    result_path = os.path.join(app.root_path, 'results', 'transcriptions', result_filename)

    # Debugging: Check if the file exists
    if not os.path.exists(result_path):
        return jsonify({'error': 'Transcription file not found', 'path': result_path}), 500

    # Read the transcription result
    try:
        with open(result_path, 'r') as f:
            transcription = f.read()
        return transcription
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def run_transcription(audio_path):
    script_path = os.path.join(app.root_path, 'pyfiles', 'fasterwhisper.py')
    command = ['python', script_path, audio_path, 'large-v2', 'en']
    result = subprocess.run(command, capture_output=True, text=True)
    
    if result.returncode == 0:
        # Assuming the script saves files with a predictable pattern in the same directory as the audio file
        base_filename = os.path.splitext(os.path.basename(audio_path))[0]
        src_dir = os.path.dirname(audio_path)
        dest_dir = os.path.join(app.root_path, 'results', 'transcriptions')
        
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        
        # Find all related output files
        pattern = os.path.join(src_dir, f"{base_filename}.*.json")
        pattern_txt = os.path.join(src_dir, f"{base_filename}.*.txt")
        
        # Move all JSON and TXT files
        for file_path in glob.glob(pattern) + glob.glob(pattern_txt):
            shutil.move(file_path, dest_dir)
        
        return "Transcription files moved successfully."
    else:
        return f"Error: {result.stderr}"

@app.route('/save_transcription_small_segment', methods=['POST'])
def save_transcription_small_segment():
    data = request.get_json()
    text = data['text']
    
    # Retrieve the base filename from session or use a default filename
    base_filename = session.get('uploaded_filename', 'default_filename')
    
    # Extract the base filename and extension
    base_filename, file_extension = os.path.splitext(base_filename)
    
    # Construct the result filename with the .txt extension
    result_filename = f"{base_filename}{file_extension}.smallsegment.txt"
    
    result_path = os.path.join(app.config['TEXT_FOLDER'], result_filename)
    
    try:
        # Create the directory if it doesn't exist
        os.makedirs(app.config['TEXT_FOLDER'], exist_ok=True)
        
        with open(result_path, 'w') as file:
            file.write(text)
        
        print(f"Transcription saved successfully: {result_path}")  # Logging statement
        
        # Invoke the run_sequence_matcher function
        run_sequence_matcher_small_segment() 
        
        return jsonify({"message": "File saved successfully and sequence matching processed"})
    
    except IOError as e:
        print(f"Failed to save transcription: {str(e)}")  # Logging statement
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500

def run_sequence_matcher_small_segment(export_path=None):
    base_filename = session.get('uploaded_filename', 'default_filename')
    base_filename, file_extension = os.path.splitext(base_filename)

    # Paths for the text file and transcription file
    text_file_path = os.path.join(app.config['TEXT_FOLDER'], f"{base_filename}{file_extension}.smallsegment.txt")
    trans_file_path = os.path.join(app.config['TRANS_FOLDER'], f"{base_filename}{file_extension}.transcribe.json")

    # Check if the transcription file exists
    if not os.path.exists(trans_file_path):
        print(f"Transcription file not found: {trans_file_path}")
        raise FileNotFoundError(f"Transcription file not found: {trans_file_path}")

    script_path = os.path.join(app.root_path, 'pyfiles', 'sequencematcher.py')
    command = ['python', script_path, text_file_path, trans_file_path]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Sequence matcher failed: {result.stderr}")

    # Define source and destination for moving the generated file
    source_file = os.path.join(app.config['TEXT_FOLDER'], f"{base_filename}{file_extension}.smallsegment.matched.json")
    destination_folder = app.config['JSON_FOLDER']
    destination_file = os.path.join(destination_folder, f"{base_filename}{file_extension}.smallsegment.matched.json")

    # Move the file from TEXT_FOLDER to JSON_FOLDER
    shutil.move(source_file, destination_file)
    print(f"File moved to {destination_file}")

@app.route('/save_transcription_big_segment', methods=['POST'])
def save_transcription_big_segment():
    data = request.get_json()
    text = data['text']
    
    # Retrieve the base filename from session or use a default filename
    base_filename = session.get('uploaded_filename', 'default_filename')
    
    # Extract the base filename and extension
    base_filename, file_extension = os.path.splitext(base_filename)
    
    # Construct the result filename with the .txt extension
    result_filename = f"{base_filename}{file_extension}.bigsegment.txt"
    
    result_path = os.path.join(app.config['TEXT_FOLDER'], result_filename)
    
    try:
        # Create the directory if it doesn't exist
        os.makedirs(app.config['TEXT_FOLDER'], exist_ok=True)
        
        with open(result_path, 'w') as file:
            file.write(text)
        
        print(f"Transcription saved successfully: {result_path}")  # Logging statement
        
        # Invoke the run_sequence_matcher function
        run_sequence_matcher_big_segment() 
        
        return jsonify({"message": "File saved successfully and sequence matching processed"})
    
    except IOError as e:
        print(f"Failed to save transcription: {str(e)}")  # Logging statement
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500

def run_sequence_matcher_big_segment(export_path=None):
    base_filename = session.get('uploaded_filename', 'default_filename')
    base_filename, file_extension = os.path.splitext(base_filename)

    # Paths for the text file and transcription file
    text_file_path = os.path.join(app.config['TEXT_FOLDER'], f"{base_filename}{file_extension}.bigsegment.txt")
    trans_file_path = os.path.join(app.config['TRANS_FOLDER'], f"{base_filename}{file_extension}.transcribe.json")

    # Check if the transcription file exists
    if not os.path.exists(trans_file_path):
        print(f"Transcription file not found: {trans_file_path}")
        raise FileNotFoundError(f"Transcription file not found: {trans_file_path}")

    script_path = os.path.join(app.root_path, 'pyfiles', 'sequencematcher.py')
    command = ['python', script_path, text_file_path, trans_file_path]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"Sequence matcher failed: {result.stderr}")

    # Define source and destination for moving the generated file
    source_file = os.path.join(app.config['TEXT_FOLDER'], f"{base_filename}{file_extension}.bigsegment.matched.json")
    destination_folder = app.config['JSON_FOLDER']
    destination_file = os.path.join(destination_folder, f"{base_filename}{file_extension}.bigsegment.matched.json")

    # Move the file from TEXT_FOLDER to JSON_FOLDER
    shutil.move(source_file, destination_file)
    print(f"File moved to {destination_file}")

@app.route('/save-region-data', methods=['POST'])
def save_region_data():
    base_filename = session.get('uploaded_filename', 'default_filename')
    base_filename, file_extension = os.path.splitext(base_filename)
    data = request.get_json()
    file_path = os.path.join(app.config['ADJUSTEDREGIONS_FOLDER'], f"{base_filename}{file_extension}.regionData.json")
    
    try:
        # Check if the file already exists
        if os.path.exists(file_path):
            # If the file exists, delete it
            os.remove(file_path)
        
        # Write the new data to the file
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({"message": "Region data saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/compute_caf', methods=['POST'])
def compute_caf():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data received")
        
        # Debug: Log the type and content of the data received
        print(f"Received data type: {type(data)}")
        print(f"Received data: {data}")
        
        results = compute_caf_values(data)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)})

def compute_caf_values(data):
    wsRegions2 = data.get('wsRegions2', {})
    wsRegions4 = data.get('wsRegions4', {})
    
    # Calculate total words and audio duration
    total_words = sum(len(region['content'].split()) for region in wsRegions2.values())
    total_audio_duration = max(region['end'] for region in wsRegions2.values())
    
    # Calculate total speech duration excluding pauses
    total_speech_duration = total_audio_duration - sum(region['end'] - region['start'] for region in wsRegions4.values())
    
    # Calculate speed fluency measures
    speed_rate = total_words / total_audio_duration
    articulation_rate = total_words / total_speech_duration
    
    # Calculate breakdown fluency measures
    mid_clause_pauses = sum(1 for region in wsRegions4.values() if region['content'] == 'M')
    final_clause_pauses = sum(1 for region in wsRegions4.values() if region['content'] == 'E')
    
    mid_clause_pause_ratio = mid_clause_pauses / total_words
    final_clause_pause_ratio = final_clause_pauses / total_words
    
    mid_clause_pause_duration = sum(region['end'] - region['start'] for region in wsRegions4.values() if region['content'] == 'M')
    final_clause_pause_duration = sum(region['end'] - region['start'] for region in wsRegions4.values() if region['content'] == 'E')
    
    avg_mid_clause_pause_duration = mid_clause_pause_duration / mid_clause_pauses if mid_clause_pauses > 0 else 0
    avg_final_clause_pause_duration = final_clause_pause_duration / final_clause_pauses if final_clause_pauses > 0 else 0
    
    # Calculate the Complexity measures
    num_small_segments = sum(1 for region in wsRegions2.values() if 'end' in region)
    mean_small_segment_length = total_words / num_small_segments if num_small_segments > 0 else 0

    # Print the results


    print("Speed Fluency:")
    print(f"- Speed rate: {speed_rate} words per second")
    print(f"- Articulation rate: {articulation_rate} words per second")
    print()
    print("Breakdown Fluency:")
    print(f"- Mid-clause pause ratio: {mid_clause_pause_ratio} pauses per word")
    print(f"- Final-clause pause ratio: {final_clause_pause_ratio} pauses per word")
    print(f"- Mid-clause pause duration: {avg_mid_clause_pause_duration} seconds on average")
    print(f"- Final-clause pause duration: {avg_final_clause_pause_duration} seconds on average")
    print()
    print("Complexity:")
    print(f"- Number of small segments: {num_small_segments}")
    print(f"- Mean length of small segment length: {mean_small_segment_length}")

    results = {
        'speed_rate': speed_rate,
        'articulation_rate': articulation_rate,
        'mid_clause_pause_ratio': mid_clause_pause_ratio,
        'final_clause_pause_ratio': final_clause_pause_ratio,
        'mid_clause_pause_duration': avg_mid_clause_pause_duration,
        'final_clause_pause_duration': avg_final_clause_pause_duration,
        'num_small_segments': num_small_segments,
        'mean_small_segment_length': mean_small_segment_length
    }
    
    return results

if __name__ == '__main__':
    app.run(debug=True)
