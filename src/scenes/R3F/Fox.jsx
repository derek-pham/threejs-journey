/* eslint-disable react/no-unknown-property */
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect } from 'react';
import { useControls } from 'leva';

export default function Fox() {
    const useGLTFModel = useGLTF('/models/Fox/glTF/Fox.gltf')
    const animations = useAnimations(useGLTFModel.animations, useGLTFModel.scene)

    const { animationName } = useControls({
        animationName: { options: animations.names }
    })

    useEffect(() => {
        const action = animations.actions[animationName]
        action.reset().fadeIn(0.5).play()
        // animations.actions.Survey.crossFadeFrom(animations.actions.Run, 3)

        return () => {
            action.fadeOut(0.5)
        }

    }, [animationName])

    return (
        <>
            <primitive object={useGLTFModel.scene} scale={0.025} position={[-3, 0, 0]} />
        </>
    );
}

useGLTF.preload('/models/Fox/glTF/Fox.gltf')