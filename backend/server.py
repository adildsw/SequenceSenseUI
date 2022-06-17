import json
from flask import Flask, request, jsonify
from flask_cors import CORS

import time

from backend import classify, analyze_conflict, get_confusion_chart_data

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

IP = '192.168.192.39'
PORT = 3001

@app.route('/')
def index():
    return 'Sequence Sense Backend Server Running'

@app.route('/classify', methods=['POST'])
def classifyAPI():
    resData = json.loads(request.data)
    labels = resData['labels']
    files = resData['files']
    data = resData['data']
    # time.sleep(5) # Simulating processing delay
    return jsonify(classify(labels, files, data))

@app.route('/analyzeconflict', methods=['POST'])
def analyzeAPI():
    resData = json.loads(request.data)
    sequence = resData['sequence']
    return jsonify(analyze_conflict(sequence))

@app.route('/analyzeconfusionmatrix', methods=['POST'])
def analyzeConfusionAPI():
    resData = json.loads(request.data)
    actual_label = resData['actualLabel']
    predicted_label = resData['predictedLabel']
    # time.sleep(2) # Simulating processing delay
    return jsonify(get_confusion_chart_data(actual_label, predicted_label))

if __name__ == '__main__':
    app.run(host=IP, port=PORT, debug=True)