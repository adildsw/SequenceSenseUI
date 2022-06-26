import math
import csv
import numpy as np
import sys
from sklearn.preprocessing import normalize
from scipy import signal
import matplotlib.pyplot  as plt
import pandas as pd
from pyquaternion import Quaternion
from collections import OrderedDict
from numpy import loadtxt
from pykalman import KalmanFilter
import warnings
import joblib
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
warnings.filterwarnings('ignore')


loaded_model = joblib.load("./data/__finalized_model.sav")
# global newSeqDic
# global newLabelDic
# global newSeqDicFeatures
# global N
N = 18
newLabelDic ={}
newSeqDic = {}
newSeqDicFeatures = {}

# global newSeqWrongPred
newSeqWrongPred = {}
# global y_pred_prob_global
y_pred_prob_global = None


def clean_up_preprocess_data():
    global newLabelDic, newSeqDic, newSeqDicFeatures, newSeqWrongPred, y_pred_prob_global
    newLabelDic ={}
    newSeqDic = {}
    newSeqDicFeatures = {}
    newSeqWrongPred = {}
    y_pred_prob_global = None

reverseSequenceMap = {
        1:"a0 a1",
        2:"a0 a2 a0 a2",
        3:"a0 a3",
        4:"a0 a4",
        5:"a0 a5",
        6:"a0 a6", 
        7:"a0 a7",
        8:"a0 a8",
        11:"a0 a9",
        12:"a0 a10",
        15:"a0 a11 a0 a11",
        16:"a0 a12 a0 a13",
        17:"a0 a13 a0 a12",
        9:"aw1",
        10:"aw2",
        13:"aw3",
        14:"aw4",
        18:"a0 a11",
        19:"a0 a12",
        20:"a0 a13",
        21:"a0 a14"
        }
class ProssedData:
    def __init__(self, original, data_kalRotation, vel, pos, euler_angles, dump_data, feature, feature2=None, label=-1, label2=-1, seq="", SIZE = 1):
        self.size = SIZE
        self.original_data = original
        self.acc_kal_rotation = data_kalRotation
        self.velocity = vel
        self.position = pos
        self.euler_angles = euler_angles
        self.dump_data = dump_data
        self.feature = feature
        self.label = label 
        self.feature2 = feature2
        self.label2 = label2
        self.seq = seq
    def mergeData(self, other):
        print("before merge: ", self.original_data.shape)
        self.original_data = np.vstack((self.original_data, other.original_data))
        print("after merge: ", self.original_data.shape)
        self.acc_kal_rotation = np.vstack((self.acc_kal_rotation, other.acc_kal_rotation))
        self.velocity = np.vstack((self.velocity, other.velocity))
        self.position = np.vstack((self.position, other.position))
        self.euler_angles = np.vstack((self.euler_angles, other.euler_angles))
        self.dump_data = np.vstack((self.dump_data, other.dump_data))
        self.feature = np.vstack((self.feature, other.feature))
        self.label = np.vstack((self.label, other.label))
        self.feature2 = np.vstack((self.feature2, other.feature2))
        self.label2 = np.vstack((self.label2, other.label2))
        self.seq = self.seq +";"+other.seq


