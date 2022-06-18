import a0Anim from '../assets/animations/a0.gif';
import a1Anim from '../assets/animations/a1.gif';
import a2Anim from '../assets/animations/a2.gif';
import a3Anim from '../assets/animations/a3.gif';
import a4Anim from '../assets/animations/a4.gif';
import a5Anim from '../assets/animations/a5.gif';
import a6Anim from '../assets/animations/a6.gif';
import a7Anim from '../assets/animations/a7.gif';
import a8Anim from '../assets/animations/a8.gif';
import a9Anim from '../assets/animations/a9.gif';
import a10Anim from '../assets/animations/a10.gif';
import a11Anim from '../assets/animations/a11.gif';
import a12Anim from '../assets/animations/a12.gif';
import a13Anim from '../assets/animations/a13.gif';
import a14Anim from '../assets/animations/a14.gif';
import aw1Anim from '../assets/animations/aw1.gif';
import aw2Anim from '../assets/animations/aw2.gif';
import aw3Anim from '../assets/animations/aw3.gif';
import aw4Anim from '../assets/animations/aw4.gif';

import a0AnimUp from '../assets/animations/upFPS/a0-5x-RIFE-RIFE3.9-25fps.gif';
import a1AnimUp from '../assets/animations/upFPS/a1-5x-RIFE-RIFE3.9-25fps.gif';
import a2AnimUp from '../assets/animations/upFPS/a2-5x-RIFE-RIFE3.9-25fps.gif';
import a3AnimUp from '../assets/animations/upFPS/a3-5x-RIFE-RIFE3.9-25fps.gif';
import a4AnimUp from '../assets/animations/upFPS/a4-5x-RIFE-RIFE3.9-25fps.gif';
import a5AnimUp from '../assets/animations/upFPS/a5-5x-RIFE-RIFE3.9-25fps.gif';
import a6AnimUp from '../assets/animations/upFPS/a6-5x-RIFE-RIFE3.9-25fps.gif';
import a7AnimUp from '../assets/animations/upFPS/a7-5x-RIFE-RIFE3.9-25fps.gif';
import a8AnimUp from '../assets/animations/upFPS/a8-5x-RIFE-RIFE3.9-25fps.gif';
import a9AnimUp from '../assets/animations/upFPS/a9-5x-RIFE-RIFE3.9-25fps.gif';
import a10AnimUp from '../assets/animations/upFPS/a10-5x-RIFE-RIFE3.9-25fps.gif';
import a11AnimUp from '../assets/animations/upFPS/a11-5x-RIFE-RIFE3.9-25fps.gif';
import a12AnimUp from '../assets/animations/upFPS/a12-5x-RIFE-RIFE3.9-25fps.gif';
import a13AnimUp from '../assets/animations/upFPS/a13-5x-RIFE-RIFE3.9-25fps.gif';
import a14AnimUp from '../assets/animations/upFPS/a14-5x-RIFE-RIFE3.9-25fps.gif';
import aw1AnimUp from '../assets/animations/upFPS/aw1-5x-RIFE-RIFE3.9-25fps.gif';
import aw2AnimUp from '../assets/animations/upFPS/aw2-5x-RIFE-RIFE3.9-25fps.gif';
import aw3AnimUp from '../assets/animations/upFPS/aw3-5x-RIFE-RIFE3.9-25fps.gif';
import aw4AnimUp from '../assets/animations/upFPS/aw4-5x-RIFE-RIFE3.9-25fps.gif';

export const getAnim = (type) => {
    switch (type) {
        case 'a0':
            return a0AnimUp;
        case 'a1':
            return a1AnimUp;
        case 'a2':
            return a2AnimUp;
        case 'a3':
            return a3AnimUp;
        case 'a4':
            return a4AnimUp;
        case 'a5':
            return a5AnimUp;
        case 'a6':
            return a6AnimUp;
        case 'a7':
            return a7AnimUp;
        case 'a8':
            return a8AnimUp;
        case 'a9':
            return a9AnimUp;
        case 'a10':
            return a10AnimUp;
        case 'a11':
            return a11AnimUp;
        case 'a12':
            return a12AnimUp;
        case 'a13':
            return a13AnimUp;
        case 'a14':
            return a14AnimUp;
        case 'aw1':
            return aw1AnimUp;
        case 'aw2':
            return aw2AnimUp;
        case 'aw3':
            return aw3AnimUp;
        case 'aw4':
            return aw4AnimUp;
        default:
            return a0AnimUp;
    }
}