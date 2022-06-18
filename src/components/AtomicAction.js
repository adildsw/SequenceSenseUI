import { Image } from 'antd';
import { useDrag } from 'react-dnd';

import '../App.css';

import midShape from '../assets/shapes/shape-mid.svg';

const AtomicAction = (props) => {
    const { type, selectedAtomicAction, setSelectedAtomicAction } = props;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'atomic-action',
        item: { type: type },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    const onAtomicActionClick = () => {
        setSelectedAtomicAction(prevState => {
            if (prevState === type) {
                return null;
            }
            return type;
        });
    }

    const getClassName = () => {
        var className = 'atomic-action';
        if (selectedAtomicAction === type) {
            className += ' selected';
        }
        return className;
    }

    return (
        <div ref={drag} direction='horizontal' className={getClassName()} onClick={() => onAtomicActionClick()} style={{ opacity: isDragging ? '0.4' : '1'}}>
            <Image id={'atomic-action-img'} src={midShape} height={'30px'} preview={false} style={{ filter: 'invert(10%)' }} />
            <span id={'atomic-action-type'} style={{ marginLeft: '16px'}}>{type}</span>
        </div>
    )
}

export default AtomicAction;