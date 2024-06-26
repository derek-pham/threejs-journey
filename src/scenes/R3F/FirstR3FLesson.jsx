/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FirstR3FLessonP2 from './FirstR3FLessonP2';
import * as THREE from 'three'

function FirstR3FLesson() {

    return (
        <div id="canvas-container" style={{ width: '100vw', height: '100vh' }}>
            <Canvas dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 75 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}>
                <gridHelper args={[10, 10]} />
                {/* <OrbitControls enableDamping={true} /> */}
                <FirstR3FLessonP2 />
            </Canvas>
        </div>
    );
}

export default FirstR3FLesson;
