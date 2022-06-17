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

export const getAnim = (type) => {
    switch (type) {
        case 'a0':
            return a0Anim;
        case 'a1':
            return a1Anim;
        case 'a2':
            return a2Anim;
        case 'a3':
            return a3Anim;
        case 'a4':
            return a4Anim;
        case 'a5':
            return a5Anim;
        case 'a6':
            return a6Anim;
        case 'a7':
            return a7Anim;
        case 'a8':
            return a8Anim;
        case 'a9':
            return a9Anim;
        case 'a10':
            return a10Anim;
        case 'a11':
            return a11Anim;
        case 'a12':
            return a12Anim;
        case 'a13':
            return a13Anim;
        case 'a14':
            return a14Anim;
        case 'aw1':
            return aw1Anim;
        case 'aw2':
            return aw2Anim;
        case 'aw3':
            return aw3Anim;
        case 'aw4':
            return aw4Anim;
        default:
            return a0Anim;
    }
}