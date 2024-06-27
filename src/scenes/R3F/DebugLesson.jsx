/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useControls, button } from 'leva';
import { Perf } from 'r3f-perf';

function DebugLesson() {
    const cubeRef = useRef()
    const { position, color, perVisible } = useControls('sphere', {
        position:
        {
            value: { x: - 2, y: 0 },
            step: 0.01,
            joystick: 'invertY'
        },
        color: 'purple',
        visible: true,
        interval: {
            min: 0,
            max: 10,
            value: [4, 5]
        },
        clickMe: button(() => {
            console.log("Click!")
        }),
        choice: {
            options: ['1', 'a', 'c'],
            value: '1'
        },
        perVisible: true

    })
    // console.log(position)

    const { cubeScale } = useControls('cube', {
        cubeScale: {
            value: 1.2,
            step: 0.01,
            min: 0,
            max: 3
        }
    })

    useFrame((state, delta) => {

    })

    return (
        <>
            {perVisible && <Perf position='top-left' />}
            <gridHelper args={[10, 10]} />
            <OrbitControls />

            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            {/* <directionalLight position={[6, 5, -3]} intensity={3} /> */}
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}

            <mesh ref={cubeRef} rotation-x={0.4} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]} scale={cubeScale}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[position.x, position.y, 0]}>
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

export default DebugLesson;
