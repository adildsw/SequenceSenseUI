import numpy as np
from preprocess_data import *
import preprocess_data
import os
import joblib
import json
import shutil
import matplotlib.pyplot  as plt
import sys

gestureList = ['Jump', 'Run in place', 'A step to the side', 'Turn left', 'Turn right', 'A step forward', 'A step backward',
        'Walk in place', 'Draw a circle', 'Drag from front to back', "Rotate toes left", "Rotate toes right",
        "Drag from left to right", "Drag from right to left", "Double foot tap", "Foot tap to the right"
        , "Foot tap to the left", 'A step to the side (left)']

seqToGesMap = {1: "a",
            2: "b",
            3: "c",
            4: "d",
            5: "e",
            6: "f",
            7: "g",
            8: "h",
            11: "i",
            12: "j",
            15: "k",
            16: "",
            17: "m",
            9: "n",
            10: "o",
            13: "p",
            14: "q",
            18: "r",
            19: "s",
            20: 't',
            21: 'u'
         } 

sequenceMap = {
        "a0a1":1,
        "a0a2":2,
        "a0a3":3,
        "a0a4":4,
        "a0a5":5,
        "a0a6":6, 
        "a0a7":7,
        "a0a8":8,
        "a0a9":11,
        "a0a10":12,
        "a0a11":15,
        "a0a12":16,
        "a0a13":17,
        "aw1":9,
        "aw2":10,
        "aw3":13,
        "aw4":14,
        "a0a14":21,
        }
gestureMap = {'Jump':1, 'Run in place':2, 'A step to the side':3, 'Turn left':4, 'Turn right':5, 'A step forward':6, 
        'A step backward':7, 'Walk in place':8, 'Draw a circle':9, 'Drag from front to back':10, 
        "Rotate toes left":11, "Rotate toes right":12,"Drag from left to right":13, 
        "Drag from right to left":14, "Double foot tap":15, "Foot tap to the right":16, "Foot tap to the left":17, 'A step to the side (left)':21}
# reverse_sequence_map = {
#         "a0 a1": "Jump",
#         "a0 a2 a0 a2": "Run in place",
#         "a0 a3": "A step to the side",
#         "a0 a4": "Turn left",
#         "a0 a5": "Turn right",
#         "a0 a6": "A step forward", 
#         "a0 a7": "A step backward",
#         "a0 a8 a0 a8": "Walk in place",
#         "aw1": "Draw a circle",
#         "aw2": "Drag from front to back",
#         "a0 a9": "Rotate toes left",
#         "a0 a10": "Rotate toes right",
#         "aw3": "Drag from left to right",
#         "aw4": "Drag from right to left",
#         "a0 a11 a0 a11": "Double foot tap",
#         "a0 a12 a0 a13": "Foot tap to the right",
#         "a0 a13 a0 a12": "Foot tap to the left",
#         "a0 a14": "A step to the side (left)"
# }

reverse_sequence_map = {}
uploaded_files = {""}
uploaded_files_list = []
saved_processed_data = []
saved_processed_data_index_map = {}
processedDataUnknown = []
processedDataUnknownIndexMap = {}
uploadedFilesUnknown = {""}
uploadedFilesListUnknown = []
data_combined = None
right_pred = None
wrong_pred = None
final_labels = None

conflict_analysis_result = {}
avg_conflict_analysis_result = {}

confidence_list_global = None
count_list_actual_global = None

def cleanupState():
    global reverse_sequence_map, uploaded_files, uploaded_files_list, saved_processed_data
    global saved_processed_data_index_map, processedDataUnknown, processedDataUnknownIndexMap
    global uploadedFilesUnknown, uploadedFilesListUnknown, data_combined, right_pred, wrong_pred
    global final_labels, conflict_analysis_result, avg_conflict_analysis_result, confidence_list_global, count_list_actual_global

    reverse_sequence_map = {}
    uploaded_files = {""}
    uploaded_files_list = []
    saved_processed_data = []
    saved_processed_data_index_map = {}
    processedDataUnknown = []
    processedDataUnknownIndexMap = {}
    uploadedFilesUnknown = {""}
    uploadedFilesListUnknown = []
    data_combined = None
    right_pred = None
    wrong_pred = None
    final_labels = None

    conflict_analysis_result = {}
    avg_conflict_analysis_result = {}

    confidence_list_global = None
    count_list_actual_global = None


# global variables for conflict analysis
regular_activites_data = np.load("./data/regular_details_all.npy", allow_pickle=True)
stringList = []
for j in range(len(regular_activites_data)): #len(regular_activites_data)
    X = regular_activites_data[j]
    s = ""
    for i in range(X.shape[0]):
        s += str(seqToGesMap.get(X[i][2]))
    stringList.append(s)
# END

