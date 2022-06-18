import json
from flask import Flask, request, jsonify
from flask_cors import CORS

import numpy as np

import time

from backend import classify, analyze_conflict, get_confusion_chart_data

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

IP = '192.168.0.202'
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
    conv(data[files[labels[0]][0]])
    # time.sleep(5) # Simulating processing delay
    return jsonify(classify(labels, files, data))

def conv(data):
    # print(data)
    lines = data.split('\n')
    print(len(lines))
    d = []
    for line in lines:
        dtemp = line.split(',')
        print(dtemp)
        if len(dtemp) > 1:
            for idx, val in enumerate(dtemp):
                dtemp[idx] = float(val)
            d.append(dtemp)
    print(len(d[0]))
    d_np = np.array(d)
    print(d_np.shape)

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