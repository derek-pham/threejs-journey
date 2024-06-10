import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const FullscreenAndResizing = () => {
    const canvasRef = useRef();

    useEffect(() => {
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

        // Fullscreen trigger
        window.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                console.log('go fullscreen');
                canvas.requestFullScreen()
            } else {
                console.log('leave fullscreen')
                document.exitFullscreen()
            }
        })


        // --------- Animate function ---------
        const animate = () => {
            mesh.rotation.y += 0.002

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

export default FullscreenAndResizing