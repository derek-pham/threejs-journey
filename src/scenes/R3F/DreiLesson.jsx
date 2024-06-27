/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, TransformControls, PivotControls, Html, Text, Float, MeshReflectorMaterial } from '@react-three/drei';
import './DreiLesson.css'

function DreiLesson() {
    const cubeRef = useRef()
    const sphereRef = useRef()

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta * 0.25
    })

    return (
        <>
            <gridHelper args={[10, 10]} />
            <OrbitControls makeDefault />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />
            {/* <directionalLight position={[6, 5, -3]} intensity={3} /> */}
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}

            <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>

                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <TransformControls object={cubeRef} mode='translate' />
            <PivotControls anchor={[0, 0, 0]} depthTest={false} lineWidth={2} axisColors={['coral', 'magenta', 'cyan']} fixed={true} scale={50}>
                <mesh ref={sphereRef} position={[-2, 2, -2]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={'mediumpurple'} />
                    <Html position={[0, 1.01, 0]} wrapperClass='label' center distanceFactor={8} occlude={[sphereRef, cubeRef]}>HELLO</Html>
                </mesh>
            </PivotControls>
            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <MeshReflectorMaterial color={'greenyellow'} resolution={512} blur={[100, 100]} mixBlur={0.3} mirror={0.5} />
            </mesh>
            <Float speed={5} floatIntensity={10}>
                <Text fontSize={1} color={"red"} position={[0, 2, 0]} maxWidth={2} textAlign='center'>
                    Hello World!
                    <meshNormalMaterial color={'red'} metalness={0.4} />
                </Text>
            </Float>
        </>
    );
}

export default DreiLesson;
