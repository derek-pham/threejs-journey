/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three'
import { Leva } from 'leva';
import DreiLesson from './DreiLesson';
import DebugLesson from './DebugLesson';
import EnvironmentStagingLesson from './EnvironmentStagingLesson';
import LoadModelsLesson from './LoadModelsLesson';
import Text3DLesson from './Text3DLesson';

function R3FApp() {

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh' }}>
            <Leva collapsed />
            <Canvas dpr={[1, 2]} camera={{ position: [0, 6, 8], fov: 75 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} shadows>
                <Text3DLesson />
            </Canvas>
        </div>
    );
}

export default R3FApp;
