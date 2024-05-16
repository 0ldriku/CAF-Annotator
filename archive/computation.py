from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('computation.html')

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
    wsRegions3 = data.get('wsRegions3', {})
    
    # Calculate total words and audio duration
    total_words = sum(len(region['content'].split()) for region in wsRegions2.values())
    total_audio_duration = max(region['end'] for region in wsRegions2.values())
    
    # Calculate total speech duration excluding pauses
    total_speech_duration = total_audio_duration - sum(region['end'] - region['start'] for region in wsRegions3.values())
    
    # Calculate speed fluency measures
    speed_rate = total_words / total_audio_duration
    articulation_rate = total_words / total_speech_duration
    
    # Calculate breakdown fluency measures
    mid_clause_pauses = sum(1 for region in wsRegions3.values() if region['content'] == 'M')
    final_clause_pauses = sum(1 for region in wsRegions3.values() if region['content'] == 'E')
    
    mid_clause_pause_ratio = mid_clause_pauses / total_words
    final_clause_pause_ratio = final_clause_pauses / total_words
    
    mid_clause_pause_duration = sum(region['end'] - region['start'] for region in wsRegions3.values() if region['content'] == 'M')
    final_clause_pause_duration = sum(region['end'] - region['start'] for region in wsRegions3.values() if region['content'] == 'E')
    
    avg_mid_clause_pause_duration = mid_clause_pause_duration / mid_clause_pauses if mid_clause_pauses > 0 else 0
    avg_final_clause_pause_duration = final_clause_pause_duration / final_clause_pauses if final_clause_pauses > 0 else 0
    
    # Print the results
    print("Speed Fluency:")
    print(f"- Speed rate: {speed_rate:} words per second")
    print(f"- Articulation rate: {articulation_rate:} words per second")
    print()
    print("Breakdown Fluency:")
    print(f"- Mid-clause pause ratio: {mid_clause_pause_ratio:} pauses per word")
    print(f"- Final-clause pause ratio: {final_clause_pause_ratio:} pauses per word")
    print(f"- Mid-clause pause duration: {avg_mid_clause_pause_duration:} seconds on average")
    print(f"- Final-clause pause duration: {avg_final_clause_pause_duration:} seconds on average")
    
    results = {
        'speed_rate': speed_rate,
        'articulation_rate': articulation_rate,
        'mid_clause_pause_ratio': mid_clause_pause_ratio,
        'final_clause_pause_ratio': final_clause_pause_ratio,
        'mid_clause_pause_duration': avg_mid_clause_pause_duration,
        'final_clause_pause_duration': avg_final_clause_pause_duration
    }
    
    return results

if __name__ == '__main__':
    app.run(debug=True)