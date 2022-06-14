import numpy as np
from sklearn.metrics import confusion_matrix

def get_confusion_matrix(n : int):
    # Dummy code returns random confusion matrix
    confusion_matrix = np.random.randint(5, size=(n, n)).tolist()

    # Calculating accuracy
    correct = 0
    for i in range(n):
        correct += confusion_matrix[i][i]
    total = 0
    for i in range(n):
        total += sum(confusion_matrix[i])
    accuracy = round(correct/total * 10000)/10000

    return accuracy, confusion_matrix

def get_chart_data():
    # Dummy code returns static chart data for given gesture label
    timestamp = np.ndarray.tolist((np.load('dummy_data/raw.npy')[:, 0] - np.load('dummy_data/raw.npy')[0, 0]).astype(int))
    raw_x = np.ndarray.tolist((np.load('dummy_data/raw.npy')[:, [1]]).flatten())
    raw_y = np.ndarray.tolist((np.load('dummy_data/raw.npy')[:, [2]]).flatten())
    raw_z = np.ndarray.tolist((np.load('dummy_data/raw.npy')[:, [3]]).flatten())
    postprocess_x = np.ndarray.tolist((np.load('dummy_data/postprocess.npy')[:, [1]]).flatten())
    postprocess_y = np.ndarray.tolist((np.load('dummy_data/postprocess.npy')[:, [2]]).flatten())
    postprocess_z = np.ndarray.tolist((np.load('dummy_data/postprocess.npy')[:, [3]]).flatten())
    velocity_x = np.ndarray.tolist((np.load('dummy_data/velocity.npy')[:, [0]]).flatten())
    velocity_y = np.ndarray.tolist((np.load('dummy_data/velocity.npy')[:, [1]]).flatten())
    velocity_z = np.ndarray.tolist((np.load('dummy_data/velocity.npy')[:, [2]]).flatten())
    distance_x = np.ndarray.tolist((np.load('dummy_data/distance.npy')[:, [0]]).flatten())
    distance_y = np.ndarray.tolist((np.load('dummy_data/distance.npy')[:, [1]]).flatten())
    distance_z = np.ndarray.tolist((np.load('dummy_data/distance.npy')[:, [2]]).flatten())
    orientation_roll = np.ndarray.tolist((np.load('dummy_data/orientation.npy')[:, [0]]).flatten())
    orientation_pitch = np.ndarray.tolist((np.load('dummy_data/orientation.npy')[:, [1]]).flatten())
    orientation_yaw = np.ndarray.tolist((np.load('dummy_data/orientation.npy')[:, [2]]).flatten())

    data = {
        'timestamp': timestamp,
        'raw': {
            'x': raw_x,
            'y': raw_y,
            'z': raw_z
        },
        'postprocess': {
            'x': postprocess_x,
            'y': postprocess_y,
            'z': postprocess_z
        },
        'velocity': {
            'x': velocity_x,
            'y': velocity_y,
            'z': velocity_z
        },
        'distance': {
            'x': distance_x,
            'y': distance_y,
            'z': distance_z
        },
        'orientation': {
            'roll': orientation_roll,
            'pitch': orientation_pitch,
            'yaw': orientation_yaw
        }
    }

    return data

def get_concat_data():
    return get_chart_data()

def get_single_data():
    data = get_chart_data()
    data['sample'] = [i for i in range(len(data['distance']['x']))]
    del data['timestamp']
    del data['raw']
    del data['postprocess']
    del data['velocity']
    return data

def get_confusion_matrix_data():
    data = get_single_data()
    return {
        'actual': data,
        'predicted': data
    }

def get_overlap_data():
    return get_single_data()

def get_conflict_analysis_data():
    # Dummy code returns static conflict analysis data
    return {
        'confidence': np.ndarray.tolist((np.load('dummy_data/confidence.npy')).flatten()),
        'regular': np.ndarray.tolist((np.load('dummy_data/regular.npy')).flatten()),
        'gesture': np.ndarray.tolist((np.load('dummy_data/actual.npy')).flatten())
    }