def loadFiles(data, drc, gestureName, isKnown = True):
    # original_data
    # data = loadtxt(fileName, delimiter=',')
    global newLabelDic, newSeqDic, newSeqDicFeatures, newSeqWrongPred, y_pred_prob_global
    data_stationary = loadtxt('./data/LOG0.CSV', delimiter=',') #np.copy(data[:100,])
    print(data.shape)
    print(data_stationary.shape)
    keep_data_intact = np.copy(data)

    data = apply_kalman(data)
    data_stationary = apply_kalman(data_stationary)

    data = rotate_acceleration(data)
    data_stationary = rotate_acceleration(data_stationary)
    data = compensate_gravity(data, data_stationary)

    data = rotate_acceleration_byZ(data, isKnown)
    
    data[:, 1] = data[:, 1] * -1 #sesnor X was directed to bacward, to make it forward multiplied by -1
    
    Fs = 200
    samplePeriod = 1/Fs

    stationary = None
    _acc_magFilt = None
    _acc_grad = None
    _vel = None
    _velDR = None
    _pos= None
    _start_pos = None
    _end_pos = None
    d = data

    segment_size = d.shape[0]
    start = 0
    for i in range(start, d.shape[0], segment_size):
        counter = i
        time = d[i:i+segment_size,0]
        accX = d[i:i+segment_size,1] 
        accY = d[i:i+segment_size,2] 
        accZ = d[i:i+segment_size,3] 
        
        acc = d[i:i+segment_size, 1:4]
        acc_grad = np.zeros((accX.shape[0], 3))
        for t in range(1,len(acc_grad)-1,1):
            acc_grad[t,:] = (acc[t+1,:] - acc[t,:]) / (time[t+1] - time[t])
            ttv = 0.06
            if(abs(acc_grad[t,0]) < ttv and abs(acc_grad[t,1]) < ttv and abs(acc_grad[t,2]) < ttv):
                acc_grad[t,:] = 0
        #     acc = d[i:i+segment_size, 1:4]
        #     acc_grad = np.zeros((accX.shape[0], 3))
        #     orient = d[i:i+segment_size, 5:8]
        #     orient_grad = np.zeros((accX.shape[0], 3))
        #     for t in range(1,len(acc_grad)-1,1):
        #         acc_grad[t,:] = (acc[t+1,:] - acc[t,:]) / (time[t+1] - time[t])
        #         orient_grad[t,:] = (orient[t+1,:] - orient[t,:]) / (time[t+1] - time[t]) * 1000
        #         ttv = 0.06
        #         ttv2 = 0.09
        #         if(abs(acc_grad[t,0]) < ttv and abs(acc_grad[t,1]) < ttv and abs(acc_grad[t,2]) < ttv):
        #             if(abs(orient_grad[t,0]) < ttv2 and abs(orient_grad[t,1]) < ttv2 and abs(orient_grad[t,2]) < ttv):
        #                 acc_grad[t,:] = 0    
        
        
        if(counter == start):
            _acc_grad = acc_grad
        else:
            _acc_grad = np.vstack((_acc_grad,acc_grad))

            

        
        # Compute accelerometer magnitude
        acc_mag = np.sqrt(accX**2 + accY**2 + accZ**2)
        acc_magFilt = abs(acc_mag)
        
   
        # Threshold detection
        accXS = data_stationary[:, 1]
        accYS = data_stationary[:, 2]
        accZS = data_stationary[:, 3]
        
        
        stationaty_start_time = abs(np.sqrt(accXS**2 + accYS**2 + accZS**2))  #acc_magFilt[:segment_size] 
        statistical_stationary_threshold = np.mean(stationaty_start_time) #* 0.22  # - 0.7 * np.mean(stationaty_start_time) 


        _stationary = np.array(np.zeros(acc_magFilt.shape), dtype=bool)
        j = 0
        interval_samples_time = 100
        runs = zero_runs(acc_grad[:, 0])
    #     print(runs[:,1] - runs[:,0])
        for itr in range(runs.shape[0]):
            if (runs[itr,1] - runs[itr,0] >=50):
                _stationary[runs[itr,0]:runs[itr,1]] = True
        
                
        _stationary = append_to_non_stationary(runs, _stationary, 10)
        
        short_interval_s = []
        short_interval_e = []
        check = False
        size  = _stationary.shape[0]
    #     print("stationary size: ", size)
        i = 0
        while i < size:
            if _stationary[i] == False:
                short_interval_s.append(i)
                while i < size and _stationary[i] == False:
                    i = i + 1
                i = i - 1
                short_interval_e.append(i)
            i = i + 1


        interval_samples_time = 300 #
        for i in range(0, len(short_interval_s)):
            if(time[short_interval_e[i]] - time[short_interval_s[i]] < interval_samples_time):
                print(time[short_interval_s[i]], time[short_interval_e[i]])
                _stationary[short_interval_s[i]: short_interval_e[i]+1] = True
        
        
    #     print(statistical_stationary_threshold)
        if(counter == start):
            stationary = _stationary
            _acc_magFilt = acc_magFilt 
        else:
            stationary = np.hstack((stationary,_stationary))
            _acc_magFilt = np.hstack((_acc_magFilt,acc_magFilt)) 
            
            
        i = counter 
        
        #ZUPT
        acc = d[i:i+segment_size, 1:4] 
        vel = np.zeros((accX.shape[0], 3))
        for t in range(0,len(vel),1):
            vel[t,:] = vel[t-1,:] + acc[t,:] * samplePeriod
            if _stationary[t]:
                vel[t,:] = np.zeros((3))    # force zero velocity when foot stationary
                
        if(counter == start):
            _vel = vel
        else:
            _vel = np.vstack((_vel,vel))
            

        
    #         # Compute integral drift during non-stationary periods

        velDrift = np.zeros(np.shape(vel))

        dd = np.append(arr = [0], values = np.diff(_stationary.astype(np.int8)))
        stationaryStart = np.where( dd == -1)
        stationaryEnd = np.where( dd == 1)
        stationaryStart = np.array(stationaryStart)[0]
        stationaryEnd = np.array(stationaryEnd)[0]

        for i in range(len(stationaryEnd)-1):
            driftRate = vel[stationaryEnd[i]-1, :] / (stationaryEnd[i] - stationaryStart[i])
            enum = np.arange(0, stationaryEnd[i] - stationaryStart[i])
            enum_t = enum.reshape((1,len(enum)))
            driftRate_t = driftRate.reshape((1,len(driftRate)))
            drift = enum_t.T * driftRate_t
            velDrift[stationaryStart[i]:stationaryEnd[i], :] = drift

        # Remove integral drift

        vel = vel - velDrift
        
        if(counter == start):
            _velDR = vel
        else:
            _velDR = np.vstack((_velDR,vel))
        

    #     Compute translational position

        # Integrate velocity to yield position
        pos = np.zeros(np.shape(vel))
        start_pos = []
        end_pos = []
        check =0
        for t in range(1,len(pos)):
            if np.array_equal(vel[t,:],np.zeros((3))):
                pos[t,:] = np.zeros((3))
                if check == 1:
                    end_pos.append(t)
                    check = 0
            else:
                pos[t,:] = pos[t-1,:] + vel[t,:] * samplePeriod    # integrate velocity to yield position

                if check ==0:
                    start_pos.append(t)
                    check = 1
        #     if stationary[t]:
        #         pos[t,:] = np.zeros((3))
        if(len(start_pos) != len(end_pos)):
            if(len(start_pos) > len(end_pos)):
                end_pos.append(pos.shape[0]-1)
            else:
                start_pos.insert(0,0)
                
        
        if(counter == start):
            _pos = pos
            _start_pos = start_pos
            _end_pos = end_pos
        else:
            start_pos = np.asarray(start_pos) + counter 
            end_pos = np.asarray(end_pos) + counter
            _pos = np.vstack((_pos,pos))
            _start_pos = np.hstack((_start_pos,start_pos))
            _end_pos = np.hstack((_end_pos,end_pos))

    # time_plot =  data[:, 0] - data[0, 0]         
    accX = data[:, 1]
    accY = data[:, 2]
    accZ = data[:, 3]

    after_kal_rotation  = np.copy(data[:, 0:4])

    velocity = np.copy(_vel)
    position = np.copy(_pos)


    _start_pos = np.array(_start_pos)
    _end_pos = np.array(_end_pos)

    diff = _end_pos - _start_pos
    large_frame_count = 0
    small_frame_count = 0
    indices = np.array([-1])
    for i in range(diff.shape[0]):
        if (diff[i] > 300):
            large_frame_count += 1 
            print(diff[i])
            indices = np.append(indices, i)
            
        if (diff[i] < 50):
            small_frame_count += 1
            indices = np.append(indices, i)
    
    indices =  np.delete(indices, 0)
    dataQ = data[:, 4:8]
    relativeQ = np.zeros(dataQ.shape)
    #stationaryQ = np.zeros(dataQ.shape)
    stationaryQ = dataQ[0]
    for t in range(1,len(_pos)):
        if np.array_equal(_vel[t,:],np.zeros((3))):
            stationaryQ = dataQ[t]
            q0 = Quaternion(stationaryQ[0], stationaryQ[1], stationaryQ[2], stationaryQ[3])
            q1 = Quaternion(stationaryQ[0], stationaryQ[1], stationaryQ[2], stationaryQ[3])
            q2 = q0.inverse * q1
            relativeQ[t] = q2.elements
        else:
            q0 = Quaternion(stationaryQ[0], stationaryQ[1], stationaryQ[2], stationaryQ[3])
            q1 = Quaternion(dataQ[t][0], dataQ[t][1], dataQ[t][2], dataQ[t][3])
            q2 = q0.inverse * q1
            relativeQ[t] = q2.elements
            
    rolls_r = np.zeros((dataQ.shape[0],1))
    pitchs_r = np.zeros((dataQ.shape[0],1))
    yaws_r = np.zeros((dataQ.shape[0],1))

    orientation = np.zeros((dataQ.shape[0],3))
    pi = 3.1416
    for i in range(dataQ.shape[0]):
        roll, pitch, yaw = quaternion_to_euler(relativeQ[i][0],relativeQ[i][1],relativeQ[i][2],relativeQ[i][3])
        rolls_r[i] = roll* 180/pi * -1
        pitchs_r[i] = pitch* 180/pi
        yaws_r[i] = yaw* 180/pi * -1

        orientation[i][0] = roll* 180/pi * -1
        orientation[i][1] = pitch* 180/pi 
        orientation[i][2] = yaw* 180/pi * -1

    #make same frame size for classification of the data
    
    if(isKnown):
        skip_list_size = indices.shape[0]
        if( drc == 8): #drc == 2 or
            frame_length = 200
            checkValue  = 200
        else:
            frame_length = 400
            checkValue  = 400
        dump_data = np.zeros(((_start_pos.shape[0] - skip_list_size) * frame_length, 6))
        j=0
        count = 0
        flag = False
        for i in range(_start_pos.shape[0]):
            if(diff[i] > checkValue or diff[i] < 50 or (count < indices.shape[0] and i ==indices[count])):
                count+=1
                continue
            
            padSize = frame_length - diff[i]
            if(padSize<0):
                padSize =0
            padSize2 = int(padSize//2)
            if(padSize % 2 != 0):
                padSize2 = int(padSize//2) + 1
            padSize = int(padSize//2)
        #     print(padSize, padSize2, diff[i] + padSize +padSize2)
            
            dump_data[j * frame_length : (j+1) * frame_length, 0] = np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),0], (padSize, padSize2), 'constant', constant_values=(0, 0))
            dump_data[j * frame_length : (j+1) * frame_length, 1] = np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),1], (padSize, padSize2), 'constant', constant_values=(0, 0))
            dump_data[j * frame_length : (j+1) * frame_length, 2] = np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),2], (padSize, padSize2), 'constant', constant_values=(0, 0))

            dump_data[j * frame_length : (j+1) * frame_length, 3] = np.pad(rolls_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))
            dump_data[j * frame_length : (j+1) * frame_length, 4] = np.pad(pitchs_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))
            dump_data[j * frame_length : (j+1) * frame_length, 5] = np.pad(yaws_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))
            j = j+ 1
            flag = True
        # print(dump_data.shape[0]/400)
        if(flag):
            feature, label = function_makeSegment_padding(dump_data,400,400, drc, 0)
        else:
            return None
        # print(feature.shape, label.shape)
        return ProssedData(keep_data_intact, after_kal_rotation, velocity, position, orientation, dump_data,feature, label=label)

    frame_length = 400
    # dump_data = np.zeros(((_start_pos.shape[0] - skip_list_size) * frame_length, 6))
    dump_data = None
    dump_data2 = None
    j=0
    count = 0
    flag = True
    seq = ""
    labelSeq = ""
    seqSize = 0
    global y_pred_prob_global
    for i in range(_start_pos.shape[0]):
        if(diff[i] > 300 or diff[i] < 50 or (count < indices.shape[0] and i ==indices[count])):
            count+=1
            continue

        padSize = frame_length - diff[i]
        padSize2 = int(padSize//2)
        if(padSize % 2 != 0):
            padSize2 = int(padSize//2) + 1
        padSize = int(padSize//2)
    #     print(padSize, padSize2, diff[i] + padSize +padSize2)
        
        temp = np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),0], (padSize, padSize2), 'constant', constant_values=(0, 0))
        temp = np.column_stack((temp, np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),1], (padSize, padSize2), 'constant', constant_values=(0, 0))))
        temp = np.column_stack((temp, np.pad(_pos[int(_start_pos[i]): int(_end_pos[i]),2], (padSize, padSize2), 'constant', constant_values=(0, 0))))

        temp = np.column_stack((temp, np.pad(rolls_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))))
        temp = np.column_stack((temp, np.pad(pitchs_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))))
        temp = np.column_stack((temp, np.pad(yaws_r[int(_start_pos[i]): int(_end_pos[i])].ravel(), (padSize, padSize2), 'constant', constant_values=(0, 0))))
        
        __f, __l = function_makeSegment_padding(temp,400,400, 30, 0)
        # y_pred = loaded_model.predict(__f)
        y_pred_prob = loaded_model.predict_proba(__f)
        
        if(y_pred_prob_global is None):
            y_pred_prob_global = y_pred_prob
        else:
            y_pred_prob_global = np.vstack((y_pred_prob_global, y_pred_prob))

        y_pred = np.argmax(y_pred_prob, axis=1)
        classes = loaded_model.classes_
        y_pred = [classes[i] for i in y_pred]

        seq += reverseSequenceMap.get(y_pred[0])
        seq += " "
        labelSeq += str(y_pred[0])
        labelSeq += " "
        seqSize += 1
        if(flag):
            dump_data = temp
            flag = False
        else:
            dump_data = np.vstack((dump_data, temp))


    seq = seq.strip()
    labelSeq = labelSeq.strip()
    print("seq: ", seq)
    print("Labelseq: ", labelSeq)
    li = newSeqDic.get(gestureName, -1)
    lf = newSeqDicFeatures.get(gestureName, -1)
    la = newLabelDic.get(gestureName, -1)
    if(li != -1 and lf != -1 and la != -1):
        li.append(seq)
        newSeqDic.update({gestureName: li})

        lf.append(dump_data)
        newSeqDicFeatures.update({gestureName: lf})

        la.append(labelSeq)
        newLabelDic.update({gestureName: la})
    else:
        li = [seq]
        newSeqDic[gestureName] = li

        lf = [dump_data]
        newSeqDicFeatures[gestureName] = lf

        la = [labelSeq]
        newLabelDic[gestureName] = la
    # print(dump_data.shape[0]/400)
    feature, label = None, None
    feature2, label2 = None, None
    # feature, label = function_makeSegment_padding(dump_data,dump_data.shape[0],dump_data.shape[0], drc, 0)
    if(not flag):
        feature, label = function_makeSegment_padding(dump_data,400,400, drc, 0)

    # print("global: ", y_pred_prob_global)
    return ProssedData(keep_data_intact, after_kal_rotation, velocity, position, orientation, dump_data,feature, feature2, label, label2, seq = seq, SIZE =  seqSize)




