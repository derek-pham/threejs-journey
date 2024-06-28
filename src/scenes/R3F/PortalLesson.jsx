/* eslint-disable react/no-unknown-property */
import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, useGLTF, useTexture, Center, Sparkles, shaderMaterial } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import portalVertexShader from '../../shaders/portal/vertex.glsl'
import portalFragmentShader from '../../shaders/portal/fragment.glsl'
import * as THREE from 'three'

const PortalMaterial = shaderMaterial(
    {
        uTime: 0,
        uColorStart: new THREE.Color('#ffffff'),
        uColorEnd: new THREE.Color('#000000'),
    },
    portalVertexShader,
    portalFragmentShader
)
extend({ PortalMaterial })

function PortalLesson() {
    const cubeRef = useRef()
    const portalRef = useRef()

    useFrame((state, delta) => {
        portalRef.current.uTime += delta
    })

    const model = useGLTF('/portal/Portal5.glb')
    const { nodes } = useGLTF('/portal/Portal5.glb')
    console.log(nodes)


    const bakedTexture = useTexture('/portal/baked3-final.jpg')
    bakedTexture.flipY = false

    return (
        <>
            <Perf position='top-left' />
            {/* <gridHelper args={[10, 10]} /> */}
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <color args={['#030202']} attach={'background'} />
            <pointLight position={[0, 5, -1]} color={'white'} intensity={30} />

            {/* <mesh rotation-x={-Math.PI * 0.5}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={'yellowgreen'} />
            </mesh> */}
            {/* <primitive position={[0, 0.01, 0]} object={model.scene} scale={2.4} /> */}
            {/* <Center position={[0, 1.85, -1]} rotation-x={-Math.PI * 0.5} scale={2.4}> */}
            <Center scale={4}>
                <mesh
                    geometry={nodes.mergedObject.geometry}
                    rotation={nodes.mergedObject.rotation}
                    scale={nodes.mergedObject.scale}
                >
                    <meshBasicMaterial map={bakedTexture} />
                </mesh>

                {/* POLELIGHTA */}
                <mesh
                    geometry={nodes.poleLightA.geometry}
                    position={nodes.poleLightA.position}
                    rotation={nodes.poleLightA.rotation}
                    scale={nodes.poleLightA.scale}
                >
                    <meshBasicMaterial color={'#ffffe5'} />
                </mesh>

                {/* POLELIGHTB */}
                <mesh
                    geometry={nodes.poleLightB.geometry}
                    position={nodes.poleLightB.position}
                    rotation={nodes.poleLightB.rotation}
                    scale={nodes.poleLightB.scale}
                >
                    <meshBasicMaterial color={'#ffffe5'} />
                </mesh>

                {/* PORTAL */}
                <mesh
                    geometry={nodes.Portal.geometry}
                    position={nodes.Portal.position}
                    rotation={nodes.Portal.rotation}
                    scale={nodes.Portal.scale}
                >
                    <portalMaterial ref={portalRef}
                    />
                </mesh>
                <Sparkles
                    size={6}
                    scale={[4, 2, 4]}
                    position-y={1}
                    speed={0.4}
                />
            </Center>
        </>
    );
}

export default PortalLesson;