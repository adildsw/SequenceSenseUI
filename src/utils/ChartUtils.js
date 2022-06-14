import { Line } from "recharts";

export const visToChartType = (visNumber) => {
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

export const generateYAxisLabel = (chartType) => {
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

export const getChartLines = (chartType, isAnimationActive) => {
    var dataKeys = ['x', 'y', 'z'];
    var labels = ['X', 'Y', 'Z'];
    if (chartType === 'orientation') {
        dataKeys = ['roll', 'pitch', 'yaw'];
        labels = ['Roll', 'Pitch', 'Yaw'];
    }
    return (
        <>
            <Line isAnimationActive={isAnimationActive} type="monotone" dataKey={dataKeys[0]} name={labels[0]} stroke="#FF4136" dot={false} />
            <Line isAnimationActive={isAnimationActive} type="monotone" dataKey={dataKeys[1]} name={labels[1]} stroke="#3D9970" dot={false} />
            <Line isAnimationActive={isAnimationActive} type="monotone" dataKey={dataKeys[2]} name={labels[2]} stroke="#0074D9" dot={false} />
        </>
    );
}