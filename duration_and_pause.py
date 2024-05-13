# Description: Flask app to serve text editor, duration adjustment and transcription results
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/node_modules/<path:filename>')
def serve_node_module(filename):
    node_modules_dir = os.path.join(app.root_path, 'node_modules')
    return send_from_directory(node_modules_dir, filename)

@app.route('/')
def index():
    return render_template('duration_and_pause.html')

if __name__ == '__main__':
    app.run(debug=True)