/* eslint-disable react/no-unknown-property */
import { RigidBody, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import useGame from "../../../stores/useGame";

function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const body = useRef()
    const { rapier, world } = useRapier()
    const start = useGame(state => state.start)
    const end = useGame(state => state.end)
    const restart = useGame(state => state.restart)
    const blockCount = useGame(state => state.blockCount)

    const [smoothCameraPosition] = useState(() => new THREE.Vector3(0, 10, 10))
    const [smoothCameraTarget] = useState(() => new THREE.Vector3())

    function jump() {
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = world.castRay(ray, 10, true)
        if (hit.timeOfImpact < 0.15) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
        }
    }

    function reset() {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }

    useEffect(() => {

        const unsubscribeReset = useGame.subscribe(
            (state) => {
                return state.phase
            },
            (value) => {
                if (value == 'ready') {
                    reset()
                }
                console.log("phase changed to", value)
            },
        )
        const unsubscribeJump = subscribeKeys(
            // Selector
            (state) => {
                return state.jump
            },
            // Executes on change
            (value) => {
                if (value) {
                    jump()
                }
            }
        )

        const unsubscribeAny = subscribeKeys(() => {
            start()
        })

        return () => {
            unsubscribeJump()
            unsubscribeAny()
            unsubscribeReset()
        }
    })

    useFrame((state, delta) => {
        // CONTROLS
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if (forward) {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }
        if (rightward) {
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }
        if (backward) {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }
        if (leftward) {
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        // CAMERA
        const bodyPosition = body.current.translation()
        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothCameraPosition)
        state.camera.lookAt(smoothCameraTarget)

        // PHASES
        if (bodyPosition.z < - (blockCount * 4 + 2)) {
            end()
        }
        if (bodyPosition.y < -4) {
            restart()
        }

    })

    return (
        <>
            <RigidBody
                ref={body}
                canSleep={false}
                colliders='ball'
                position={[0, 0.5, 0]}
                restitution={0.2}
                friction={1}
                linearDamping={0.5}
                angularDamping={0.5}
            >
                <mesh castShadow>
                    <icosahedronGeometry args={[0.3, 1]} />
                    <meshStandardMaterial flatShading color={"mediumpurple"} />
                </mesh>
            </RigidBody>
        </>
    );
}

export default Player;
