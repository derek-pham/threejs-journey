/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, meshBounds } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import Hamburger from './Hamburger';

function MouseEventsLesson() {
    const cubeRef = useRef()

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta * 0.2
    })

    const eventHandler = (event) => {
        // console.log(event)
        cubeRef.current.material.color.set(`hsl(${Math.random() * 360},100%,75%)`)
    }

    return (
        <>
            <Perf position='top-left' />
            <gridHelper args={[10, 10]} />j
            <OrbitControls />
            <ambientLight intensity={0.5}/>
            <pointLight position={[2, 5, -1]} color={'white'} intensity={30} />

            <Hamburger/>
            <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}
                onClick={eventHandler}
                onPointerEnter={() => { document.body.style.cursor = 'pointer' }}
                onPointerLeave={() => { document.body.style.cursor = 'default' }}
                raycast={meshBounds}
            >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <mesh position={[-2, 2, -2]} onClick={(event) => { event.stopPropagation() }}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={'mediumpurple'} />
            </mesh>
            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'yellowgreen'} roughness={1} />
            </mesh>
        </>
    );
}

export default MouseEventsLesson;
