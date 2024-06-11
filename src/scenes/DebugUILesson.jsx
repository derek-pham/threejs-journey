import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';


const DebugUILesson = () => {
    const canvasRef = useRef();

    useEffect(() => {
        // Instantiate GUI
        const gui = new GUI({width: 900, title: 'DEBUG UI'})

        gui.hide()
        window.addEventListener('keydown', (event) => {
            if (event.key == 'h') {
                gui.show(gui._hidden)
            }
        })
        const debugObject = {}
        debugObject.color = '#c863e3'

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshBasicMaterial({ color: debugObject.color, wireframe: false })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        // ADDING THINGS TO GUI
        const cubeTweaks = gui.addFolder('HELLO')
        // gui.close()

        cubeTweaks.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('Elevation') // Add object and then object's property
        cubeTweaks.add(mesh, 'visible').name("Visible")
        cubeTweaks.add(material, 'wireframe') // mesh.material also works since they ultimately target the same property
        cubeTweaks.addColor(debugObject, 'color').onChange(() => material.color.set(debugObject.color))
        debugObject.spin = () => {
            gsap.to(mesh.rotation, { x: mesh.rotation.x + Math.PI * 2 })
        }
        cubeTweaks.add(debugObject, 'spin').name('SPIN')

        debugObject.subDivision = 2
        cubeTweaks.add(debugObject, 'subDivision').min(1).max(10).step(1)
            .onFinishChange(() => { // onFinishChange for performance reasons
                mesh.geometry.dispose() // Destroys current object before creating a new one to prevent memory leaks and performance issues
                mesh.geometry = new THREE.BoxGeometry(
                    1, 1, 1,
                    debugObject.subDivision, debugObject.subDivision, debugObject.subDivision
                )
            })

        const myObject = { myVariable: 1335 }
        cubeTweaks.add(myObject, 'myVariable')

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
            mesh.rotation.y += 0.003

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

export default DebugUILesson