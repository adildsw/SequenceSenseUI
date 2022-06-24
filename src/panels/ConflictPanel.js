import { DownloadOutlined, InfoCircleOutlined, LoadingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Card, Col, Image, Row, Select, Space, Typography, Slider, List, Divider, Switch } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis, Legend, ReferenceLine, Tooltip } from 'recharts';
import randomColor from 'randomcolor';

import AtomicAction from '../components/AtomicAction';
import SequenceDesigner from '../components/SequenceDesigner';
import { getAnim } from '../utils/AnimUtils';
import { getAntdSelectItem } from '../utils/AntdUtils';

const { Title, Text } = Typography;

const ConflictPanel = (props) => {

    const { 
        gestureData, 
        classifierData, 
        setClassifierData,
        selectedGesture, 
        setSelectedGesture, 
        gestureSequence, 
        setGestureSequence, 
        conflictData, 
        setConflictData, 
        isFetchingConflictAnalysis, 
        setIsFetchingConflictAnalysis, 
        screenConfig, 
        setConflictChartResizeFunc, 
        setSequenceDesignerResizeFunc, 
        setPreviewResizeFunc, 
        isComponentVisualizationVisible, 
        setIsComponentVisualizationVisible, 
        confidenceValue, 
        setConfidenceValue, 
        serverAddress
    } = props;

    const [selectedAtomicAction, setSelectedAtomicAction] = useState(null);
    const [aggregateVisualization, setAggregateVisualization] = useState(true);
    const [specificGestureVisualization, setSpecificGestureVisualization] = useState({});
    const [specificGestureVisualizationColors, setSpecificGestureVisualizationColors] = useState({});

    const [conflictChartDim, setConflictChartDim] = useState([0, 0]);
    const [previewDim, setPreviewDim] = useState([0, 0]);

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, [isComponentVisualizationVisible]);

    useEffect(() => {
        var gestureVisualization = {};
        var gestureVisualizationColors = {};
        for (var gesture of gestureData.labels) {
            gestureVisualization[gesture] = true;
            gestureVisualizationColors[gesture] = randomColor({ luminosity: 'dark' });
        }
        gestureVisualization['custom_seq'] = true;
        gestureVisualizationColors['custom_seq'] = randomColor({ luminosity: 'dark' });
        setSpecificGestureVisualization(gestureVisualization);
        setSpecificGestureVisualizationColors(gestureVisualizationColors);
    }, [gestureData]);

    const conflictChartAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setConflictChartDim([node.clientWidth, node.clientHeight]);
                }
            }
            setConflictChartDim([node.clientWidth, node.clientHeight]);
            setConflictChartResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setConflictChartResizeFunc]);
    
    const previewAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setPreviewDim([node.clientWidth, node.clientHeight]);
                }
            }
            setPreviewDim([node.clientWidth, node.clientHeight]);
            setPreviewResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setPreviewResizeFunc]);

    useEffect(() => {
        if (gestureData.processed && selectedGesture === '') {
            setSelectedGesture(gestureData.labels[0]);
            setGestureSequence(classifierData.atomicSeq[gestureData.labels[0]]);
        }
    }, [gestureData, selectedGesture, setSelectedGesture, setGestureSequence, classifierData]);

    const gestureSelectOptions = gestureData.labels.map(gesture => getAntdSelectItem(gesture, gesture));

    const initiateExport = () => {
        const requestOptions = {
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'confidence': confidenceValue })
        };
        fetch(serverAddress + '/generatereport', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            }, error => {
                console.log(error);
            });
    }

    const generateAtomicActionSelectors = () => {
        var atomicActions = [];
        var atomicActionNames = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'aw1', 'aw2', 'aw3', 'aw4'];
        for (var i = 0; i < atomicActionNames.length; i++) {
            atomicActions.push(
                <AtomicAction key={i} type={atomicActionNames[i]} selectedAtomicAction={selectedAtomicAction} setSelectedAtomicAction={setSelectedAtomicAction} gestureSequence={gestureSequence} />
            );
        }
        return atomicActions;
    }

    const getConflictChartData = () => {
        if (!Object.keys(classifierData).includes('avgConflictAnalysis')) return [];
        if (!Object.keys(classifierData).includes('conflictAnalysis')) return [];

        var data = [];
        var chartData = classifierData.conflictAnalysis;
        var avgChartData = classifierData.avgConflictAnalysis;
        for (var idx = 0; idx < avgChartData.confidence.length; idx++) {
            var entry = {
                confidence: avgChartData.confidence[idx],
                avgRegular: avgChartData.regular[idx],
                avgGesture: avgChartData.gesture[idx],
                specificGestureAvg: 0,
                specificRegularAvg: 0
            };
            var count = 0;
            for (var gesture of Object.keys(chartData)) {
                entry[gesture + 'Regular'] = chartData[gesture].regular[idx];
                entry[gesture + 'Gesture'] = chartData[gesture].gesture[idx];
                if (specificGestureVisualization[gesture]) {
                    entry['specificRegularAvg'] += chartData[gesture].regular[idx];
                    entry['specificGestureAvg'] += chartData[gesture].gesture[idx];
                    count++;
                }
            }
            if (count > 0) {
                entry['specificRegularAvg'] /= count;
                entry['specificGestureAvg'] /= count;
            }
            data.push(entry);
        }
        return data;
    }

    const getConflictChartLines = () => {
        if (!Object.keys(classifierData).includes('avgConflictAnalysis')) return [];
        if (!Object.keys(classifierData).includes('conflictAnalysis')) return [];

        var lines = [];
        if (aggregateVisualization) {
            lines.push(
                <Legend 
                    key={'average'}
                    verticalAlign='top' 
                    payload={[
                        { color:'#3D9970', value: 'Gestures', type: 'plainline', payload: { strokeDasharray: '0 0' }, id: 'avgRegular' }, 
                        { color:'#0074D9', value: 'Regular Activities', type: 'plainline', payload: { strokeDasharray: '3 3' }, id: 'avgRegular' }, 
                        { color:'#FF4136', value: 'Confidence Threshold', type: 'plainline', payload: { strokeDasharray: '3 3' }, id: 'avgRegular' }
                    ]} 
                />,
                <Line key={'specificGestureAvg'} isAnimationActive={false} type='monotone' dataKey={'specificGestureAvg'} name={'Gestures'} stroke={'#3D9970'} dot={false} />,
                <Line key={'specificRegularAvg'} isAnimationActive={false} type='monotone' dataKey={'specificRegularAvg'} name={'Regular Activities'} stroke={'#0074D9'} strokeDasharray={3} dot={false} />
            );
        }
        else {
            lines.push(
                <Legend 
                    key={'average'}
                    verticalAlign='top' 
                    payload={[
                        { color:'#000', value: 'Gestures', type: 'plainline', payload: { strokeDasharray: '0 0' }, id: 'avgRegular' }, 
                        { color:'#000', value: 'Regular Activities', type: 'plainline', payload: { strokeDasharray: '3 3' }, id: 'avgRegular' }, 
                        { color:'#FF4136', value: 'Confidence Threshold', type: 'plainline', payload: { strokeDasharray: '3 3' }, id: 'avgRegular' }
                    ]} 
                />
            );
            for (var gesture of Object.keys(specificGestureVisualization)) {
                if (specificGestureVisualization[gesture]) {
                    console.log(gesture);
                    lines.push(
                        <Line key={gesture + 'Gesture'} isAnimationActive={false} type='monotone' dataKey={gesture + 'Gesture'} stroke={specificGestureVisualizationColors[gesture]} name={gesture + ' (Gesture)'} dot={false} />,
                        <Line key={gesture + 'Regular'} isAnimationActive={false} type='monotone' dataKey={gesture + 'Regular'} stroke={specificGestureVisualizationColors[gesture]} name={gesture + ' (Regular Activities)'} strokeDasharray={3} dot={false} />
                    );
                }
            }
            console.log(lines);
        }
        return lines;
    }

    const generateConflictChart = () => {
        var data = getConflictChartData();
        var lines = getConflictChartLines();
        var width = conflictChartDim[0] * 0.95;
        var height = conflictChartDim[1] * 0.95;
        var minTickGap = 50;
        
        return (
            <LineChart width={width} height={height} data={data} margin={{ top: 5, bottom: 5, right: 0, left: 0 }} style={{ maxWidth: width/2 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='confidence' minTickGap={minTickGap} tick={true} ticks={[0, 0.25, 0.5, 0.75, 1]} type='number' domain={[0, 1]} tickFormatter={(value) => Math.round(value * 100) / 100}>
                    <Label value='Confidence' position={'insideBottom'} offset={-2} />
                </XAxis>
                <YAxis tick={true} ticks={[0, 1]}>
                    <Label value={'Detection Rate'} angle={-90} offset={-5} style={{ marginRight: '100px'}} />
                </YAxis>
                <Tooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => 'Confidence: ' + Math.round(value * 10000) / 10000}/>
                {lines}
                <ReferenceLine x={confidenceValue} stroke={'#FF4136'} strokeWidth={2} strokeDasharray={3} />
            </LineChart>
        );
    }

    const generateConflictConfigurationList = () => {
        var list = [];
        gestureData.labels.forEach(item => {
            list.push(
                <List.Item key={item} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>{item}</Text>
                    <Switch checked={specificGestureVisualization[item]} onChange={(value) => { setSpecificGestureVisualization({...specificGestureVisualization, [item]: value}); }} />
                </List.Item>
            );
        });
        if (classifierData.gestureSequence.length > 0) {
            list.push(
                <List.Item key={'Custom Sequence'} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>{'Custom Sequence [' + classifierData.gestureSequence.join('-') + ']'}</Text>
                    <Switch checked={specificGestureVisualization['custom_seq']} onChange={(value) => { setSpecificGestureVisualization({...specificGestureVisualization, 'custom_seq': value}); }} />
                </List.Item>
            );
        }
        return list;
    }

    const computeAccuracy = () => {
        var data = getConflictChartData();
        console.log(data);
        var min = 999;
        for (var idx = 0; idx < data.length; idx++) {
            if (Math.abs(confidenceValue - data[idx].confidence) < min) {
                min = Math.abs(confidenceValue - data[idx].confidence);
                var gestureVal = data[idx].specificGestureAvg;
                var regularVal = data[idx].specificRegularAvg;
            }
        }
        return (Math.round((gestureVal - regularVal) * 10000) / 100).toFixed(2) + '%';
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px' }}>
            <Space direction='horizontal' style={{ display: 'flex', flexDirection: 'row', marginBottom: '12px', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0 }}>Analyze Gesture Conflicts</Title>
                { 
                    isComponentVisualizationVisible ? 
                    <MenuUnfoldOutlined style={{ fontSize: '24px' }} onClick={() => { setIsComponentVisualizationVisible(false); }} /> : 
                    <MenuFoldOutlined style={{ fontSize: '24px' }} onClick={() => { setIsComponentVisualizationVisible(true); }} />
                }
            </Space>
            <Card size='small' style={{ display: 'flex', borderBottom: '0px' }} bodyStyle={{ width: '100%' }}>
                <Space direction={'horizontal'} size={8} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space direction={'horizontal'} size={8} style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                        <Text strong>Select Gesture</Text>
                        <Select
                            style={{ width: 320 }}
                            placeholder='Select Gesture'
                            options={gestureSelectOptions}
                            bordered={true}
                            defaultValue={gestureSelectOptions[0].value}
                            value={selectedGesture}
                            onChange={(value) => { setSelectedGesture(value); setGestureSequence(classifierData.atomicSeq[value]); console.log(classifierData.atomicSeq); }}
                        />
                    </Space>
                    <Button onClick={() => { initiateExport(); }}><DownloadOutlined />Export Recognizer</Button>
                </Space>
            </Card>
            <Card size='small' style={{ marginBottom: '12px' }} bodyStyle={{ display: 'flex', width: '100%' }}>
                <Row style={{ width: '100%' }}>
                    <Col span={4} style={{ paddingRight: '6px', height: '35vh' }}>
                        <Card title={'Atomic Actions'} size='small' style={{ display: 'flex', flexDirection: 'column', height: '35vh' }} bodyStyle={{ overflowY: 'auto' }}>
                            <Space direction='vertical' size={8} style={{ width: '100%' }}>
                                { generateAtomicActionSelectors() }
                            </Space>
                        </Card>
                    </Col>
                    <Col span={14} style={{ display: 'flex', flexDirection: 'column', height: '35vh', paddingRight: '6px', paddingLeft: '6px' }}>
                        <SequenceDesigner classifierData={classifierData} setClassifierData={setClassifierData} serverAddress={serverAddress} setIsFetchingConflictAnalysis={setIsFetchingConflictAnalysis} setConflictData={setConflictData} gestureSequence={gestureSequence} setGestureSequence={setGestureSequence} setSequenceDesignerResizeFunc={setSequenceDesignerResizeFunc} screenConfig={screenConfig} />
                    </Col>
                    <Col span={6} style={{ display: 'flex', flexDirection: 'column', height: '35vh', paddingLeft: '6px' }}>
                        <Card title={'Sequence Preview'} size='small' style={{ flexGrow: '1', display: 'flex', flexDirection: 'column', height: '100%' }} bodyStyle={{ display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                            <div ref={previewAreaRef} style={{ height: '100%', display: 'flex', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                { 
                                    selectedAtomicAction === null ?
                                    <Text type={'secondary'}>
                                        <InfoCircleOutlined /> <b>Tip:</b> Select atomic action or click on <i>Preview Sequence</i> to preview the gesture.
                                    </Text> :
                                    <Image src={getAnim(selectedAtomicAction)} preview={false} style={{ height: previewDim[1] * 0.9 + 'px' }} />
                                }
                            </div>

                        </Card>
                    </Col>
                </Row>
            </Card>
            <Row style={{ flexGrow: '1' }}>
                <Col span={14} style={{ height: '100%', paddingRight: '6px' }}>
                    <Card title={'Conflict Analysis'} size='small' style={{ display: 'flex', flexDirection: 'column', height: '100%' }} bodyStyle={{ display: 'flex', flexGrow: '1', padding: 0}}>
                        <div ref={conflictChartAreaRef} style={{ flexGrow: '1', paddingTop: '8px' }}>
                            { generateConflictChart() }
                        </div>
                    </Card>
                </Col>
                <Col span={10} style={{ height: '100%', paddingLeft: '6px', display: 'flex', flexDirection: 'column' }}>
                    {
                        isFetchingConflictAnalysis ? // Replace with loading variable
                        <Card size='small' style={{ height: '100%' }} bodyStyle={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                            <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <LoadingOutlined style={{ fontSize: 24 }} spin />
                                <Text type={'secondary'}>Fetching conflict analysis...</Text>
                            </Space>
                        </Card> :
                        <>
                            <Card title={'Configure Conflict Analysis Visualization'} size='small' style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }} bodyStyle={{ display: 'flex', flexDirection: 'column', height: conflictChartDim[1] + 'px' }}>
                                <Space direction={'vertical'} size={8} style={{ width: '100%', display: 'flex' }}>
                                    <Row>
                                        <Col span={16} style={{ margin: 'auto' }}>
                                            <Slider min={0} max={1} step={0.05} marks={{0: '0', 1: '1'}} tipFormatter={(value) => 'Confidence Threshold: ' + value} value={confidenceValue} onChange={(value) => {setConfidenceValue(value); }}/>
                                        </Col>
                                        <Col span={8}>
                                            <div style={{ width: '100%', flexGrow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text strong>Accuracy</Text>
                                                <Title level={3} style={{ margin: '0' }}>{computeAccuracy()}</Title>
                                            </div>
                                        </Col>
                                    </Row>
                                </Space>
                                
                                <Divider style={{ margin: '0', marginTop: '8px' }} />
                                <List bordered>
                                    <List.Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', background: '#f0f0f0' }}>
                                        <Text strong>Aggregate Results</Text>
                                        <Switch defaultChecked={aggregateVisualization} checked={aggregateVisualization} onChange={(value) => { setAggregateVisualization(value); }} />
                                    </List.Item>
                                </List>
                                <List bordered style={{ borderTop: 0, overflowY: 'auto', flexGrow: '1' }}>
                                    {generateConflictConfigurationList()}
                                </List>
                            </Card>
                        </>
                    }
                </Col>
            </Row>
        </div>
    );
}

export default ConflictPanel;