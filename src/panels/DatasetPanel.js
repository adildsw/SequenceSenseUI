import { useEffect, useState } from 'react';
import { Typography, Space, Card, Segmented, AutoComplete, Button, Empty, Upload, Tree, message, Popconfirm, Tooltip } from 'antd';
import { CopyOutlined, FileOutlined, UploadOutlined, InfoCircleOutlined, DownOutlined, SettingFilled, DeleteOutlined, CheckOutlined, DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';

import { getAntdSegmentedItem, getAntdSelectItem } from '../utils/AntdUtils';

import { gestureList } from '../utils/GestureUtils';

const { Title, Text } = Typography;

const DatasetPanel = (props) => {

    const { gestureData, setGestureData, setClassifierData, setSelectedClassification, setGeneratedData, isFetchingClassificationResult, setIsFetchingClassificationResult, serverAddress } = props;

    const [uploadType, setUploadType] = useState('single');
    const [uploadGesture, setUploadGesture] = useState('');
    const [gestureDeleteProps, setGestureDeleteProps] = useState({'visible': false, 'type': 'sample', 'toDelete': '', 'x': 0, 'y': 0});

    const generateRandomFileExample = () => (
        gestureList[Math.floor(Math.random() * gestureList.length)] + Math.floor(Math.random() * 100) + '.csv'
    );
    const [randomGestureFileExample, setRandomGestureFileExample] = useState(generateRandomFileExample());

    useEffect(() => {
        window.addEventListener('click', (e) => {
            if (!String(e.target.className).includes('ant-popover')) {
                setGestureDeleteProps(prevState => {
                    if (prevState.visible === true)
                        return {...prevState, 'visible': false};
                    else
                        return prevState;
                });
            }
        });
    }, []);

    const uploadOptions = [
        getAntdSegmentedItem(uploadType === 'single' ? ' Single' : '', 'single', <FileOutlined />),
        getAntdSegmentedItem(uploadType === 'multiple' ? ' Multiple' : '', 'multiple', <CopyOutlined rotate={180} />)
    ];

    const gestureSelectOptions = gestureList.map(gesture => getAntdSelectItem(gesture, gesture));

    const loadGesture = (file) => {
        var filename = file.name;
        var gesture = filename.substr(0, filename.match(/\d/).index);
        if (uploadType === 'single')
            gesture = uploadGesture;
        const reader = new FileReader();
        reader.onload = (e) => {
            const newGestureData = {...gestureData};
            newGestureData.processed = false;
            if (!newGestureData.labels.includes(gesture)) {
                newGestureData.labels.push(gesture);
                newGestureData.files[gesture] = [];
            }
            var filenameIdx = 1;
            while (Object.keys(newGestureData.data).includes(filename)) {
                filename = file.name.split('.')[0] + '_' + filenameIdx + '.' + file.name.split('.')[1];
                filenameIdx++;
            }
            newGestureData.files[gesture].push(filename);
            newGestureData.data[filename] = e.target.result;
            setGestureData(newGestureData);
        }
        reader.readAsText(file);
        return false;
    }

    const deleteGesture = (toDelete, type) => {
        const newGestureData = {...gestureData};
        newGestureData.processed = false;
        if (type === 'sample') {
            delete newGestureData.data[toDelete];
            var gestureToDelete = '';
            for (var gesture of Object.keys(newGestureData.files)) {
                newGestureData.files[gesture] = newGestureData.files[gesture].filter(file => file !== toDelete);
                if (newGestureData.files[gesture].length === 0) {
                    gestureToDelete = gesture;
                }
            }
            if (gestureToDelete !== '') {
                newGestureData.labels = newGestureData.labels.filter(label => label !== gestureToDelete);
                delete newGestureData.files[gestureToDelete];
            }
        } else if (type === 'gesture') {
            for (var file of newGestureData.files[toDelete]) {
                delete newGestureData.data[file];
            }
            newGestureData.labels = newGestureData.labels.filter(label => label !== toDelete);
            delete newGestureData.files[toDelete];
        }
        setGestureData(newGestureData);
    }

    const processGesture = () => {
        setGeneratedData({});
        setIsFetchingClassificationResult(true);
        setSelectedClassification({ actualIdx: -1, predictedIdx: -1, predicted: {}, actual: {} });
        initiateProcessing();
    }

    const initiateProcessing = () => {
        const requestOptions = {
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gestureData)
        };
        fetch(serverAddress + '/classify', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setGestureData(prevState => {
                    return {...prevState, 'processed': true};
                });
                var newClassifierData = data;
                newClassifierData['gestureSequence'] = [];
                setClassifierData(newClassifierData);
                console.log(data);
                if (data.accuracy > 0.8)
                    message.success('Classification Accuracy: ' + (data.accuracy * 100).toFixed(2) + '%');
                else if (data.accuracy > 0.5)
                    message.warning('Classification Accuracy: ' + (data.accuracy * 100).toFixed(2) + '%');
                else
                    message.error('Classification Accuracy: ' + (data.accuracy * 100).toFixed(2) + '%');
                setIsFetchingClassificationResult(false);
            }, error => {
                console.log(error);
                setGestureData(prevState => {
                    return {...prevState, 'processed': false};
                });
                setIsFetchingClassificationResult(false);
            });
    }

    const generateTree = () => {
        const gestureDataTree = [];
        gestureData.labels.forEach(gesture => {
            gestureDataTree.push({
                'title': gesture + ' (' + gestureData.files[gesture].length + ')',
                'key': gesture,
                'children': gestureData.files[gesture].map(filename => {
                    return {
                        'title': filename,
                        'key': filename,
                    }
                })
            });
        });
        return gestureDataTree;
    }

    const fetchSampleGestureData = () => {
        const requestOptions = {
            method: 'POST',
            header: { 'Content-Type': 'application/zip' }
        };
        fetch(serverAddress + '/getsamplegesturedata', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.blob();
            }).then(blob => {
                saveAs(blob, "sample_gesture_data.zip");
            }, error => {
                console.log(error);
            });
    }

    return (
        <div className='scrollable-div' style={{ padding: '8px' }}>
            <Title level={2} style={{ marginBottom: '0px' }}>Manage Dataset</Title>

            {/* Upload Gesture Samples */}
            <Card size='small' style={{ marginTop: '12px', borderBottom: '0px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Upload Gesture Samples</Text>
                    <Text>
                        <Tooltip title='Download Sample Gestures'>
                            <DownloadOutlined onClick={() => { fetchSampleGestureData(); }} />
                        </Tooltip>
                    </Text>
                </div>
            </Card>
            <Card size='small'>
                <Space direction={'vertical'} size={8} style={{ display: 'flex' }}>
                    <Segmented 
                        block
                        options={uploadOptions} 
                        onChange={(value) => {
                            setUploadType(value);
                            setRandomGestureFileExample(generateRandomFileExample());
                        }}
                        defaultValue={uploadType}
                    />
                    {
                        uploadType === 'single' &&
                        <AutoComplete
                            showArrow
                            placeholder='Select Gesture'
                            options={gestureSelectOptions}
                            style={{ width: '100%' }}
                            value={uploadGesture}
                            onChange={(value) => setUploadGesture(value)}
                            onSelect={(value) => setUploadGesture(value)}
                            onSearch={(value) => setUploadGesture(value)}
                            filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                            notFoundContent={null}
                        />
                    }
                    {
                        uploadType === 'multiple' &&
                        <Text type={'secondary'}>
                            <InfoCircleOutlined /> <b>Note:</b> Files must be named as gesture label followed by sample number. <br/>
                            Example: <i>{randomGestureFileExample}</i>
                        </Text>
                    }
                    <Upload 
                        className='full-width-upload'
                        accept='.csv'
                        multiple={uploadType === 'multiple'}
                        showUploadList={false}
                        beforeUpload={(file) => loadGesture(file)}>
                        <Button
                            block
                            type={uploadGesture.length === 0 && uploadType === 'single' ? 'dashed' : 'default'}
                            ghost={uploadGesture.length === 0 && uploadType === 'single'}
                            icon={<UploadOutlined />}
                            disabled={(uploadGesture.length === 0 && uploadType === 'single') || isFetchingClassificationResult}>
                            {uploadType === 'single' ? 'Upload Sample' : 'Upload Samples'}
                        </Button>
                    </Upload>
                </Space>
            </Card>

            {/* Manage Uploaded Samples */}
            <Card size='small' style={{ marginTop: '12px', borderBottom: '0px' }}>
                <Text strong>Browse Uploaded Samples</Text>
            </Card>
            <Card className='scrollable-section full-height-card-body' size='small'>
                {
                    Object.keys(gestureData.data).length === 0 &&
                    <>
                        <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'center' }}>
                            <Empty description='No Samples Uploaded' image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </Space>
                    </>
                }
                {
                    Object.keys(gestureData.data).length > 0 &&
                    <>
                        <Space direction={'vertical'} size={8} style={{ display: 'flex' }}>
                            <Tree
                                showLine
                                selectable={false}
                                switcherIcon={<DownOutlined />}
                                treeData={generateTree()}
                                onRightClick={(e) => {
                                    if (isFetchingClassificationResult) return;
                                    var deleteType = 'sample';
                                    if (e.node.children !== undefined) {
                                        deleteType = 'gesture';
                                    }
                                    setGestureDeleteProps({
                                        ...gestureDeleteProps, 
                                        'visible': true, 
                                        'type': deleteType, 
                                        'toDelete': e.node.key, 
                                        'x': e.event.clientX, 
                                        'y': e.event.clientY
                                    });
                                    
                                }}
                                onClick={() => {
                                    if (isFetchingClassificationResult) return;
                                    message.destroy();
                                    message.warning('Press right click to remove the gesture sample.');
                                }}
                            />
                        </Space>
                    </>
                }
            </Card>
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: -1 }}>
                <Popconfirm
                    overlayInnerStyle={{ position: 'relative', 'top': gestureDeleteProps.y + 'px', 'left': gestureDeleteProps.x + 'px' }}
                    title={gestureDeleteProps.type === 'sample' ? <p>Remove gesture sample: <i>{gestureDeleteProps.toDelete}</i>?</p> : <p>Remove gesture: <i>{gestureDeleteProps.toDelete}</i>?</p>}
                    okText='Delete'
                    okType='danger'
                    cancelText='Cancel'
                    icon={<DeleteOutlined style={{'color': 'red'}} />}
                    visible={gestureDeleteProps.visible}
                    onCancel={() => setGestureDeleteProps({...gestureDeleteProps, 'visible': false})}
                    onConfirm={() => {
                        deleteGesture(gestureDeleteProps.toDelete, gestureDeleteProps.type);
                        setGestureDeleteProps({...gestureDeleteProps, 'visible': false});
                    }}
                />
            </div>

            {/* Start Processing */}
            <Button 
                style={{ marginTop: '12px', minHeight: '64px' }} 
                type={Object.keys(gestureData.data).length === 0 ? 'dashed' : 'primary'}
                ghost={Object.keys(gestureData.data).length === 0}
                block 
                icon={ gestureData.processed ? <CheckOutlined /> : isFetchingClassificationResult ? <SettingFilled spin /> : <SettingFilled />}
                disabled={Object.keys(gestureData.data).length === 0 || gestureData.processed || isFetchingClassificationResult}
                onClick={() => { processGesture(); }}>
                { gestureData.processed ? 'Samples Classified' : isFetchingClassificationResult ? 'Classifying...' : 'Classify Samples' }
            </Button>
        </div>
    );
}

export default DatasetPanel;