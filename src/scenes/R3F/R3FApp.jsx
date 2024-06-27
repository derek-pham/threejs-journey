/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three'
import DreiLesson from './DreiLesson';

function R3FApp() {

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh' }}>
            <Canvas dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 75 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}>
                <DreiLesson />
            </Canvas>
        </div>
    );
}

export default R3FApp;