def find_peak_ZPOS(X):
    size = X.shape[0]
    i = 1
    T = 0.01
    saveZi = -1 
    angleT = 8
    while( i < size-1):
        
        if (X[i-1] < X[i] and X[i] > X[i+1] and (X[i] > T)):
            saveZi = i
            break
#             return i
        i += 1
    
    
    if (saveZi != -1):
        angle = np.arctan2(X[saveZi], i/size) *180/math.pi
        # print(angle)
        # if (angle >angleT):
        return saveZi
    
    
    return -1

def find_peak_Angle(X):
    size = X.shape[0]
    i = 25
    indices = []
    indices2 = []
    count = 0
    count2 = 0
    T = 5
    small_segment = 40
    end_segment = 25
    while( i < size-1):
        if (X[i-1] < X[i] and X[i] > X[i+1] and X[i] > T):
            if count >= 1 and i - indices[count-1] <= small_segment :
                i += 1
                continue
            count += 1
            indices.append(i)
        elif (count >= 1 and X[i-1] > X[i] and X[i] < X[i+1]):
            if (count2 >= 1 and i - indices2[count2-1] <= small_segment) or size - i <= end_segment :
                i += 1
                continue
            count2 += 1
            indices2.append(i)
            
        i += 1
    return indices, indices2