def classify(labels: list, files: dict, data: dict):
    '''
    Code for classifying gesture samples.

    Parameters
    labels (list): list of gesture labels
    files (dict): dictionary containing files for each gesture
    data (dict): dictionary containing data for each file

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
    # iterate through each gesture label
    wrong_files_count = 0
    for label in labels:
        print("label: ", label)
        isExistingGesture = False
        indexLabel = -1
        # check if the label is in the gesture map
        if gestureMap.get(label) is not None:
            isExistingGesture = True
            indexLabel = gestureMap[label]
        else:
            uploadedFilesListUnknown.append(label)       
        # get the files for each gesture label
        files_for_label = files[label]
        # get the data for each file
        i = 0
        for file in files_for_label:
            # get the data for each file
            try:
                d = data[file]
                lines = d.split('\n')
                final_d = []
                for line in lines:
                    dtemp = line.split(',')
                    if len(dtemp) > 1:
                        for idx, val in enumerate(dtemp):
                            dtemp[idx] = float(val)
                        final_d.append(dtemp)
                data_for_file = np.array(final_d)
            except:
                return {
                    'status': "Error",
                    'message': "Error in processing file, invalid file."
                }

            print("CheckShape: ", data_for_file.shape)
            processed_data = loadFiles(data_for_file, indexLabel, label, isExistingGesture)

            if(processed_data is None):
                # add comments for that gesture
                return  {
                    'status': "Error",
                    'message': "Error in processing file, invalid file."
                    }

            if isExistingGesture:
                if i == 0:
                    saved_processed_data.append(processed_data)
                    saved_processed_data_index_map[label] = len(saved_processed_data)-1
                else:
                    index = len(saved_processed_data) - 1
                    temp = saved_processed_data[index]
                    if(len(temp.dump_data.shape) >= 2):
                        temp.mergeData(processed_data)
                        saved_processed_data[index] = temp
            else:
                if i == 0:
                    processedDataUnknown.append(processed_data)
                    processedDataUnknownIndexMap[label] = len(processedDataUnknown)-1
                else:
                    index = len(processedDataUnknown) - 1
                    temp = processedDataUnknown[index]
                    temp.mergeData(processed_data)
                    processedDataUnknown[index] = temp

            i += 1
    
    # get the accuracy
    global confidence_list_global
    global count_list_actual_global
    global data_combined, right_pred, wrong_pred
    global y_pred_prob_global, newSeqDic
    if(len(saved_processed_data) > 0):
        confusion, true_labels, predicted_labels, data_combined, right_pred, wrong_pred, accuracy_s, y_pred_prob = classifyUploadedGestures(saved_processed_data)
        predicted_labels = np.append(true_labels, predicted_labels)
        print("new seq disc: ", len(newSeqDic))  

        if(len(newSeqDic)>0):
            print(y_pred_prob.shape, preprocess_data.y_pred_prob_global.shape)
            y_pred_prob = np.vstack((y_pred_prob, preprocess_data.y_pred_prob_global))
            confidence_list_global, count_list_actual_global = calculateGestureAcc(y_pred_prob)
            if(len(newSeqDic)>0):
                total, total_matched, matched_list, not_matched_list, confusion2, predicted_labels2 = calculateSeqAccuracy()
                accuracy_s = (accuracy_s + (total_matched/total))/2
                predicted_labels = np.append(predicted_labels, predicted_labels2)

                __confusion = np.zeros((confusion.shape[0]+confusion2.shape[0], confusion.shape[0]+confusion2.shape[0]), dtype=int)
                for i in range(confusion.shape[0]):
                    for j in range(confusion.shape[1]):
                        __confusion[i,j] = confusion[i,j]
                
                for i in range(confusion2.shape[0]):
                    temp = np.zeros(__confusion.shape[0], dtype= int)
                    temp[temp.shape[0]-1] = not_matched_list[i]
                    temp[confusion.shape[0]+i] = matched_list[i]
                    __confusion[confusion.shape[0]+i, :] = temp
                confusion = __confusion
    
    elif (len(newSeqDic)>0):
        total, total_matched, matched_list, not_matched_list, confusion, predicted_labels = calculateSeqAccuracy()
        accuracy_s =  (total_matched/total)
        confidence_list_global, count_list_actual_global = calculateGestureAcc(preprocess_data.y_pred_prob_global)
        # third.accuracy = "{:.2f}".format(accuracy_s * 100)


    print("data_combined: ", data_combined)

    # generate json return format
    concat_gestures = get_concat_data()
    overlap_gestures = get_overlap_data()

    # generate uniquie labels
    unique_labels = np.unique(predicted_labels)
    output_labels = []
    global gestureList
    for i in unique_labels:
        output_labels.append(gestureList[i - 1])

    global final_labels
    final_labels = output_labels

    # seq report
    seq_report = get_seq_report()
    
    # chart-data
    chart_data = {
        'concat': concat_gestures,
        'overlap': overlap_gestures
    }

    # get atomic sequence for all labels
    atomic_sequences = get_atomic_sequence(labels)
    global conflict_analysis_result, avg_conflict_analysis_result

    # get conflict analysis for sequences
    for key in atomic_sequences:
        atomic_seq = atomic_sequences[key]
        seq_str = " ".join(atomic_seq)
        reverse_sequence_map[seq_str] = key
        if conflict_analysis_result.get(key) is None:
            conflict_map = analyze_conflict_helper(atomic_seq)
            conflict_analysis_result[key] = conflict_map


    # get average conflict analysis result
    avg_conflict_analysis_result = get_avg_conflict_analysis_result()
     
    return {
        'status': "Ok",
        'message': "Successs",
        'accuracy': accuracy_s,
        'chartData': chart_data,
        'confusionMatrix': np.ndarray.tolist(confusion),
        'labels': output_labels,
        'seqReport': seq_report,
        'atomicSeq': atomic_sequences,
        'conflictAnalysis': conflict_analysis_result,
        'avgConflictAnalysis': avg_conflict_analysis_result
    }


def get_avg_conflict_analysis_result():
    global conflict_analysis_result
    analysis_result = {}
    regular = None
    gesture = None
    confidence = None
    count = 0
    for key in conflict_analysis_result:
        conflict_map = conflict_analysis_result[key]
        if conflict_map["status"] == "Ok":
            # output_map['confidence']
            if regular is None:
                regular = np.array(conflict_map['regular'])
                gesture = np.array(conflict_map['gesture'])
                confidence  = conflict_map['confidence'] 
            else:
                regular += np.array(conflict_map['regular'])
                gesture += np.array(conflict_map['gesture'])
            count += 1
    if regular is not None:
        regular /= count
        gesture /= count
    
    analysis_result['regular'] = np.ndarray.tolist(regular.flatten())
    analysis_result['gesture'] = np.ndarray.tolist(gesture.flatten())
    analysis_result['confidence'] = confidence
    analysis_result['status'] = "Ok"
    analysis_result['message'] = "Average conflict analysis result"
    return analysis_result


            

def get_atomic_sequence(labels):
    global gestureMap, processedDataUnknown, processedDataUnknownIndexMap
    sequence = [
        "a0 a1",
        "a0 a2 a0 a2",
        "a0 a3",
        "a0 a4",
        "a0 a5",
        "a0 a6", 
        "a0 a7",
        "a0 a8 a0 a8",
        "aw1",
        "aw2",
        "a0 a9",
        "a0 a10",
        "aw3",
        "aw4",
        "a0 a11 a0 a11",
        "a0 a12 a0 a13",
        "a0 a13 a0 a12"
        ]
    sequence_map = {}
    for label in labels:
        i = gestureMap.get(label, 0) - 1
        if(i == -1):
            seqs = processedDataUnknown[processedDataUnknownIndexMap[label]].seq
            seq = seqs.split(";")[0]
        else:
            seq = sequence[i]
        
        # convert space separated string to a list
        seq_list = seq.split()
        sequence_map[label] = seq_list
    return sequence_map

def get_seq_report():
    global processedDataUnknown, uploadedFilesListUnknown
    size = len(processedDataUnknown)
    string = ""
    for i in range(size):
        string += "For the sequence: "
        string += uploadedFilesListUnknown[i] +" \n"
        data = processedDataUnknown[i]
        seqs = data.seq.split(";")
        for j in range(len(seqs)):
            string += "sample " + str(j+1) +" is recognized as: " + seqs[j] + "\n"
        string += "\n\n"
    return string


def get_concat_gestures(processed_data, processed_data_index_map):
    gestures = {}
    for label in processed_data_index_map:
        index = processed_data_index_map[label]
        raw = {}
        postprocess = {}
        velocity = {}
        distance = {}
        orientation = {}
        gesture = {}

        data = processed_data[index].original_data
        timestamp =   np.ndarray.tolist((data[:, 0] - data[0, 0]).flatten())
        raw['x']    = np.ndarray.tolist(data[:, 1].flatten())
        raw['y']    = np.ndarray.tolist(data[:, 2].flatten())
        raw['z']    = np.ndarray.tolist(data[:, 3].flatten())

        data = processed_data[index].acc_kal_rotation 
        postprocess['x']    = np.ndarray.tolist(data[:, 1].flatten())
        postprocess['y']    = np.ndarray.tolist(data[:, 2].flatten())
        postprocess['z']    = np.ndarray.tolist(data[:, 3].flatten())

        data = processed_data[index].velocity
        velocity['x']    = np.ndarray.tolist(data[:, 0].flatten())
        velocity['y']    = np.ndarray.tolist(data[:, 1].flatten())
        velocity['z']    = np.ndarray.tolist(data[:, 2].flatten())

        data = processed_data[index].position
        distance['x']    = np.ndarray.tolist(data[:, 0].flatten())
        distance['y']    = np.ndarray.tolist(data[:, 1].flatten())
        distance['z']    = np.ndarray.tolist(data[:, 2].flatten())

        data = processed_data[index].euler_angles
        orientation['roll']    = np.ndarray.tolist(data[:, 0].flatten())
        orientation['pitch']   = np.ndarray.tolist(data[:, 1].flatten())
        orientation['yaw']     = np.ndarray.tolist(data[:, 2].flatten())

        gesture['raw']    = raw
        gesture['postprocess']    = postprocess
        gesture['velocity']    = velocity
        gesture['distance']    = distance
        gesture['orientation']    = orientation
        gesture['timestamp']    = timestamp

        gestures[label] = gesture
    return gestures
   

def get_concat_data():
    global saved_processed_data, saved_processed_data_index_map, processedDataUnknown, processedDataUnknownIndexMap
    gestures_known =  get_concat_gestures(saved_processed_data, saved_processed_data_index_map)
    gestures_unknown =  get_concat_gestures(processedDataUnknown, processedDataUnknownIndexMap)
    
    # merge two dictionaries
    if gestures_known is None:
        return gestures_unknown
    elif gestures_unknown is None:
        return gestures_known

    gestures = {**gestures_known, **gestures_unknown}
    
    return gestures

def get_overlap_data():
    global saved_processed_data, saved_processed_data_index_map, processedDataUnknown, processedDataUnknownIndexMap
    gestures_known =  get_overlap_gestures_known(saved_processed_data, saved_processed_data_index_map)
    gestures_unknown =  get_overlap_gestures_unknown(processedDataUnknown, processedDataUnknownIndexMap)

    # merge two dictionaries
    if gestures_known is None:
        return gestures_unknown
    elif gestures_unknown is None:
        return gestures_known
    gestures = {**gestures_known, **gestures_unknown}

    return gestures

def get_overlap_gestures_unknown(processedDataUnknown, processedDataUnknownIndexMap):
    gestures = {}
    for label in processedDataUnknownIndexMap:
        index = processedDataUnknownIndexMap[label]
        distance = {
            '0': {}
        }
        orientation = {
            '0': {}
        }
        gesture = {}
        data = processedDataUnknown[index].position
        distance['0']['x']    = np.ndarray.tolist(data[:, 0].flatten())
        distance['0']['y']    = np.ndarray.tolist(data[:, 1].flatten())
        distance['0']['z']    = np.ndarray.tolist(data[:, 2].flatten())

        data = processedDataUnknown[index].euler_angles
        orientation['0']['roll']    = np.ndarray.tolist(data[:, 0].flatten())
        orientation['0']['pitch']   = np.ndarray.tolist(data[:, 1].flatten())
        orientation['0']['yaw']     = np.ndarray.tolist(data[:, 2].flatten())
        
        sample = [i for i in range(len(distance['0']['x']))]

        gesture['distance']    = distance
        gesture['orientation']    = orientation
        gesture['sample'] = sample
        gestures[label] = gesture

    return gestures

def get_overlap_gestures_known(processed_data, processed_data_index_map):
    gestures = {}
    for label in processed_data_index_map:
        index = processed_data_index_map[label]
        distance = {}
        orientation = {}
        gesture = {}
        data = processed_data[index].feature
        for i in range(data.shape[0]):
            distance[str(i)] = {}
            distance[str(i)]['x']    = np.ndarray.tolist(data[i,:,0].flatten())
            distance[str(i)]['y']    = np.ndarray.tolist(data[i,:,1].flatten())
            distance[str(i)]['z']    = np.ndarray.tolist(data[i,:,2].flatten())
        
        for i in range(data.shape[0]):
            orientation[str(i)] = {}
            orientation[str(i)]['roll']    = np.ndarray.tolist(data[i,:,3].flatten())
            orientation[str(i)]['pitch']   = np.ndarray.tolist(data[i,:,4].flatten())
            orientation[str(i)]['yaw']     = np.ndarray.tolist(data[i,:,5].flatten())

        sample = [i for i in range(len(distance['0']['x']))]

        gesture['distance']    = distance
        gesture['orientation']    = orientation
        gesture['sample'] = sample

        gestures[label] = gesture

    return gestures

    

# def get_single_data(data_combined, right_pred, wrong_pred):
#     gestures_known =  get_single_gestures(saved_processed_data, saved_processed_data_index_map)
#     gestures_unknown =  get_single_gestures(processedDataUnknown, processedDataUnknownIndexMap)
    
#     # merge two dictionaries
#     gestures = {**gestures_known, **gestures_unknown}

#     return gestures

def calculateSeqAccuracy():
    global newLabelDic, gestureList, newSeqWrongPred, newSeqDicFeatures
    total = 0
    total_matched = 0
    matched_list = []
    not_matched_list = []
    predicted_labels = []
    confusion = None
    for key, value in newLabelDic.items():
        print("key: ", key, "value: ", value)
        total += len(value)
        cur_matched = 1
        predicted_labels.append(len(gestureList)+1)
        gestureList.append(key)
        refSeq = value[0]
        refSeq = convertString(refSeq)            
        for i in range(len(value)-1):
            pattern = value[i+1]
            pattern = convertString(pattern) 
            print("ref: ", refSeq, " pattern", pattern)
            val = isMatched(refSeq, pattern, editDistanceSize=1)
            print("val: ", val)
            cur_matched += val
            if(val == 0):
                li = newSeqWrongPred.get(key, -1)
                if(li == -1):
                    v = newSeqDicFeatures.get(key)
                    li = [v[i+1]]
                    newSeqWrongPred[key] = li
                else:
                    v = newSeqDicFeatures.get(key)
                    li.append(v[i+1])
                    newSeqWrongPred.update({key: li})

        total_matched += cur_matched
        matched_list.append(cur_matched)
        not_matched_list.append(len(value) -cur_matched)
    if(total != total_matched):
        predicted_labels.append(len(gestureList)+1)
        gestureList.append("Unknown Sequence")
        matched_list.append(0)
        not_matched_list.append(0)
    
    confusion = np.zeros((len(predicted_labels),len(predicted_labels)), dtype=int)
    print("matched: ", matched_list)
    for i in range(confusion.shape[0]):
        confusion[i,confusion.shape[0]-1] = not_matched_list[i]
        confusion[i,i] = matched_list[i]
    print("confusion_matrix: ", confusion)
    return total, total_matched, matched_list, not_matched_list, confusion, predicted_labels

def convertString(str1):
    global seqToGesMap
    pattern = ""
    s = str1.split(" ")
    print("s: ", s)
    for i in range(len(s)):
        pattern += str(seqToGesMap.get(int(s[i])))
    # print("pattern: ", pattern)
    return pattern

def isMatched(refSeq, pattern, editDistanceSize=0):
    if(editDistanceSize==0):
        if(refSeq == pattern):
            return 1
        else:
            return 0
    else:
        val = hammingDist(refSeq, pattern)
        if(val == -1):
            return 0
        elif (val <= 1):
            return 1
        else:
            return 0

def hammingDist(str1, str2):
    if(len(str1) != len(str2)):
        return -1
    i = 0
    count = 0
    while(i < len(str1)):
        if(str1[i] != str2[i]):
            count += 1
        i += 1
    return count

def calculateGestureAcc(y_pred_prob):
    global y_pred_prob_global
    confidence = 1
    count_list_actual = []
    labels_count = np.zeros(21)
    print("global: ", preprocess_data.y_pred_prob_global)
    total = y_pred_prob.shape[0]
    confidence_list = []
    while confidence >= -0.05:
        count = 0
        confidence_list.append(confidence)
        for i in range(y_pred_prob.shape[0]):
            if (y_pred_prob[i].max() >= confidence):
                count  = count + 1
                labels_count[np.argmax(y_pred_prob[i])] += 1
        count_list_actual.append(count/total)
        confidence -= 0.05
    return confidence_list, count_list_actual

def analyze_conflict_helper(sequence : list):
    global count_list_actual_global, sequenceMap

    if len(sequence) == 0:
        return {
                'message': "Invalid sequence",
                'status': "All atomic sequence from a1-a13 must start with a0."
            }

    i = 0
    size = len(sequence)
    actual_gesture = []
    actual_gesture_ids = []
    while(i<size):
        if(sequence[i] == "a0"):
            s = sequence[i]+sequence[i+1]
            i = i+2
        else:
            s = sequence[i]
            i = i+1
        if(sequenceMap.get(s) == None):
            return {
                'message': "Invalid sequence",
                'status': "All atomic sequence from a1-a13 must start with a0."
            }
        else:
            actual_gesture.append(s)
            actual_gesture_ids.append(sequenceMap.get(s))
    
    #right sequence
    print(actual_gesture)
    print(actual_gesture_ids)
    if(len(actual_gesture_ids) > 4):
        return {
                'message': "Invalid sequence",
                'status': "Sequencing more than 4 gestures won't be practical that we ignored them!"
            }
    if(len(actual_gesture_ids) == 1):
        id = actual_gesture_ids[0] - 1
        if(count_list_actual_global is not None):
            count_list_actual = count_list_actual_global
        else:
            count_list_actual = np.load('./data/count_list_actual.npy')
        
        conflicts_data = np.load("./data/all_conflicts.npy")
        output_map = {}
        output_map['message'] = 'Ok'
        output_map['status'] = 'Ok'
        output_map['confidence'] = np.ndarray.tolist(np.load('./data/confidence_list_final_2.npy').flatten())
        output_map['regular'] = np.ndarray.tolist(conflicts_data[:, id].flatten())
        if type(count_list_actual) is list: 
            temp = count_list_actual
        else:
            temp = np.ndarray.tolist(count_list_actual.flatten())
        output_map['gesture'] = temp
        output_map['sequence'] = actual_gesture[0]
        return output_map
    
    #otherwise
    confidence_list, count_list_reg, text, count_list_reg_final = calculateConflicts(actual_gesture_ids, actual_gesture)

    if(count_list_actual_global is not None):
        count_list_actual = count_list_actual_global
    else:

        print("count_list_actual_global is always none: ", count_list_actual_global)
        count_list_actual = np.load('./data/count_list_actual.npy')

    output_map = {}
    output_map['message'] = 'Ok'
    output_map['status'] = 'Ok'
    output_map['confidence'] = confidence_list
    output_map['regular'] = count_list_reg

    if type(count_list_actual) is list: 
        temp = count_list_actual
    else:
        temp = np.ndarray.tolist(count_list_actual.flatten())
    output_map['gesture'] = temp

    if(count_list_reg_final is not None):
        for i in range(len(count_list_reg_final)):
            output_map['hamming'+str(i+1)] = count_list_reg_final[i]
    output_map['sequence'] = text

    return output_map

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
    global conflict_analysis_result, avg_conflict_analysis_result, reverse_sequence_map

    if len(sequence) == 0:
        return {
                'message': "Invalid sequence, all atomic sequence from a1-a13 must start with a0.",
                'status': "Error"
            }

    seq_str = " ".join(sequence)
    label = reverse_sequence_map.get(seq_str)

    if label is not None and conflict_analysis_result.get(label) is not None:
        return {
            'message': "Ok",
            'status': "Ok",
            'conflictAnalysis': conflict_analysis_result,
            'avgConflictAnalysis': avg_conflict_analysis_result
            }

    i = 0
    size = len(sequence)
    actual_gesture = []
    actual_gesture_ids = []
    while(i<size):
        if(sequence[i] == "a0"):
            s = sequence[i]+sequence[i+1]
            i = i+2
        else:
            s = sequence[i]
            i = i+1
        if(sequenceMap.get(s) == None):
            return {
                'message': "Invalid sequence, all atomic sequence from a1-a13 must start with a0.",
                'status': "Error"
            }
        else:
            actual_gesture.append(s)
            actual_gesture_ids.append(sequenceMap.get(s))
    
    #right sequence
    print(actual_gesture)
    print(actual_gesture_ids)
    if(len(actual_gesture_ids) > 4):
        return {
                'message': "Invalid sequence, sequencing more than 4 gestures won't be practical that we ignored them.",
                'status': "Error"
            }
    if(len(actual_gesture_ids) == 1):
        id = actual_gesture_ids[0] - 1
        if(count_list_actual_global is not None):
            count_list_actual = count_list_actual_global
        else:
            count_list_actual = np.load('./data/count_list_actual.npy')
        
        conflicts_data = np.load("./data/all_conflicts.npy")
        output_map = {}
        output_map['message'] = 'Ok'
        output_map['status'] = 'Ok'
        output_map['confidence'] = np.ndarray.tolist(np.load('./data/confidence_list_final_2.npy').flatten())
        output_map['regular'] = np.ndarray.tolist(conflicts_data[:, id].flatten())

        if type(count_list_actual) is list: 
            temp = count_list_actual
        else:
            temp = np.ndarray.tolist(count_list_actual.flatten())

        output_map['gesture'] = temp
        output_map['sequence'] = actual_gesture[0]

        new_label_name = "custom_seq"
        reverse_sequence_map[seq_str] = new_label_name
        conflict_analysis_result[new_label_name] = output_map
        avg_conflict_analysis_result = get_avg_conflict_analysis_result()


        return {
            'message': "Ok",
            'status': "Ok",
            'conflictAnalysis': conflict_analysis_result,
            'avgConflictAnalysis': avg_conflict_analysis_result
            }
    
    #otherwise
    confidence_list, count_list_reg, text, count_list_reg_final = calculateConflicts(actual_gesture_ids, actual_gesture)

    if(count_list_actual_global is not None):
        count_list_actual = count_list_actual_global
    else:
        count_list_actual = np.load('./data/count_list_actual.npy')

    output_map = {}
    output_map['message'] = 'Ok'
    output_map['status'] = 'Ok'
    output_map['confidence'] = confidence_list
    output_map['regular'] = count_list_reg
    if type(count_list_actual) is list: 
        temp = count_list_actual
    else:
        temp = np.ndarray.tolist(count_list_actual.flatten())
    output_map['gesture'] = temp

    if(count_list_reg_final is not None):
        for i in range(len(count_list_reg_final)):
            output_map['hamming'+str(i+1)] = count_list_reg_final[i]
    output_map['sequence'] = text

    new_label_name = "custom_seq"
    reverse_sequence_map[seq_str] = new_label_name
    conflict_analysis_result[new_label_name] = output_map
    avg_conflict_analysis_result = get_avg_conflict_analysis_result()


    return {
            'message': "Ok",
            'status': "Ok",
            'conflictAnalysis': conflict_analysis_result,
            'avgConflictAnalysis': avg_conflict_analysis_result
            }


def hammingDist2(str1, str2):
        if(len(str1) != len(str2)):
            return sys.maxsize
        i = 0
        count = 0
        while(i < len(str1)):
            if(str1[i] != str2[i]):
                count += 1
            i += 1
        return count

def checkConfidence(confidence, list1):
        for i in range(len(list1)):
            if(list1[i] < confidence):
                return False
        return True

def checkTimeConstraint(list1):
        for i in range(len(list1)-1):
            if(list1[i+1][0] - list1[i][1] > 500 ):
                return False
        return True

def calculateConflicts(actual_gesture_ids, actual_gesture):
    global seqToGesMap, regular_activites_data
    confidence = 1
    confidence_list = []
    count_list_reg = []
    count_list_reg1 = []
    count_list_reg2 = []
    count_list_reg3 = []
    # labels_count = np.zeros(len(plot_labels))
    total = 0
    pattern = ""
    for i in range(len(actual_gesture_ids)):
        pattern += str(seqToGesMap.get(actual_gesture_ids[i]))
    print("pattern: ", pattern)
    count_list_reg_final = []
    while confidence >= -0.05:
        count = 0
        total =1
        confidence_list.append(confidence)
        count1 = 0
        total1 =1
        count2 = 0
        total2 =1
        count3 = 0
        total3 =1
        for j in range(len(regular_activites_data)):
            X = regular_activites_data[j]
            text = stringList[j]
            for i in range(X.shape[0]-len(pattern)+1):
                str1 = text[i:i+len(pattern)]
                # print(str1, pattern)
                hdist = hammingDist2(pattern, str1)
                if(hdist == 0):
                    list1 = X[i:i+len(pattern),3]
                    list2 = X[i:i+len(pattern),0:2]
                    total += 1
                    if(checkConfidence(confidence, list1) and checkTimeConstraint(list2)):
                        count += 1
                if(len(pattern) >= 2 and hdist == 1):
                    list1 = X[i:i+len(pattern),3]
                    list2 = X[i:i+len(pattern),0:2]
                    total1 += 1
                    if(checkConfidence(confidence, list1) and checkTimeConstraint(list2)):
                        count1 += 1
                if(len(pattern) >= 3 and hdist == 2):
                    list1 = X[i:i+len(pattern),3]
                    list2 = X[i:i+len(pattern),0:2]
                    total2 += 1
                    if(checkConfidence(confidence, list1) and checkTimeConstraint(list2)):
                        count2 += 1
                if(len(pattern) >= 4 and hdist == 3):
                    list1 = X[i:i+len(pattern),3]
                    list2 = X[i:i+len(pattern),0:2]
                    total3 += 1
                    if(checkConfidence(confidence, list1) and checkTimeConstraint(list2)):
                        count3 += 1

        count_list_reg.append(count/total)
        if(len(pattern)>=2):
            count_list_reg1.append((count/total) + (count1)/(total1))
        if(len(pattern)>=3):
            count_list_reg2.append((count/total) + (count1)/(total1) + (count2)/(total2))
        if(len(pattern)>=4):
            count_list_reg3.append((count/total) + (count1)/(total1) + (count2)/(total2) + (count3)/(total3))
        # print(count, " ", total, " ", count1, " ", total1," ", count2, " ", total2, " ", count3, " ", total3)
        confidence -= 0.05
    
    if(len(pattern)>=4):
        count_list_reg_final.append(count_list_reg1)
        count_list_reg_final.append(count_list_reg2)
        count_list_reg_final.append(count_list_reg3)
    elif(len(pattern)>=3):
        count_list_reg_final.append(count_list_reg1)
        count_list_reg_final.append(count_list_reg2)
    elif(len(pattern)>=2):
        count_list_reg_final.append(count_list_reg1)
    
    text = ""
    for i in range(len(actual_gesture)):
        text += actual_gesture[i]
    return confidence_list, count_list_reg, text, count_list_reg_final


def get_confusion_chart_data(i_label: str, j_label: str):
    """
    Returns the chart data for row i and column j
    {
        "actual": {
            distance': {
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
        "predicted": {
            distance': {
                        'x': [],
                        'y': [],
                        'z': []
                    },
            'orientation': {
                'x': [],
                'y': [],
                'z': []
            }
        }
    }
    """

    global gestureList, gestureMap, newSeqDicFeatures, newSeqWrongPred
    global data_combined, right_pred, wrong_pred
    i = -1
    j = -1
    for k in range(len(gestureList)):
        if gestureList[k] == i_label:
            i = k
        if gestureList[k] == j_label:
            j = k

    print("i: ", i, " j: ", j)
    if  i == j:
        index = gestureMap.get(i_label, -1)
        if index == -1:
            d = newSeqDicFeatures.get(gestureList[i])[0]
            x = d[:, 0]
            y = d[:, 1]
            z = d[:, 2]
            roll = d[:, 3]
            pitch = d[:, 4]
            yaw = d[:, 5]
        else:
            print("data_combined in f", data_combined)
            print("right pred: ", right_pred.shape)
            
            x = data_combined[int(right_pred[i]),:,0]
            y = data_combined[int(right_pred[i]),:,1]
            z = data_combined[int(right_pred[i]),:,2]
            roll = data_combined[int(right_pred[i]),:,3]
            pitch = data_combined[int(right_pred[i]),:,4]
            yaw = data_combined[int(right_pred[i]),:,5]
        return {
            'status': 'Ok',
            'message': 'Ok',
            "actual": get_formated_data(x, y, z, roll, pitch, yaw),
            "predicted": get_formated_data(x, y, z, roll, pitch, yaw)
        }
    else:
        index = gestureMap.get(i_label, -1)
        if index == -1:
            #actual
            d = newSeqWrongPred.get(gestureList[i])[0]
            x1 = d[:, 0]
            y1 = d[:, 1]
            z1 = d[:, 2]
            roll1 = d[:, 3]
            pitch1 = d[:, 4]
            yaw1 = d[:, 5]
            #predicted
            d = newSeqWrongPred.get(gestureList[j])[0]
            x2 = d[:, 0]
            y2 = d[:, 1]
            z2 = d[:, 2]
            roll2 = d[:, 3]
            pitch2 = d[:, 4]
            yaw2 = d[:, 5]
        else:
            #actual
            x1 = data_combined[int(wrong_pred[i]),:,0]
            y1 = data_combined[int(wrong_pred[i]),:,1]
            z1 = data_combined[int(wrong_pred[i]),:,2]
            roll1 = data_combined[int(wrong_pred[i]),:,3]
            pitch1 = data_combined[int(wrong_pred[i]),:,4]
            yaw1 = data_combined[int(wrong_pred[i]),:,5]
            #predicted
            x2 = data_combined[int(wrong_pred[j]),:,0]
            y2 = data_combined[int(wrong_pred[j]),:,1]
            z2 = data_combined[int(wrong_pred[j]),:,2]
            roll2 = data_combined[int(wrong_pred[j]),:,3]
            pitch2 = data_combined[int(wrong_pred[j]),:,4]
            yaw2 = data_combined[int(wrong_pred[j]),:,5]
        return {
            'status': 'Ok',
            'message': 'Ok',
            "actual": get_formated_data(x1, y1, z1, roll1, pitch1, yaw1),
            "predicted": get_formated_data(x2, y2, z2, roll2, pitch2, yaw2)
        }

def get_formated_data(x, y, z, roll, pitch, yaw):
    """
    Returns the formated data for the chart
    """
    return {
        "sample": [i for i in range(len(x))],
        "distance": {
            "x": np.ndarray.tolist(x.flatten()),
            "y": np.ndarray.tolist(y.flatten()),
            "z": np.ndarray.tolist(z.flatten())
        },
        "orientation": {
            "roll": np.ndarray.tolist(roll.flatten()),
            "pitch": np.ndarray.tolist(pitch.flatten()),
            "yaw": np.ndarray.tolist(yaw.flatten())
        }
    }

def save_plot(title, confidence_list, gesture_list, regular_list, file_name, directory, confidence = None):

    plt.clf()
    plt.title(title)
    plt.plot(confidence_list, gesture_list, color='darkgreen', marker='x', label='Gestures')
    plt.plot(confidence_list, regular_list, color='darkred', marker='o', label='Regular activities')

    if confidence is not None:
        plt.axvline(confidence, color='darkblue', linestyle='--', label='Confidence threshold')

    ax = plt.gca()
    plt.xlabel("Confidence")
    plt.ylabel("Detection Rate")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    plt.grid(True)
    plt.legend(fontsize=10)
    plt.savefig(directory+file_name+".png")


def get_json_data_for_report(confidence_list, gesture_list, regular_list, file_name, directory, sequnece = None, confidence = None):
    index = -1
    for i in range(len(confidence_list)):
        if confidence >= confidence_list[i]:
            index = i
            break
    if index == -1:
        return None

    output = {}
    if file_name == "Average_Conflict_Analysis_JSON":
        output["Title"] = "Average Conflicts Analysis"
    else:
        output["Gesture name"] =  file_name
        output["Sequence"] = sequnece
    output["At confidence"] = confidence
    output["Gesture Recognition Accuracy"] = str(gesture_list[index] * 100) + "%"
    output["False Positives from Regular Activites"] = str(regular_list[index] * 100) + "%"
    # output["Overall Accuracy"] = str((gesture_list[index] - regular_list[index]) * 100) + "%"

    with open(directory+file_name+".json", "w", encoding='utf-8') as outfile:
        json.dump(output, outfile, ensure_ascii=False, indent=4)
    
    return output


def generate_report(confidence: float):
    global conflict_analysis_result, avg_conflict_analysis_result

    folder_name = "server_res/gesture_report"
    final_directory = os.path.join("", folder_name)
    if not os.path.exists(final_directory):
        os.makedirs(final_directory)
    
    #jump model
    joblib.dump(loaded_model, "./"+folder_name+"/model.sav")
    model = {}
    model['name'] = "K-Nearest Neighbors"
    model['input_dimension'] = "400 samples (2 seconds) x 6 features"
    model["features"] = "3D distance and 3D orientation"
    model["k"] = "5"
    model["similarity_measure"] = "Dynamic Time Warping (DTW)"
    model["library"] = "Tslearn"
    # model_json = json.dumps(model)
    with open(folder_name+"/model_meta.json", "w", encoding='utf-8') as outfile:
        json.dump(model, outfile, ensure_ascii=False, indent=4)


    # average report
    # avg_conflict_analysis_result
    # avg_conflict_analysis_result['regular'] = np.ndarray.tolist(regular.flatten())
    # avg_conflict_analysis_result['gesture'] = np.ndarray.tolist(gesture.flatten())
    # avg_conflict_analysis_result['confidence'] = confidence

    # print("avg_conflict_analysis_result: ", avg_conflict_analysis_result)
    if avg_conflict_analysis_result is not None:
        confidence_list = avg_conflict_analysis_result['confidence']
        gesture_list = avg_conflict_analysis_result['gesture']  
        regular_list = avg_conflict_analysis_result['regular']
        title = "Average Conflict Analysis Graph at Confidence = "+str(confidence)
        file_name = "Average_Conflict_Analysis_Chart"
        directory = "./"+folder_name+"/"
        save_plot(title, confidence_list, gesture_list, regular_list, file_name, directory, confidence = confidence)

        # average report json
        file_name = "Average_Conflict_Analysis_JSON"
        get_json_data_for_report(confidence_list, gesture_list, regular_list, file_name, directory, confidence = confidence)



    # specificc report for each gesture
    for key in conflict_analysis_result:
        confidence_list = conflict_analysis_result[key]['confidence']
        gesture_list = conflict_analysis_result[key]['gesture']  
        regular_list = conflict_analysis_result[key]['regular']
        sequnece = conflict_analysis_result[key]['sequence']
        title = "Conflict Analysis Graph for Gesture = "+ key+ ", Sequence = "+ sequnece
        file_name = "Conflict_Analysis_Chart_"+ key

        gestures_details_folder = "gestures_details"
        final_directory = os.path.join(folder_name, gestures_details_folder)
        if not os.path.exists(final_directory):
            os.makedirs(final_directory)
        directory = "./"+folder_name+"/"+gestures_details_folder+"/"
        save_plot(title, confidence_list, gesture_list, regular_list, file_name, directory, confidence = confidence)

        # specificc report for each gesture json
        file_name = "Conflict_Analysis_JSON_"+ key
        get_json_data_for_report(confidence_list, gesture_list, regular_list, key, directory, sequnece, confidence = confidence)

    shutil.make_archive(folder_name, 'zip', './'+folder_name)
    shutil.rmtree('./'+folder_name)
    return {"status": "success", 'filename': folder_name + '.zip'}
