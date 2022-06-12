import json
from flask import Flask, request, jsonify
from flask_cors import CORS

from backend import classify, analyze_conflict

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})

IP = '0.0.0.0'
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
    return jsonify(classify(labels, files, data))

@app.route('/analyzeconflict', methods=['POST'])
def analyzeAPI():
    resData = json.loads(request.data)
    sequence = resData['sequence']
    return jsonify(analyze_conflict(sequence))

if __name__ == '__main__':
    app.run(host=IP, port=PORT, debug=True)