def classifyUploadedGestures(processed_data):
    # global newLabelDic, newSeqDic, newSeqDicFeatures, newSeqWrongPred, y_pred_prob_global
    # print(len(processed_data))
    if(len(processed_data) <= 0):
        return
    data_combined= processed_data[0].feature
    labels= processed_data[0].label
    for i in range(len(processed_data)-1):
        data_combined = np.vstack((data_combined, processed_data[i+1].feature))
        labels = np.vstack((labels, processed_data[i+1].label))
    
    y_pred_prob = loaded_model.predict_proba(data_combined)
    y_pred = np.argmax(y_pred_prob, axis=1)
    classes = loaded_model.classes_
    y_pred = [classes[i] for i in y_pred]

    confusion = confusion_matrix(labels, y_pred)
    accuracy_s = accuracy_score(labels, y_pred)
    print('Confusion Matrix\n')
    print(confusion)

    print(y_pred)
    print(labels)
    wrong_pred = np.zeros(N, dtype=int)
    right_pred = np.zeros(N, dtype=int)

    labels = np.array(labels)
    y_pred = np.array(y_pred)
    print(labels.shape, y_pred.shape)
    if(labels.shape[0] > 1):
        for i in range(labels.shape[0]):
            if (labels[i][0] == y_pred[i]):
                right_pred[y_pred[i]-1] = i
            else:
                wrong_pred[y_pred[i]-1] = i
    else:
        if (labels[0] == y_pred[0]):
                right_pred[y_pred[0]-1] = 0
        else:
            wrong_pred[y_pred[0]-1] = 0


    return confusion, labels, y_pred, data_combined, right_pred, wrong_pred, accuracy_s, y_pred_prob    

