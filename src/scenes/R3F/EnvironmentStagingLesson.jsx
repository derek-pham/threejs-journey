/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react';
import { OrbitControls, useHelper, BakeShadows, SoftShadows, AccumulativeShadows, RandomizedLight, ContactShadows, Sky, Environment, Lightformer, Stage } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { useControls } from 'leva';

function EnvironmentStagingLesson() {
    const cubeRef = useRef()
    const dirLightRef = useRef()

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta * 0.2
        // cubeRef.current.position.x = Math.sin(state.clock.elapsedTime)
    })

    useHelper(dirLightRef, THREE.DirectionalLightHelper, 1)
    // dirLightRef.current

    const { color, opacity, blur } = useControls('Shadow Controls', {
        color: '#000000',
        opacity: { value: 0.5, min: 0, max: 1 },
        blur: { value: 1, min: 0, max: 10 },
    })

    const { sunPosition } = useControls('Sky', {
        sunPosition: { value: [1, 2, 3] },
    })
    const { envMapIntensity, envMapHeight, envMapRadius, envMapScale } = useControls('envMapIntensity', {
        envMapIntensity: { value: 1, min: 1, max: 12 },
        envMapRadius: { value: 28, min: 0, max: 100 },
        envMapHeight: { value: 7, min: 10, max: 1000 },
        envMapScale: { value: 100, min: 10, max: 1000 },

    })

    const scene = useThree(state => state.scene)

    useEffect(() => {
        scene.environmentIntensity = envMapIntensity
    }, [envMapIntensity])


    return (
        <>
            {/* <Environment
                background
                files={[
                    '/environmentMaps/the_sky_is_on_fire_2k.hdr'
                ]}
                preset='sunset'
                resolution={32}
                ground={{
                    height: envMapHeight,
                    radius: envMapRadius,
                    scale: envMapScale
                }}
            >
                <color args={['black']} attach="background" />
                <mesh position={[0, 0, -2]} scale={10}>
                    <planeGeometry />
                    <meshBasicMaterial color={[3, 0, 0]} />
                </mesh>

                <Lightformer
                    position={[0, 0, -2]}
                    scale={10}
                    color={'red'}
                    intensity={4}
                    form={'ring'}
                />

            </Environment> */}

            <Perf position='top-left' />
            {/* <gridHelper args={[10, 10]} /> */}
            {/* <BakeShadows /> */}
            {/* <SoftShadows size={25} samples={10} focus={0} /> */}
            {/* <AccumulativeShadows
                position={[0, 0.01, 0]}
                color='#316d39'
                opacity={0.8}
                frames={Infinity}
                temporal
                blend={100}
            >
                <RandomizedLight
                    amount={8}
                    radius={1}
                    ambient={0.5}
                    intensity={3}
                    bias={0.001}
                    position={[1, 2, 3]}
                />
            </AccumulativeShadows> */}
            {/* <ContactShadows
                position={[0, 0, 0]}
                scale={10}
                resolution={512}
                far={5}
                color={color}
                opacity={opacity}
                blur={blur}
                frames={1}
            /> */}
            {/* <Sky sunPosition={sunPosition}/> */}

            <OrbitControls />
            <color args={['pink']} attach={'background'} />
            {/* <ambientLight intensity={1.5} /> */}
            {/* <directionalLight
                ref={dirLightRef}
                position={sunPosition}
                intensity={0.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-near={1}
                shadow-camera-far={15}
                shadow-camera-top={5}
                shadow-camera-right={5}
                shadow-camera-bottom={-5}
                shadow-camera-left={-5}
            /> */}


            {/* <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[0, 2, 0]} castShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <mesh position={[-2, 2, -1.5]} castShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={'mediumpurple'} />
            </mesh> */}
            {/* <mesh rotation-x={-Math.PI * 0.5} receiveShadow position={[0, -0.001, 0]}>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial color={'yellowgreen'} metalness={0.4} />
            </mesh> */}
            <Stage
                shadows={{ type: 'contact', opacity: 0.2, blur: 3 }}
                environment="sunset"
                preset="portrait"
                intensity={envMapIntensity}
            >
                <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[0, 3, 0]} castShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
                <mesh position={[-2, 2, -1.5]} castShadow>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={'mediumpurple'} />
                </mesh>
            </Stage>
        </>
    );
}

export default EnvironmentStagingLesson;
