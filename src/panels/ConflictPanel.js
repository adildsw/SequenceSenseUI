import { DownloadOutlined, InfoCircleOutlined, LoadingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Card, Col, Image, Row, Select, Space, Typography, Tooltip, Slider } from "antd";
import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis, Legend, ReferenceLine } from "recharts";
import AtomicAction from "../components/AtomicAction";
import SequenceDesigner from "../components/SequenceDesigner";
import { getAnim } from "../utils/AnimUtils";

import { getAntdSelectItem } from "../utils/AntdUtils";

const { Title, Text } = Typography;

const ConflictPanel = (props) => {

    const { 
        gestureData, 
        classifierData, 
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

    const [conflictChartDim, setConflictChartDim] = useState([0, 0]);
    const [previewDim, setPreviewDim] = useState([0, 0]);

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, [isComponentVisualizationVisible]);

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

    const getConflictChartData = (chartType, componentType) => {
        if (!Object.keys(classifierData).includes('avgConflictAnalysis')) return [];
        var chartData = classifierData.avgConflictAnalysis;
        if (conflictData.gestureSequence.length !== 0)
            chartData = conflictData.chartData.avgConflictAnalysis;
        var data = [];
        if (gestureData.processed) {
            for (var idx = 0; idx < chartData.confidence.length; idx++) {
                var entry = {
                    confidence: chartData.confidence[idx],
                    regular: chartData.regular[idx],
                    gesture: chartData.gesture[idx]
                };
                data.push(entry);
            }
        }
        console.log(data);
        return data;
    }

    const getConflictChartLines = () => {
        if (!Object.keys(classifierData).includes('avgConflictAnalysis') || !gestureData.processed) return [];
        var chartData = classifierData.avgConflictAnalysis;
        if (conflictData.gestureSequence.length !== 0)
            chartData = conflictData.chartData.avgConflictAnalysis;

        var lines = [];
        var lineKeys = [];
        var lineNames = [];
        var lineStrokes = ['#3D9970', '#0074D9', '#FFDC00', '#FF851B', '#FF4136'];
        for (var item of Object.keys(chartData)) {
            if (item !== 'confidence' && item !== 'message' && item !== 'status') lineKeys.push(item);
        }
        for (var key of lineKeys) {
            if (key === 'regular' && lineKeys.length === 2) lineNames.push('Regular Activities');
            else if (key === 'regular' && lineKeys.length > 2) lineNames.push('Regular Activities (Exact Match)');
            else if (key === 'gesture') lineNames.push('Gestures');
            else if (key.startsWith('hamming')) lineNames.push('Regular Activities (Hamming Distance: ' + key.substring(7) + ')');
        }

        for (var idx = 0; idx < lineKeys.length; idx++) {
            lines.push(
                <Line key={idx} isAnimationActive={false} type='monotone' dataKey={lineKeys[idx]} name={lineNames[idx]} stroke={lineStrokes[idx]} dot={false} />
            );
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
                <Legend verticalAlign="top" />
                {lines}
                <Line dataKey={'null'} stroke={'#001f3f'} strokeDasharray={3} strokeWidth={2} name={'Confidence Threshold'} />
                <ReferenceLine x={confidenceValue} stroke={'#001f3f'} strokeWidth={2} strokeDasharray={3} />
            </LineChart>
        );
    }

    // TODO: Implement
    const computeAccuracy = () => {
        return confidenceValue;
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
                    <Button><DownloadOutlined />Export Recognizer</Button>
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
                        <SequenceDesigner serverAddress={serverAddress} setIsFetchingConflictAnalysis={setIsFetchingConflictAnalysis} setConflictData={setConflictData} gestureSequence={gestureSequence} setGestureSequence={setGestureSequence} setSequenceDesignerResizeFunc={setSequenceDesignerResizeFunc} screenConfig={screenConfig} />
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
                    <Card title={'Conflict Analysis'} size='small' style={{ display: 'flex', flexDirection: 'column', height: '100%' }} bodyStyle={{ display: 'flex', flexGrow: '1', }}>
                        <div ref={conflictChartAreaRef} style={{ flexGrow: '1' }}>
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
                            <Card title={'Adjust Confidence Threshold'} size='small' style={{ flexGrow: '0', marginBottom: '12px' }} bodyStyle={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'justify' }}>
                                <Space direction={'vertical'} size={8} style={{ width: '100%', height: '100%', display: 'flex' }}>
                                    <Row>
                                        <Col span={16} style={{ margin: 'auto' }}>
                                            <Slider min={0} max={1} step={0.01} marks={{0: '0', 1: '1'}} tipFormatter={(value) => 'Confidence Threshold: ' + value} value={confidenceValue} onChange={(value) => {setConfidenceValue(value); }}/>
                                        </Col>
                                        <Col span={8}>
                                            <div style={{ width: '100%', flexGrow: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text strong>Accuracy</Text>
                                                <Title level={1} style={{ margin: '0' }}>{computeAccuracy()}</Title>
                                            </div>
                                        </Col>
                                    </Row>
                                </Space>
                            </Card>
                            <Card title={'Customize Conflict Analysis'} size='small' style={{ flexGrow: '1' }} bodyStyle={{ display: 'flex', height: '100%' }}>
                                Hello
                            </Card>
                        </>
                    }
                </Col>
            </Row>
        </div>
    );
}

export default ConflictPanel;