def classifyUploadedGestures2(processed_data):
    # print(len(processed_data))
    flag1 = False
    flag2 = False
    confusion3 = None
    labels3 = None
    y_pred3 = None
    data_combined3 = None
    right_pred3= None
    wrong_pred3 = None
    accuracy_s3 = None
  
    if(len(processed_data) <= 0):
        return

    data_combined= None
    labels= None
    # print("shape: ", data_combined.shape)
    for i in range(len(processed_data)):
        if(processed_data[i].feature is None):
            continue
        # print("shape: ", processed_data[i+1].feature.shape)
        flag1 = True
        if(data_combined is None):
            data_combined = processed_data[i].feature
            labels= processed_data[i].label
        else:
            data_combined = np.vstack((data_combined, processed_data[i].feature))
            labels = np.vstack((labels, processed_data[i].label))
    
    # data_combined = processed_data.feature
    # labels = processed_data.label
    if(flag1):
        print("shape: ", data_combined.shape)
        loaded_model = joblib.load("./data/atomic_whole_finalized_model.sav")
        y_pred = loaded_model.predict(data_combined)

        confusion = confusion_matrix(labels, y_pred)
        accuracy_s = accuracy_score(labels, y_pred)
        print('Confusion Matrix\n')
        print(confusion)

        print(y_pred)
        print(labels)
        wrong_pred = np.zeros(17, dtype=int)
        right_pred = np.zeros(17, dtype=int)

        for i in range(len(labels)):
            if (labels[i] == y_pred[i]):
                right_pred[y_pred[i]-1] = i
            else:
                wrong_pred[y_pred[i]-1] = i
    
        labels3 = labels
        y_pred3 = y_pred
        data_combined3 = data_combined
        right_pred3 = right_pred
        wrong_pred3 = wrong_pred


    data_combined= None
    labels= None
    # print("shape: ", data_combined.shape)
    for i in range(len(processed_data)):
        if(processed_data[i].feature2 is None):
            continue
        # print("shape: ", processed_data[i+1].feature2.shape)
        if(data_combined is None):
            data_combined= processed_data[i].feature2
            labels = processed_data[i].label2
        else:
            data_combined = np.vstack((data_combined, processed_data[i].feature2))
            labels = np.vstack((labels, processed_data[i].label2))
        flag2 = True
    
    # data_combined = processed_data.feature
    # labels = processed_data.label
    if(flag2):
        print("shape: ", data_combined.shape)
        loaded_model = joblib.load("./data/atomic_finalized_model.sav")
        y_pred = loaded_model.predict(data_combined)

        confusion = confusion_matrix(labels, y_pred)
        accuracy_s = accuracy_score(labels, y_pred)
        print('Confusion Matrix2\n')
        print(confusion)

        print(y_pred)
        print(labels)

        if(flag1):
            wrong_pred = wrong_pred3
            right_pred = right_pred3
        else:
            wrong_pred = np.zeros(17, dtype=int)
            right_pred = np.zeros(17, dtype=int)

        for i in range(len(labels)):
            if (labels[i] == y_pred[i]):
                right_pred[y_pred[i]-1] = i
            else:
                wrong_pred[y_pred[i]-1] = i
    
        wrong_pred3 = wrong_pred
        right_pred3 = right_pred
    if(flag1):
        # labels3.extend([item for sublist in labels for item in sublist])
        labels3 = np.append(labels3, labels)
        # y_pred3.extend(y_pred)
        y_pred3 = np.append(y_pred3, y_pred)
        # data_combined3 = np.vstack((data_combined3, data_combined))
    else:
        labels3 = labels
        y_pred3 = y_pred
        data_combined3 = data_combined

    accuracy_s3 = accuracy_score(labels3, y_pred3) 
    confusion3 = confusion_matrix(labels3, y_pred3)

    print('Confusion Matrix3\n')
    print(confusion3)
    print(y_pred3)


    return confusion3, labels3, y_pred3, data_combined3, right_pred3, wrong_pred3, accuracy_s3
    


