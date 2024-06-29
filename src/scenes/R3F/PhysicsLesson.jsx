/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState, useMemo } from 'react';
import { OrbitControls, SoftShadows } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { Physics, RigidBody, CuboidCollider, BallCollider, CylinderCollider, InstancedRigidBodies } from '@react-three/rapier';
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei';

function PhysicsLesson() {
    const cubeRef = useRef()
    const cubesRef = useRef()
    const twister = useRef()
    const [audio, setAudio] = useState(new Audio('/sounds/hit.mp3'))

    const cubeCount = 100
    const instances = useMemo(() => {
        const instances = []

        for (let i = 0; i < cubeCount; i++) {
            instances.push({
                key: 'instance_' + i,
                position:
                    [
                        (Math.random() - 0.5) * 8,
                        6 + i * 0.2,
                        (Math.random() - 0.5) * 8
                    ],
                rotation: [Math.random(), Math.random(), Math.random()],
            })
        }

        return instances
    }, [])

    const duck = useGLTF('/models/Duck/glTF/Duck.gltf')

    useEffect(() => {
        for (let i = 0; i < cubeCount; i++) {
            const matrix = new THREE.Matrix4()
            matrix.compose(
                new THREE.Vector3(i * 2, 0, 0),
                new THREE.Quaternion(),
                new THREE.Vector3(1, 1, 1)
            )
            cubesRef.current.setMatrixAt(i, matrix)
        }
    }, [])

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()
        const eulerRotation = new THREE.Euler(0, time * 2, 0)
        const quaternionRotation = new THREE.Quaternion()
        quaternionRotation.setFromEuler(eulerRotation)
        twister.current.setNextKinematicRotation(quaternionRotation)

        const angle = time * 0.5
        const x = Math.cos(angle) * 2
        const z = Math.sin(angle) * 2
        twister.current.setNextKinematicTranslation({ x: x, y: 0, z: z })

    })

    function cubeJump() {
        console.log(cubeRef.current)
        const mass = cubeRef.current.mass()
        console.log(mass)
        cubeRef.current.applyImpulse({ x: 0, y: 3, z: 0 })
        cubeRef.current.applyTorqueImpulse({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
        })
    }

    function wakeUp() {
        cubeRef.current.wakeUp()
    }

    function collisionEnter() {
        // console.log('Collision!')
        // audio.currentTime = 0
        // audio.volume = Math.random()
        // audio.play()
    }

    return (
        <>
            <Perf position='top-left' />
            {/* <gridHelper args={[10, 10]} position={[0, 0.2501, 0]} /> */}
            <OrbitControls />
            <color args={['wheat']} attach={'background'} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[6, 10, -3]} intensity={3} castShadow />
            <SoftShadows size={25} samples={10} focus={0} />
            <Physics debug={false}>
                {/* CUBE */}
                <RigidBody colliders={false} ref={cubeRef} restitution={0.2} friction={1}>
                    <mesh rotation-y={Math.PI * 0.25} position={[0, 2.5, -2]} castShadow onClick={cubeJump} onPointerEnter={wakeUp}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="orange" />
                        <CuboidCollider
                            args={[0.5, 0.5, 0.5]}
                            mass={2}
                        />
                    </mesh>
                </RigidBody>

                {/* TORUS */}
                {/* <RigidBody colliders={false} position={[0, 3.5, 0]} rotation-x={Math.PI * 0.5}>
                <BallCollider args={[1.5]} />
                <CuboidCollider args={[0.5, 2, 1]} position={[0,0,1]}  rotation={[Math.PI * 1.15,0,0]}/>
                <mesh castShadow>1
                        <torusGeometry args={[1, 0.5, 16, 32]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                </RigidBody> */}

                {/* SPHERE */}
                <RigidBody colliders='ball'>
                    <mesh position={[-2.5, 5.7, -2]} castShadow>
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshStandardMaterial color={'mediumpurple'} />
                    </mesh>
                </RigidBody>

                {/* FLOOR */}
                <RigidBody type='fixed' friction={1}>
                    <mesh rotation-x={-Math.PI * 0.5} position={[0, 0, 0]} receiveShadow>
                        <boxGeometry args={[10, 10, 0.5]} />
                        <meshStandardMaterial color={'yellowgreen'} />
                    </mesh>
                    <CuboidCollider args={[5, 2, 0.5]} position={[0, 2, 5.5]} />
                    <CuboidCollider args={[5, 2, 0.5]} position={[0, 2, -5.5]} />
                    <CuboidCollider args={[0.5, 2, 5]} position={[5.5, 2, 0]} />
                    <CuboidCollider args={[0.5, 2, 5]} position={[-5.5, 2, 0]} />
                </RigidBody>

                {/* SPINNING TUBE */}
                <RigidBody
                    friction={0}
                    type='kinematicPosition'
                    ref={twister}
                    onCollisionEnter={collisionEnter}
                // onCollisionExit={()=>{console.log('Exit')}}

                >
                    <mesh castShadow scale={[0.4, 0.4, 3]} position={[0, 0.5, 0]}>
                        <boxGeometry />
                        <meshStandardMaterial color={'red'} />
                    </mesh>
                </RigidBody>

                {/* Duck */}
                <RigidBody
                    colliders={false}
                    position={[2, 2, 0]}
                >
                    <CylinderCollider args={[0.69, 0.8]} />
                    <primitive object={duck.scene} position={[0, -0.8, 0]} />
                </RigidBody>

                <InstancedRigidBodies instances={instances} position={[0, 2, 0]}>
                    <instancedMesh castShadow ref={cubesRef} args={[null, null, cubeCount]} >
                        <boxGeometry />
                        <meshStandardMaterial color={'orangered'} />
                    </instancedMesh>
                </InstancedRigidBodies>
            </Physics>

        </>
    );
}

export default PhysicsLesson;
