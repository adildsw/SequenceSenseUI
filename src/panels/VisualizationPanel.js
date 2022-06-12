import { Button, Card, Image, Select, Space, Steps, Typography, Tooltip, Modal, Row, Col } from "antd";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, Label } from "recharts";

import { getAntdSelectItem } from "../utils/AntdUtils";

import banner from '../assets/sequence-sense-banner.svg';
import axisReference from '../assets/axis-ref.png';
import { useCallback, useEffect, useState } from "react";
import { AppstoreOutlined, InfoCircleFilled, LineChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;

const tickCount = 7;

const VisualizePanel = (props) => {

    const { gestureData, classifierData } = props;
    const chartData = classifierData.chartData.concat;

    const [gestureSelect, setGestureSelect] = useState('');
    const [visualizationSelect, setVisualizationSelect] = useState(0);

    const [axisReferenceModalVisibility, setAxisReferenceModalVisibility] = useState(false);

    const [isolatedChartDim, setIsolatedChartDim] = useState([0, 0]);
    const [mergedChartDim, setMergedChartDim] = useState([0, 0]);

    const isolatedChartAreaRef = useCallback(node => {
        if (node !== null) {
            setIsolatedChartDim([node.clientWidth, node.clientHeight]);
            window.onresize = () => {
                console.log(node.height);
                if (node) {
                    console.log(node.clientWidth, node.clientHeight);
                    setIsolatedChartDim([node.clientWidth, node.clientHeight]);
                }
            };
        }
    }, []);
    const mergedChartAreaRef = useCallback(node => {
        if (node !== null) {
            setMergedChartDim([node.offsetWidth, node.offsetHeight]);
            window.onresize = () => {
                if (node) {
                    setMergedChartDim([node.offsetWidth, node.offsetHeight]);
                }
            };
        }
    }, []);

    const [isChartIsolated, setIsChartIsolated] = useState(true)

    const gestureSelectOptions = gestureData.labels.map(gesture => getAntdSelectItem(gesture, gesture));

    const visToChartType = (visNumber) => {
        switch (visNumber) {
            case 0:
                return 'raw';
            case 1:
                return 'postprocess';
            case 2:
                return 'velocity';
            case 3:
                return 'distance';
            case 4:
                return 'orientation';
            default:
                return 'raw';
        }
    }

    const visualizationStatus = (chartType) => {
        if (chartType === visToChartType(visualizationSelect)) {
            return 'process';
        }
        return 'wait';
    }

    const generateYAxisLabel = (chartType) => {
        switch (chartType) {
            case 'raw':
                return 'Acceleration (m/ms²)';
            case 'postprocess':
                return 'Acceleration (m/ms²)';
            case 'velocity':
                return 'Velocity (m/ms)';
            case 'distance':
                return 'Distance (m)';
            case 'orientation':
                return 'Angle (degree)';
            default:
                return '';
        }
    }

    const getChartLines = (chartType) => {
        var dataKeys = ['x', 'y', 'z'];
        var labels = ['X', 'Y', 'Z'];
        if (chartType === 'orientation') {
            dataKeys = ['roll', 'pitch', 'yaw'];
            labels = ['Roll', 'Pitch', 'Yaw'];
        }
        return (
            <>
                <Line type="monotone" dataKey={dataKeys[0]} name={labels[0]} stroke="#FF4136" dot={false} />
                <Line type="monotone" dataKey={dataKeys[1]} name={labels[1]} stroke="#3D9970" dot={false} />
                <Line type="monotone" dataKey={dataKeys[2]} name={labels[2]} stroke="#0074D9" dot={false} />
            </>
        );
    }

    useEffect(() => {
        if (gestureData.processed) {
            setGestureSelect(gestureData.labels[0]);
        }
    }, [gestureData]);

    const getChartData = (gesture, type) => {
        var data = [];
        if (gestureData.processed && gesture !== '') {
            for (var idx = 0; idx < chartData[gesture]['timestamp'].length; idx++) {
                var entry = {
                    'timestamp': chartData[gesture]['timestamp'][idx]
                };
                for (var item of Object.keys(chartData[gesture][type])) {
                    entry[item] = chartData[gesture][type][item][idx];
                }
                data.push(entry);
            }
        }
        return data;
    }

    const generateChart = (chartType) => {
        var data = getChartData(gestureSelect, chartType);
        var width = isChartIsolated ? isolatedChartDim[0] * 0.95 : mergedChartDim[0] * 0.95;
        var height = isChartIsolated ? isolatedChartDim[1] * 0.95 : mergedChartDim[1] * 0.5 * 0.8;
        var lines = getChartLines(chartType);
        var minTickGap = isChartIsolated ? 100 : 50;

        if (!isChartIsolated) {
            if (chartType === 'raw' || chartType === 'postprocess') {
                width *= 0.5;
            } else {
                width *= 0.33;
                minTickGap = 40;
            }
        }
        
        return (
            <LineChart width={width} height={height} data={data} margin={{ top: 5, bottom: 5, right: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" minTickGap={minTickGap}>
                    <Label value="Timestamp (ms)" offset={-3} position='insideBottom' />
                </XAxis>
                <YAxis >
                    <Label value={generateYAxisLabel(chartType)} angle={-90} />
                </YAxis>
                <ChartTooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => 'Timestamp: ' + value + ' ms'}/>
                <Legend verticalAlign="top" />
                {lines}
            </LineChart>
        )
    }

    return (
        <div className='scrollable-div' style={{ padding: '8px' }}>
            { 
                (gestureData.labels.length === 0 || !gestureData.processed) && 
                <Space direction={'vertical'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image src={banner} preview={false} />
                </Space>
            }
            {
                (gestureData.labels.length !== 0 && gestureData.processed) &&
                <>
                    <Title level={2} style={{ marginBottom: '0px' }}>Visualize Processing</Title>
                    <Card size='small' style={{ marginTop: '16px' }}>
                        <Space direction={'horizontal'} size={8} style={{ display: 'flex', height: '100%', justifyContent: 'space-between' }}>
                            <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                <Text strong>Select Gesture</Text>
                                <Select
                                    style={{ width: 320 }}
                                    placeholder='Select Gesture'
                                    options={gestureSelectOptions}
                                    bordered={true}
                                    defaultValue={gestureSelectOptions[0].value}
                                    value={gestureSelect}
                                    onChange={(value) => { setGestureSelect(value); }}
                                />
                            </Space>
                            <Space direction={'horizontal'} size={8} style={{ display: 'flex' }}>
                                <Tooltip title={isChartIsolated ? "Merge Charts" : "Isolate Charts"} >
                                    <Button shape="circle" icon={isChartIsolated ? <AppstoreOutlined /> : <LineChartOutlined />} size={'middle'} onClick={() => { setIsChartIsolated(!isChartIsolated); }}/>
                                </Tooltip>
                                <Tooltip title="Axis Frame Reference" >
                                    <Button shape="circle" icon={<InfoCircleFilled />} size={'middle'} onClick={() => { setAxisReferenceModalVisibility(true); }} />
                                </Tooltip>
                            </Space>
                        </Space>
                        <Modal centered mask={true} maskClosable={true} onCancel={() => { setAxisReferenceModalVisibility(false); }} visible={axisReferenceModalVisibility} footer={null}>
                            <Image src={axisReference} preview={false} />
                        </Modal>
                    </Card>
                    { 
                        isChartIsolated && 
                        <>
                            <Card ref={isolatedChartAreaRef} size='small' style={{ display: 'flex', borderTop: '0px', borderBottom: '0px', flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
                                { generateChart(visToChartType(visualizationSelect)) }
                            </Card>
                            <Card size='small'>
                                <Steps current={visualizationSelect} size='small' direction='horizontal' type={'default'} onChange={(value) => { setVisualizationSelect(value); }}>
                                    <Step status={visualizationStatus('raw')} title="Acceleration" description="Raw Accelerometer Data" />
                                    <Step status={visualizationStatus('postprocess')} title="Post-Processing" description="Kalman-Filter and Rotation" />
                                    <Step status={visualizationStatus('velocity')} title="Velocity" description="Computed Velocity Data" />
                                    <Step status={visualizationStatus('distance')} title="Distance" description="Computed Relative Distance Data" />
                                    <Step status={visualizationStatus('orientation')} title="Orientation" description="Computed Relative Oritentation Data" />
                                </Steps>
                            </Card>
                        </>
                    }
                    {
                        !isChartIsolated &&
                        <>
                            <div ref={mergedChartAreaRef} style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
                                <Row>
                                    <Col span={12}>
                                        <Card size='small' title="Raw Accelerometer Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            { generateChart('raw') }
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size='small' title="Post-Processed with Kalman Filter and Rotation" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            { generateChart('postprocess') }
                                        </Card>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Velocity Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            { generateChart('velocity') }
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Relative Distance Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            { generateChart('distance') }
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card size='small' title="Computed Orientation Data" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            { generateChart('orientation') }
                                        </Card>
                                    </Col>
                                </Row>
                                </div>
                                </>
                    }
                </>
            }
        </div>
    )
}

export default VisualizePanel;