def function_makeSegment_padding(data, segment_length, overlappiong, classY, padSize): 
    flag_Y_start = 0
    segment_start_flag = 0
    start_seg = 0
    # print("shape in segmenting: ", data.shape[0])
    while ( (start_seg + segment_length) <= data.shape[0] ):
        flag = 1
        featureSet = data[start_seg:(start_seg + segment_length), :]
#         print(featureSet.shape)
        if padSize > 0 :
            result = np.zeros((featureSet.shape[0]+padSize, featureSet.shape[1]))
            result[padSize//2:padSize//2 + featureSet.shape[0],:featureSet.shape[1]] = featureSet
            featureSet = result

        if segment_start_flag == 0:
            SegAllFeat = np.asarray(featureSet).reshape(1,featureSet.shape[0],featureSet.shape[1])
            segment_start_flag = 1
        else:
            SegAllFeat = np.vstack((SegAllFeat, np.asarray(featureSet).reshape(1,featureSet.shape[0],featureSet.shape[1])))

#         print(SegAllFeat.shape)
        if flag_Y_start == 0:
            ClassLabel = [classY]
            flag_Y_start = 1
        else:
            ClassLabel = np.vstack((ClassLabel, [classY]))

        start_seg = start_seg + overlappiong


    return SegAllFeat, ClassLabel
    
#quaternion
def quaternion_to_euler(w, x, y, z):
    sinr_cosp = 2 * (w * x + y * z)
    cosr_cosp = 1 - 2 * (x**2 + y**2)
    roll = np.arctan2(sinr_cosp, cosr_cosp)

    sinp = 2 * (w * y - z * x)
    pitch = np.where(np.abs(sinp) >= 1,
                     np.sign(sinp) * np.pi / 2,
                     np.arcsin(sinp))

    siny_cosp = 2 * (w * z + x * y)
    cosy_cosp = 1 - 2 * (y**2 + z**2)
    yaw = np.arctan2(siny_cosp, cosy_cosp)

    return roll, pitch, yaw
#first kalman
def apply_kalman(dataset):
    # kalman filters X
    data = dataset
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,1][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)

    dataset[:,1] = kf.smooth(data[:,1])[0].T 


    # kalman filters Y
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,2][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,2] = kf.smooth(data[:,2])[0].T 

    # kalman filters Z
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,3][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,3] = kf.smooth(data[:,3])[0].T 
    
    # kalman filters W
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,4][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,4] = kf.smooth(data[:,4])[0].T 
    
     # kalman filters I
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,5][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,5] = kf.smooth(data[:,5])[0].T 
    
      # kalman filters J
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,6][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,6] = kf.smooth(data[:,6])[0].T 
    
      # kalman filters K
    kf = KalmanFilter(transition_matrices=[1],
                      observation_matrices=[1],
                      initial_state_mean=data[:,7][0],
                      initial_state_covariance=1,
                      observation_covariance=5,
                      transition_covariance=1)
    dataset[:,7] = kf.smooth(data[:,7])[0].T 
    return dataset

