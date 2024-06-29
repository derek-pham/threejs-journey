/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { EffectComposer, ToneMapping, Vignette, Glitch, Noise, Bloom, DepthOfField } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction, GlitchMode } from 'postprocessing';
import Drunk from './Drunk';
import { useControls } from 'leva';

function PostProcessingLesson() {
    const cubeRef = useRef()
    const drunkRef = useRef()

    const drunkProps = useControls({
        frequency: {value:100,min:1,max:100},
        amplitude: {value:0.01,min:0,max:1},
    })

    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta * 0.2
    })
    console.log(Glitch)
    return (
        <>
            <EffectComposer multisampling={8}>
                {/* Default ToneMapping is AgX */}
                {/* <ToneMapping mode={ToneMappingMode.ACES_FILMIC} /> */}
                {/* <Vignette offset={0.3} darkness={1} blendFunction={BlendFunction.NORMAL} /> */}
                {/* <Glitch delay={[1, 3]} duration={[1, 2]} strength={0.1} mode={GlitchMode.SPORADIC}/> */}
                {/* <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT}/> */}
                {/* <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1.27}/> */}
                {/* <DepthOfField focusDistance={0.125} focalLength={1} bokehScale={60}/> */}
                <Drunk
                    ref={drunkRef}
                    {...drunkProps}
                    blendFunction={BlendFunction.DARKEN}
                />

            </EffectComposer>
            <color args={['#ffffff']} attach={'background'} />

            <Perf position='top-left' />
            <gridHelper args={[10, 10]} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            {/* <pointLight position={[0, 2, -1]} color={'white'} intensity={30} /> */}
            <directionalLight position={[6, 5, -3]} intensity={3} />
            {/* <hemisphereLight color={"red"} intensity={2} groundColor={"blue"}/> */}

            {/* <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshBasicMaterial color={[2,1,2]} toneMapped={false} />
            </mesh> */}
            <mesh ref={cubeRef} rotation-y={Math.PI * 0.25} position={[-2.5, 1, 2]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color={'orange'} />
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

export default PostProcessingLesson;
