/* eslint-disable react/no-unknown-property */
import { useFrame, extend, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

function Template() {
    const cubeRef = useRef()
    const { camera, gl } = useThree()

    extend({ OrbitControls: OrbitControls })

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta
    })

    return (
        <>
            <gridHelper args={[10, 10]} />
            <orbitControls args={[camera, gl.domElement]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            {/* <directionalLight position={[6, 5, -3]} intensity={3} /> */}
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}


            <mesh ref={cubeRef} rotation-x={0.4} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <mesh position={[-2, 2, -2]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={'mediumpurple'} />
            </mesh>
            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'red'} metalness={0.4} />
            </mesh>
        </>
    );
}

export default Template;
