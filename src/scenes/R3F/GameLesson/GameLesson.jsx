/* eslint-disable react/no-unknown-property */
import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import Level from './Level';
import { BlockAxe, BlockLimbo, BlockSpinner } from './Level';
import Lights from './Lights';
import { Physics } from '@react-three/rapier';
import Player from './Player';
import useGame from '../../../stores/useGame';

function GameLesson() {
    const blockCount = useGame(state => state.blockCount)
    const blockSeed = useGame(state => state.blockSeed)

    return (
        <>
            <Perf position='top-left' />
            <gridHelper args={[4, 4]} />
            <color args={['lightskyblue']} attach={"background"} />
            <OrbitControls />

            <Physics debug={false}>
                <Lights />
                <Level  count={blockCount} seed={blockSeed}/>
                <Player />
            </Physics>
        </>
    );
}

export default GameLesson;
