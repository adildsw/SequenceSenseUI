import { Card, Typography } from "antd";

const { Title } = Typography;

const ConflictPanel = (props) => {
    return (
        <div className='scrollable-div' style={{ padding: '8px' }}>
            <Title level={2} style={{ marginBottom: '16px' }}>Analyze Gesture Conflicts</Title>
            <Card className='scrollable-section full-height-card-body'>

            </Card>
        </div>
    );
}

export default ConflictPanel;