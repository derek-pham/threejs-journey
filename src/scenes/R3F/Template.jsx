/* eslint-disable react/no-unknown-property */
import { useFrame} from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';

function Template() {
    const cubeRef = useRef()

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta * 0.2
    })

    return (
        <>
            <Perf position='top-left' />
            <gridHelper args={[10, 10]} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            {/* <directionalLight position={[6, 5, -3]} intensity={3} /> */}
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}


            <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <mesh position={[-2, 2, -2]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={'mediumpurple'} />
            </mesh>
            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'yellowgreen'} />
            </mesh>
        </>
    );
}

export default Template;