def rotate_acceleration(dataset):
    datarotated = np.copy(dataset)
    for i in range(dataset.shape[0]):
        q = Quaternion(dataset[i][4],dataset[i][5],dataset[i][6],dataset[i][7])
        datarotated[i, 1:4] = q.rotate(dataset[i,1:4])
    return datarotated

def rotate_acceleration_byZ(dataset, isKnown=True):
    datarotated = np.copy(dataset)
    for i in range(dataset.shape[0]):
        q = Quaternion(dataset[i][4],dataset[i][5],dataset[i][6],dataset[i][7])
        theta = q.angle
        if(dataset[i][7] < 0):
            axisZ = 1
        else:
            axisZ = -1
        q = Quaternion(axis=[0,0,axisZ],angle=theta) #-1
        datarotated[i, 1:4] = q.rotate(dataset[i,1:4])
    return datarotated



def compensate_gravity(dataset, data_stationary):
    dataset[:,1] = dataset[:,1] -  np.mean(data_stationary[:, 1])
    dataset[:,2] = dataset[:,2] -  np.mean(data_stationary[:, 2])
    dataset[:,3] = dataset[:,3] -  np.mean(data_stationary[:, 3])
    return dataset
def zero_runs(a):
    # Create an array that is 1 where a is 0, and pad each end with an extra 0.
    iszero = np.concatenate(([0], np.equal(a, 0).view(np.int8), [0]))
    absdiff = np.abs(np.diff(iszero))
    # Runs start and end where absdiff is 1.
    ranges = np.where(absdiff == 1)[0].reshape(-1, 2)
    return ranges
def append_to_non_stationary(runs, _stationary, size):
    _runs_start = []
    _runs_end = []

    if(runs[0][0] != 0):
        _runs_start.append(0)
        _runs_end.append(runs[0][0])

    for itr in range(runs.shape[0]):
        _runs_start.append(runs[itr][1])
        if(itr < runs.shape[0]-1):
            _runs_end.append(runs[itr+1][0])
        else:
            _runs_end.append(len(_stationary)-1)
    
    for i in range(len(_runs_start)):
        if(_runs_start[i] - size >= 0):
            _stationary[_runs_start[i] - size:_runs_start[i]] = False
        if(_runs_end[i] + size < len(_stationary)):
            _stationary[_runs_end[i] :_runs_end[i] + size] = False
    
    return _stationary