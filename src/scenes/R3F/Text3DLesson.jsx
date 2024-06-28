/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { Text3D, Center, useMatcapTexture } from '@react-three/drei';
import * as THREE from 'three'

const torusGeometry = new THREE.TorusGeometry()
const matcapMaterial = new THREE.MeshMatcapMaterial()

function Text3DLesson() {
    const cubeRef = useRef()
    const groupRef = useRef()
    const donuts = useRef([])

    const [torusGeometry, setTorusGeometry] = useState()
    // const [matcapTextureState, setMatcapTextureState] = useState()

    useFrame((state, delta) => {
        // for (const donut of groupRef.current.children) {
        //     donut.rotation.x += delta
        // }

        for (const donut of donuts.current) {
            donut.rotation.x += delta
        }


    })

    const [matcapTexture] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256)

    useEffect(() => {
        matcapMaterial.matcap = matcapTexture
        // matcapMaterial.colorSpace = THREE.SRGBColorSpace
        // matcapMaterial.needsUpdate = true
    }, [])

    return (
        <>
            <Perf position='top-left' />
            <gridHelper args={[10, 10, 'DeepPink', 'DarkSlateGrey']} ref={cubeRef} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />

            <torusGeometry ref={setTorusGeometry} />
            {/* <meshMatcapMaterial matcap={matcapMaterial} /> */}

            <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'yellowgreen'} />
            </mesh>
            <Center position={[0, 1, 0]}>
                <Text3D
                    font={"/fonts/helvetiker_regular.typeface.json"}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    Hello World!
                    <meshMatcapMaterial matcap={matcapTexture} />
                </Text3D>
            </Center>
            {
                [...Array(100)].map((_, index) => {
                    return (
                        <mesh
                            ref={(element) => {
                                donuts.current[index] = element
                            }}
                            key={index}
                            geometry={torusGeometry}
                            material={matcapMaterial}
                            position={[(Math.random() - 0.5) * 9, (Math.random()) * 2, (Math.random() - 0.5) * 9]}
                            rotation={[(Math.random() - 0.5) * Math.PI, (Math.random() - 0.5) * Math.PI, (Math.random() - 0.5) * Math.PI]}
                            scale={0.2}
                        />
                    );
                })
            }
        </>
    );
}

export default Text3DLesson;
