import { Card, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { CartesianGrid, Label, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const { Title, Text } = Typography;

const ComponentVisualizationPanel = (props) => {

    const { gestureData, classifierData, selectedGesture, generatedData, setGeneratedData, setComponentChartResizeFunc } = props;
    
    const [componentChartDim, setComponentChartDim] = useState([0, 0]);

    const componentChartAreaRef = useCallback(node => {
        if (node !== null) {
            const resizeFunc = () => {
                if (node) {
                    setComponentChartDim([node.clientWidth, node.clientHeight]);
                }
            }
            setComponentChartDim([node.clientWidth, node.clientHeight]);
            setComponentChartResizeFunc(prevState => {
                window.removeEventListener('resize', prevState);
                window.addEventListener('resize', resizeFunc);
                return resizeFunc;
            });
        }
    }, [setComponentChartResizeFunc]);

    const getComponentChartData = (chartType, componentType) => {
        if (generatedData.hasOwnProperty('comp-' + selectedGesture + '-' + chartType + '-' + componentType)) {
            return generatedData['comp-' + selectedGesture + '-' + chartType + '-' + componentType];
        }

        if (!Object.keys(classifierData).includes('chartData')) return [];
        if (!Object.keys(classifierData.chartData).includes('overlap')) return [];
        const chartData = classifierData.chartData.overlap;

        var data = [];
        if (gestureData.processed && selectedGesture !== '') {
            for (var idx = 0; idx < chartData[selectedGesture]['sample'].length; idx++) {
                var entry = {
                    sample: chartData[selectedGesture]['sample'][idx]
                };
                for (var item of Object.keys(chartData[selectedGesture][chartType])) {
                    entry[item] = chartData[selectedGesture][chartType][item][componentType][idx];
                }
                data.push(entry);
            }
        }

        if (data.length !== 0) {
            setGeneratedData(prevState => {
                prevState['comp-' + selectedGesture + '-' + chartType + '-' + componentType] = data;
                return prevState;
            });
        }
        return data;
    }

    const getComponentChartLines = (chartType, componentType) => {
        if (!Object.keys(classifierData).includes('chartData')) return [];
        if (!Object.keys(classifierData.chartData).includes('overlap')) return [];
        const chartData = classifierData.chartData.overlap;

        var lines = [];
        var lineKeys = [];
        if (gestureData.processed && selectedGesture !== '') {
            for (var item of Object.keys(chartData[selectedGesture][chartType])) {
                lineKeys.push(item);
            }
        }

        var name = componentType.charAt(0).toUpperCase() + componentType.slice(1);
        var stroke = "#000";
        if (name === 'X' || name === 'Roll') stroke = "#FF4136";
        else if (name === 'Y' || name === 'Pitch') stroke = "#3D9970";
        else if (name === 'Z' || name === 'Yaw') stroke = "#0074D9";

        for (var idx = 0; idx < lineKeys.length; idx++) {
            lines.push(
                <Line key={idx} isAnimationActive={false} type='monotone' dataKey={lineKeys[idx]} name={name} stroke={stroke} dot={false} />
            );
        }
        return lines;
    }

    const generateComponentChart = (chartType, componentType) => {
        var data = getComponentChartData(chartType, componentType);
        var lines = getComponentChartLines(chartType, componentType);
        var width = componentChartDim[0] * 0.95;
        var height = componentChartDim[1] * 0.95;
        var minTickGap = 50;
        var domain = [-0.5, 0.5];
        if (chartType === 'orientation') {
            domain = [-110, 110];
        }

        var yAxisLabel = componentType.charAt(0).toUpperCase() + componentType.slice(1);
        if (chartType === 'distance') {
            yAxisLabel += '-Distance (m)';
        }
        else if (chartType === 'orientation') {
            yAxisLabel += '-Angle (deg)';
        }
        
        return (
            <LineChart width={width} height={height} data={data} margin={{ top: 5, bottom: 5, right: 5, left: -20 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='sample' minTickGap={minTickGap} tick={false}>
                    <Label value='Sample' />
                </XAxis>
                <YAxis minTickGap={minTickGap} tick={true} ticks={domain} type='number' domain={domain}>
                    <Label value={yAxisLabel} angle={-90} />
                </YAxis>
                <Tooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => 'Sample: ' + value}/>
                {lines}
            </LineChart>
        );
    }

    const getComponentChartMiscData = (chartType) => {
        if (generatedData.hasOwnProperty('compmisc-' + selectedGesture + '-' + chartType)) {
            return generatedData['compmisc-' + selectedGesture + '-' + chartType];
        }

        if (!Object.keys(classifierData).includes('chartData')) return [];
        if (!Object.keys(classifierData.chartData).includes('overlap')) return [];
        if (selectedGesture === '') return [];
        const chartData = classifierData.chartData.overlap;

        var keys = [];
        if (chartType === 'distance') {
            keys = ['x', 'y'];
        } else if (chartType === 'orientation') {
            keys = ['pitch', 'yaw'];
        }

        var subDataKeys = [];
        if (gestureData.processed && selectedGesture !== '') {
            for (var item of Object.keys(chartData[selectedGesture][chartType])) {
                subDataKeys.push(item);
            }
        }

        var data = [];
        for (var idx = 0; idx < chartData[selectedGesture]['sample'].length; idx++) {
            for (var subDataKey of subDataKeys) {
                var entry = {};
                for (var key of keys) {
                    entry[key] = chartData[selectedGesture][chartType][subDataKey][key][idx];
                }
                data.push(entry);
            }
        }

        if (data.length !== 0) {
            setGeneratedData(prevState => {
                prevState['compmisc-' + selectedGesture + '-' + chartType] = data;
                return prevState;
            });
        }
        return data;
    }

    const generateComponentMiscChart = (chartType) => {
        var width = componentChartDim[0] * 0.95;
        var height = componentChartDim[1] * 0.95;
        var minTickGap = 50;

        var xAxisDataKey = 'y';
        var yAxisDataKey = 'x';
        var xAxisLabel = 'Y-Distance (m)';
        var yAxisLabel = 'X-Distance (m)';
        if (chartType === 'orientation') {
            xAxisDataKey = 'pitch';
            yAxisDataKey = 'yaw';
            xAxisLabel = 'Pitch-Angle (deg)';
            yAxisLabel = 'Yaw-Angle (deg)';
        }
        var domain = [-0.5, 0.5];
        if (chartType === 'orientation') {
            domain = [-110, 110];
        }

        
        return (
            <LineChart width={width} height={height} data={getComponentChartMiscData(chartType)} margin={{ top: 5, bottom: 5, right: 5, left: -20 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey={xAxisDataKey} minTickGap={minTickGap} tick={true} ticks={domain} type='number' domain={domain}>
                    <Label value={xAxisLabel} />
                </XAxis>
                <YAxis minTickGap={minTickGap} tick={true} ticks={domain} type='number' domain={domain}>
                    <Label value={yAxisLabel} angle={-90} />
                </YAxis>
                <Tooltip formatter={(value) => Math.round(value * 10000) / 10000} labelFormatter={(value) => xAxisLabel + ': ' + value}/>
                <Line isAnimationActive={false} dataKey={yAxisDataKey} name={yAxisLabel} type='monotone' stroke='#7FDBFF' dot={false} />
            </LineChart>
        );
    }

    return (
        <div className='scrollable-div' style={{ padding: '8px' }}>
            { 
                gestureData.processed && 
                <>
                    <Title level={2} style={{ marginBottom: '12px' }}>Component Visualization</Title>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Card size='small'>
                            <Text strong>Relative Distance Measure</Text>
                        </Card>
                        <Card size={'small'} style={{ flexGrow: '1', marginBottom: '12px', borderTop: '0px' }} bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0px' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                                <div ref={componentChartAreaRef} style={{ display: 'flex', flexGrow: '1', margin: '3px', marginTop: '6px', marginLeft: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('distance', 'x') }
                                </div>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginTop: '6px', marginRight: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('distance', 'y') }
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginBottom: '6px', marginLeft: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('distance', 'z') }
                                </div>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginBottom: '6px', marginRight: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentMiscChart('distance') }
                                </div>
                            </div>
                        </Card>
                        <Card size='small'>
                            <Text strong>Relative Orientation Measure</Text>
                        </Card>
                        <Card size={'small'} style={{ flexGrow: '1', borderTop: '0px' }} bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0px' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginTop: '6px', marginLeft: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('orientation', 'roll') }
                                </div>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginTop: '6px', marginRight: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('orientation', 'pitch') }
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1' }}>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginBottom: '6px', marginLeft: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentChart('orientation', 'yaw') }
                                </div>
                                <div style={{ display: 'flex', flexGrow: '1', margin: '3px', marginBottom: '6px', marginRight: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                    { generateComponentMiscChart('orientation') }
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            }
        </div>
    )
}

export default ComponentVisualizationPanel;