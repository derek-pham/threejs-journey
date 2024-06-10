import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const GeometriesLesson = () => {
    const canvasRef = useRef();

    useEffect(() => {
        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BufferGeometry()

        const count = 50;
        const positionsArray = new Float32Array(count * 3 * 3);
        for (let i = 0; i < count * 3 * 3; i++) {
            positionsArray[i] = Math.random() - 0.5
        }

        const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
        geometry.setAttribute('position', positionsAttribute)

        // Material
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.render(scene, camera) // Initiate rendering the scene

        // Resize
        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            //Update Camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            //Update Renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        // --------- Animate function ---------
        const animate = () => {
            // mesh.rotation.y += 0.003

            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            renderer.dispose();
        };

    }, [])

    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default GeometriesLesson