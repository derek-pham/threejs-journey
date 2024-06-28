/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { Suspense } from 'react';
import FlightHelmet from './FlightHelmet';
import Placeholder from './Placeholder';
import Hamburger from './Hamburger';
import Hamburger2 from './Hamburger2';
import Fox from './Fox';

function LoadModelsLesson() {

    useFrame((state, delta) => {

    })

    return (
        <>
            <Perf position='top-left' />
            <gridHelper args={[10, 10]} />
            <OrbitControls />
            <ambientLight intensity={1.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            <directionalLight position={[0, 2, -3]} intensity={3} shadow-normalBias={0.04} />

            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'yellowgreen'} metalness={0.4} />
            </mesh>
            <Suspense fallback={<Placeholder position-y={1.5} />}>
                <Hamburger />
                <Hamburger2 scale={0.26} position-x={3.5} />
                <Fox />
            </Suspense>

        </>
    );
}

export default LoadModelsLesson;
