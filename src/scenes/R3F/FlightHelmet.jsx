/* eslint-disable react/no-unknown-property */
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


export default function FlightHelmet() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const model = useLoader(GLTFLoader, '/models/FlightHelmet/glTF/FlightHelmet.gltf', loader => {
        loader.setDRACOLoader(dracoLoader);
    });

    return (
        <>
            <primitive object={model.scene} scale={5} />
        </>
    );
}