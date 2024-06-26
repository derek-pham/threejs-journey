/* eslint-disable react/no-unknown-property */
import { useFrame, extend, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import CustomObject from './CustomObject';

function FirstR3FLessonP2() {
    const cubeRef = useRef()
    const groupRef = useRef()
    const { camera, gl } = useThree()

    extend({ OrbitControls: OrbitControls })

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta
        // groupRef.current.rotation.y -= delta
        // state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 6
        // state.camera.position.z = Math.cos(state.clock.getElapsedTime() * 0.2) * 6
        // state.camera.lookAt(0, 0, 0)
    })

    return (
        <>
            <orbitControls args={[camera, gl.domElement]} />

            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            {/* <directionalLight position={[6, 5, -3]} intensity={3} /> */}
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}

            <mesh position={[2, 2, -2]} scale={0.1}>
                <torusKnotGeometry args={[8, 3, 128]} />
                <meshStandardMaterial color={'red'} metalness={0.4} />
            </mesh>
            <group ref={groupRef}>
                <mesh ref={cubeRef} rotation-x={0.4} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
                <mesh position={[-2, 2, -2]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={'mediumpurple'} />
                </mesh>
            </group>
            <CustomObject />
        </>
    );
}

export default FirstR3FLessonP2;
