import numpy as np
from dummy_data_generator import get_concat_data, get_overlap_data, get_confusion_matrix, get_conflict_analysis_data, get_confusion_matrix_data

def classify(labels: list, files: dict, data: dict):
    '''
    Code for classifying gesture samples.

    Parameters
    labels (list): list of gesture labels
    files (dict): dictionary containing files for each gesture
    data (dict): dictionary containing data for each file
    Example -> {
        'labels': [Jump, Walk in place, ...],
        'files': {
            'Jump': [file1, file2, ...],
            'Walk in place': [file1x, file2x, ...],
            ...
        },
        'data': {
            'file1': {
                ...
            },
            'file2': {
                ...
            },
            ...
        }
    }

    csvstr -> split('\n') -> split(',') -> read as

    Returns
    dict: dictionary containing chart data (timestamp, raw, postprocess, velocity, distance, and orientation) for each gesture label
    Example -> {
        'accuracy': float (0.0 - 1.0),
        'confusionMatrix': 2x2 list (labels x labels)
        'conflictChartData': {
            'confidence': [],
            'regular': [],
            'gesture': [],
        }
        'chartData': {
            'concat': { # Concatenated data for processing visualization
                'gesture1': {
                    'timestamp': [],
                    'raw': {
                        'x': [],
                        'y': [],
                        'z': []
                    },
                    'postprocess': {
                        'x': [],
                        'y': [],
                        'z': []
                    },
                    'velocity': {
                        'x': [],
                        'y': [],
                        'z': []
                    },
                    'distance': {
                        'x': [],
                        'y': [],
                        'z': []
                    },
                    'orientation': {
                        'x': [],
                        'y': [],
                        'z': []
                    }
                },
                'gesture2': {
                    ...
                },
                ...
            },
            'overlap': { # Overlapping data for conflict analysis visualization
                'gesture1': {
                    'sample': [],
                    'distance': {
                        'sample1': {
                            'x': [],
                            'y': [],
                            'z': []
                        },
                        'sample2': {
                            'x': [],
                            'y': [],
                            'z': []
                        },
                        ...
                    },
                    'orientation': {
                        'sample1': {
                            'x': [],
                            'y': [],
                            'z': []
                        },
                        'sample2': {
                            'x': [],
                            'y': [],
                            'z': []
                        },
                        ...
                    }
                },
                'gesture2': {
                    ...
                },
                ...
            }
        }
    }

    '''

    # Dummy code returns static chart data for each gesture in a dictionary
    chart_data = {
        'concat': {},
        'overlap': {}
    }
    for label in labels:
        chart_data['concat'][label] = get_concat_data()
        chart_data['overlap'][label] = get_overlap_data()
    
    # Dummy code returns random confusion matrix
    accuracy, confusion_matrix = get_confusion_matrix(len(labels))
    
    return {
        'accuracy': accuracy,
        'chartData': chart_data,
        'confusionMatrix': confusion_matrix,
        'conflictChartData': analyze_conflict([])
    }

def analyze_conflict(sequence : list):
    '''
    Code for analyzing conflicts for a given sequence.

    Parameter
    sequence (list): gesture sequence list (Example: ['a0', 'a1', 'a0', 'a6'])

    Returns
    dict: dictionary containing conflict analysis chart data (confidence, regular activity, gesture, hamming distances)
    Example -> {
        'confidence': [],
        'regular': [],
        'gesture': [],
        'hamming1': [], # optional
        ...
    }

    '''
    
    # Dummy code returns random conflict analysis data
    conflict_analysis_data = get_conflict_analysis_data()
    return conflict_analysis_data

def get_confusion_chart_data(actual_label, predicted_label):
    '''
    Code for getting confusion chart data for a given actual and predicted labels.

    Parameters
    actual_label (str): actual gesture label
    predicted_label (str): predicted gesture label

    Returns
    dict: dictionary containing position and orientation chart data for given actual and predicted labels
    Example -> {
        'actual': {
            'distance': {
                'x': [],
                'y': [],
                'z': []
            },
            'orientation': {
                'roll': [],
                'pitch': [],
                'yaw': []
            }
        },
        'predicted': {
            'distance': {
                'x': [],
                'y': [],
                'z': []
            },
            'orientation': {
                'roll': [],
                'pitch': [],
                'yaw': []
            }
        }
    }
    '''

    # Dummy code returns random chart data
    return get_confusion_matrix_data()

# if __name__ == '__main__':
    # print(get_chart_data('Jump')['raw']['x'])