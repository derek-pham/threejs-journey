/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three'
import { Leva } from 'leva';
import DreiLesson from './DreiLesson';
import DebugLesson from './DebugLesson';
import EnvironmentStagingLesson from './EnvironmentStagingLesson';

function onCreated(state) {
    // state.gl.setClearColor('#483D8B',1)
    state.scene.background = new THREE.Color("pink")

}

function R3FApp() {

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh' }}>
            <Leva collapsed />
            <Canvas dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 75 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} shadows>
                <EnvironmentStagingLesson />
            </Canvas>
        </div>
    );
}

export default R3FApp;
