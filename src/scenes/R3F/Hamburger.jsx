/* eslint-disable react/no-unknown-property */
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// useGLTF Hook doesn't require the DRACOLoader instance 
import { useGLTF, Clone } from '@react-three/drei';

// useGLTF.preload('/models/Hamburger.gltf')

export default function Hamburger() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const model = useLoader(GLTFLoader, '/models/Hamburger.gltf', loader => {
        loader.setDRACOLoader(dracoLoader);
    });

    const useGLTFModel = useGLTF('/models/Hamburger.gltf')

    const eventHandler = (event) => {
        console.log(event.object.name)
        event.stopPropagation() // Prevent repetitions of console.log()
    }

    return (
        <>
            <primitive object={model.scene} scale={0.45} position={[1, 1, 0]} onClick={eventHandler} />
        </>
    );
}