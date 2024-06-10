import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CamerasLesson = () => {
    const canvasRef = useRef();
    const [xCoord, setxCoord] = useState(0)
    const [yCoord, setyCoord] = useState(0)

    useEffect(() => {
        // Cursor
        window.addEventListener('mousemove', (event) => {
            setxCoord(event.clientX / sizes.width - 0.5)
            setyCoord(event.clientY / sizes.height - 0.5)
            cursor.x = event.clientX / sizes.width - 0.5
            cursor.y = -(event.clientY / sizes.height - 0.5)
        })

        const cursor = {
            x: 0,
            y: 0
        }
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
        const camera = new THREE.PerspectiveCamera(120, sizes.width / sizes.height, 0.1, 100)

        const aspectRatio = sizes.width / sizes.height // 1.33333
        // aspectRatio on left and right because 600 * 1.3333 is 800
        // const camera = new THREE.OrthographicCamera(-2 * aspectRatio, 2 * aspectRatio, 2, -2, 0.1, 100) 
        camera.position.set(0, 0, 2)
        scene.add(camera)

        //Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.render(scene, camera) // Initiate rendering the scene


        // --------- Animate function ---------
        const animate = () => {
            // mesh.rotation.y += 0.003
            // cursor.x * 3 to increase rotational intensity then Math.sin(cursor.x * 3) * 3 to increase distance since sin and cos return 0 ~ 1
            // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
            // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
            // camera.position.y = cursor.y * 5
            // camera.lookAt(mesh.position)

            // Update controls
            controls.update() // Written to accommodate for the damping effect

            renderer.render(scene, camera) // REMEMBER TO RE-RENDER THE SCENE TO *SEE* CHANGES
            window.requestAnimationFrame(animate) // KEEP CALLING FOR SUBSEQUENT REPAINT EVENTS
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            renderer.dispose();
        };

    }, [])

    return (
        <>
            <p>x: {xCoord} y: {yCoord}</p>
            <canvas ref={canvasRef} />
        </>
    )
}

export default CamerasLesson