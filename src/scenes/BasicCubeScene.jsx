import { useRef } from 'react';
import * as THREE from 'three'

const BasicCubeScene = () => {
    const canvasRef = useRef();

    // Canvas
    const canvas = canvasRef.current

    // Scene
    const scene = new THREE.Scene();

    // Geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    // Material
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    //Mesh Object
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Camera
    const sizes = { width: 800, height: 600 }
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
    camera.position.set(0, 0, 2)
    scene.add(camera)

    // Renderer 
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height) // Set size of renderer
    renderer.render(scene, camera) // Initiate rendering the scene

    return (
        <>
            <canvas ref={canvasRef} />
        </>
    )
}

export default BasicCubeScene