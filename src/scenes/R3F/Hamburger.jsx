/* eslint-disable react/no-unknown-property */
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// useGLTF Hook doesn't require the DRACOLoader instance 
import { useGLTF, Clone } from '@react-three/drei';

useGLTF.preload('/models/Hamburger.gltf')

export default function Hamburger() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const model = useLoader(GLTFLoader, '/models/Hamburger.gltf', loader => {
        loader.setDRACOLoader(dracoLoader);
    });

    const useGLTFModel = useGLTF('/models/Hamburger.gltf')

    return (
        <>
            <Clone object={model.scene} scale={0.25} position={[1,0,0]} />
            <Clone object={useGLTFModel.scene} scale={0.25} position={[0,1,0]} />
            <Clone object={useGLTFModel.scene} scale={0.25} position={[0,0,1]} />
        </>
    );
}

