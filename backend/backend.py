import numpy as np
from dummy_data_generator import get_concat_data, get_single_data, get_overlap_data, get_confusion_matrix, get_conflict_analysis_data

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
            'single': { # Single data for confusion matrix true/predicted visualization
                'gesture1': {
                    'timestamp': [],
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
                    'timestamp': [],
                    'distance': {
                        'sample1': {
                            'x': [],
                            'y': [],
                            'z': []
                        }
                        ,
                        'sample2': {
                            
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
            }
        }
    }

    '''

    # Dummy code returns static chart data for each gesture in a dictionary
    chart_data = {
        'concat': {},
        'single': {},
        'overlap': {}
    }
    for label in labels:
        chart_data['concat'][label] = get_concat_data()
        chart_data['single'][label] = get_single_data()
        chart_data['overlap'][label] = get_overlap_data()
    
    # Dummy code returns random confusion matrix
    accuracy, confusion_matrix = get_confusion_matrix(len(labels))
    
    return {
        'accuracy': accuracy,
        'chartData': chart_data,
        'confusionMatrix': confusion_matrix
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

if __name__ == '__main__':
    # print(get_chart_data('Jump')['raw']['x'])
    process(['Jump', 'Wave', 'Swim'], {'Jump': 'test_data/Jump.npy', 'Wave': 'test_data/Wave.npy'}, {'Jump': get_chart_data('Jump'), 'Wave': get_chart_data('Wave')})