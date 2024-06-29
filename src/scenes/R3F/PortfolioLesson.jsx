/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, useGLTF, Environment, Float, PresentationControls, ContactShadows, Html, Text } from '@react-three/drei';
import { Perf } from 'r3f-perf';

function PortfolioLesson() {
    const cubeRef = useRef()

    useFrame((state, delta) => {
    })

    const computer = useGLTF('https://threejs-journey.com/resources/models/macbook_model.gltf')

    return (
        <>
            <Perf position='bottom-right' />
            {/* <OrbitControls makeDefault /> */}
            <color args={['#242424']} attach={'background'} />
            <Environment preset='city' />
            <PresentationControls
                global rotation={[0.13, 0.1, 0]}
                polar={[-0.4, 0.2]}
                azimuth={[-1, 0.75]}
                config={{ mass: 2, tension: 200 }}
            // snap={{ mass: 2, tension: 200 }}
            >
                <Float rotationIntensity={0.4}>
                    <rectAreaLight
                        width={2.5}
                        height={1.65}
                        intensity={25}
                        color={'white'}
                        rotation={[-0.1, Math.PI, 0]}
                        position={[0, 0.33, -1.4]}
                    />
                    <primitive object={computer.scene} position-y={-1.2} />
                    <Html
                        transform wrapperClass='htmlScreen'
                        distanceFactor={1.17}
                        position={[0, 0.33, -1.4]}
                        rotation-x={-0.256}
                    >
                        <iframe src="https://derek-pham.github.io/derek-pham/">
                        </iframe>
                    </Html>
                    <Text
                        font='/fonts/bangers-v20-latin-regular.woff'
                        fontSize={1}
                        position={[2, 0.75, 0.75]}
                        rotation-y={-1.25}
                        maxWidth={2}
                        textAlign='center'
                    >DEREK PHAM</Text>
                </Float>
            </PresentationControls>
            <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} />
        </>
    );
}

export default PortfolioLesson;
