import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import { RectAreaLightHelper } from 'three/examples/jsm/Addons.js';

const LightsLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
    let rotationTrigger = false;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            toggleRotation: () => {
                if (rotationTrigger) {
                    rotationTrigger = false;
                    rotation = 0.003;
                } else {
                    rotationTrigger = true;
                    rotation = 0;
                }
            }
        };

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)


        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
        material.side = THREE.DoubleSide
        gui.add(material, 'roughness').min(0).max(1).step(0.01)
        gui.add(material, 'metalness').min(0).max(1).step(0.01)

        //Mesh Object
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => cube.material.color.set(meshDebug.color))

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.rotation.x = Math.PI / 2
        plane.rotation.y = Math.PI
        plane.position.y = -1
        scene.add(plane)

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(.7, 20, 20), material)
        sphere.position.x = -2
        scene.add(sphere)

        const torus = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.135, 10), material)
        torus.position.x = 2
        scene.add(torus)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Lights

        //  ~~~~ LOW COST LIGHTS ~~~~
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 0.1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff00ff, 0)
        gui.add(hemisphereLight, 'intensity').min(0).max(10).step(0.01).name('hemisphereLight')
        scene.add(hemisphereLight)

        //  ~~~~ MEDIUM COST LIGHTS ~~~~
        const pointLight = new THREE.PointLight(0xffffff, 10)
        gui.add(pointLight, 'intensity').min(-5).max(10).step(0.01).name('pointLight')
        pointLight.position.x = 0
        pointLight.position.y = 0
        pointLight.position.z = -2
        pointLight.distance = 2
        gui.add(pointLight, 'distance').min(0.01).max(10).step(0.01).name('pointLightDistance')
        pointLight.decay = 2
        gui.add(pointLight, 'decay').min(0.01).max(5).step(0.001).name('pointLightDecay')
        scene.add(pointLight)

        const directionalLight = new THREE.DirectionalLight(0x0000ff, 0)
        directionalLight.position.set(3, 1, 0)
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)


        //  ~~~~ HIGH COST LIGHTS ~~~~
        const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 30, 1, 1)
        rectAreaLight.position.z = 3
        rectAreaLight.position.x = 3
        rectAreaLight.lookAt(torus.position)
        gui.add(rectAreaLight.position, 'z').min(-3).max(5).step(0.01).name('rectAreaLight.position.z')
        scene.add(rectAreaLight)

        const spotLight = new THREE.SpotLight(0x0000ff, 100, 9, Math.PI * 0.1, 0, 1)
        spotLight.position.set(-2, 5, 0)
        spotLight.target.position.x = -1
        scene.add(spotLight.target)
        scene.add(spotLight)

        // Light Helpers
        const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
        scene.add(hemisphereLightHelper)
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
        scene.add(directionalLightHelper)
        const pointLightHelper = new THREE.PointLightHelper(pointLight,1)
        scene.add(pointLightHelper)
        const spotLightHelper = new THREE.SpotLightHelper(spotLight)
        scene.add(spotLightHelper)
        const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
        scene.add(rectAreaLightHelper)

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
            cube.rotation.y += rotation
            sphere.rotation.y += rotation
            torus.rotation.y += rotation

            cube.rotation.x -= rotation / 2
            sphere.rotation.x -= rotation / 2
            torus.rotation.x -= rotation / 2

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

export default LightsLesson