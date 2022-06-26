import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from backend import classify, analyze_conflict, get_confusion_chart_data, generate_report, cleanupState
from preprocess_data import clean_up_preprocess_data

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

IP = '192.168.0.102'
PORT = 3001

@app.route('/')
def index():
    return 'Sequence Sense Backend Server Running'

@app.route('/classify', methods=['POST'])
def classifyAPI():
    cleanupState()
    # clean_up_preprocess_data()
    resData = json.loads(request.data)
    labels = resData['labels']
    files = resData['files']
    data = resData['data']
    return jsonify(classify(labels, files, data))

@app.route('/analyzeconflict', methods=['POST'])
def analyzeAPI():
    resData = json.loads(request.data)
    sequence = resData['sequence']
    return jsonify(analyze_conflict(sequence))


@app.route('/analyzeconfusionmatrix', methods=['POST'])
def analyzeConfusionAPI():
    resData = json.loads(request.data)
    i_label = resData['actualLabel']
    j_label = resData['predictedLabel']
    print(i_label, j_label)
    return jsonify(get_confusion_chart_data(i_label, j_label))


@app.route('/generatereport', methods=['POST'])
def generateReportAPI():
    resData = json.loads(request.data)
    confidence = resData['confidence']
    result = generate_report(confidence)
    file = send_file(result['filename'], mimetype='application/zip', as_attachment=True)
    return file

@app.route('/getsamplegesturedata', methods=['GET', 'POST'])
def getSampleGestureDataAPI():
    file = send_file('sample_gesture_data.zip', mimetype='application/zip', as_attachment=True)
    return file


if __name__ == '__main__':
    app.run(host=IP, port=PORT, debug=False)