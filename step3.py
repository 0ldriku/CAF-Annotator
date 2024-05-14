# Description: Flask app to serve text editor, duration adjustment and transcription results
from flask import Flask, render_template, send_from_directory, request, jsonify, json
import os


app = Flask(__name__)

app.config['ADJUSTEDREGIONS_FOLDER'] = os.path.join(app.root_path, 'results', 'adjustedRegions')
os.makedirs(app.config['ADJUSTEDREGIONS_FOLDER'], exist_ok=True)

@app.route('/node_modules/<path:filename>')
def serve_node_module(filename):
    node_modules_dir = os.path.join(app.root_path, 'node_modules')
    return send_from_directory(node_modules_dir, filename)

@app.route('/')
def index():
    return render_template('step3.html')

@app.route('/save-region-data', methods=['POST'])
def save_region_data():
    data = request.get_json()
    file_path = os.path.join(app.config['ADJUSTEDREGIONS_FOLDER'], 'regionData.json')
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return jsonify({"message": "Region data saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
