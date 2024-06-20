import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import halftoneVertexShader from '../shaders/halftone/vertex.glsl'
import halftoneFragmentShader from '../shaders/halftone/fragment.glsl'

const HalftoneShadingLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            color: '#ff794d',
            clearColor: '#26132f',
            shadowColor: '#8e19b8',
            lightColor: '#e5ffe0',
        };

        // GUI
        const gui = new GUI();
        const sizes = {
            width: window.innerWidth, height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2.0)
        }

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Loaders
        const gltfLoader = new GLTFLoader()

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.ShaderMaterial({
            vertexShader: halftoneVertexShader,
            fragmentShader: halftoneFragmentShader,
            uniforms: {
                uTime: new THREE.Uniform(0),
                uColor: new THREE.Uniform(new THREE.Color(settingsObj.color)),
                uShadowColor: new THREE.Uniform(new THREE.Color(settingsObj.shadowColor)),
                uLightColor: new THREE.Uniform(new THREE.Color(settingsObj.lightColor)),
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                uShadowRepetitions: new THREE.Uniform(100),
                uLightRepetitions: new THREE.Uniform(100),
            }
        })
        gui.addColor(settingsObj, 'color').onChange(() => { material.uniforms.uColor.value.set(settingsObj.color) })
        gui.addColor(settingsObj, 'shadowColor').onChange(() => { material.uniforms.uShadowColor.value.set(settingsObj.shadowColor) })
        gui.addColor(settingsObj, 'lightColor').onChange(() => { material.uniforms.uLightColor.value.set(settingsObj.lightColor) })
        gui.add(material.uniforms.uShadowRepetitions, 'value').min(1).max(500).step(1).name('uShadowRepetitions')

        //Mesh Object

        // Camera

        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 0, 4)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)
        /**
         * Objects
         */
        // Torus knot
        const torusKnot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
            material
        )
        torusKnot.position.x = 3
        scene.add(torusKnot)

        // Sphere
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(),
            material
        )
        sphere.position.x = - 3
        scene.add(sphere)

        // Suzanne
        let suzanne = null
        gltfLoader.load(
            '/models/suzanne.glb',
            (gltf) => {
                suzanne = gltf.scene
                suzanne.traverse((child) => {
                    if (child.isMesh)
                        child.material = material
                })
                scene.add(suzanne)
            }
        )

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

        // Resize
        const handleResize = () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

            // Update Camera
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            // Update Renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // --------- Animate function ---------
        const animate = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime

            material.uniforms.uTime.value = elapsedTime;

            // Rotate objects
            if (suzanne) {
                suzanne.rotation.x = - elapsedTime * 0.1
                suzanne.rotation.y = elapsedTime * 0.2
            }

            sphere.rotation.x = - elapsedTime * 0.1
            sphere.rotation.y = elapsedTime * 0.2

            torusKnot.rotation.x = - elapsedTime * 0.1
            torusKnot.rotation.y = elapsedTime * 0.2

            renderer.render(scene, camera)
            animateId = window.requestAnimationFrame(animate);
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            window.cancelAnimationFrame(animateId);
            renderer.dispose();
            gui.destroy();
            window.removeEventListener('resize', handleResize);
        };

    }, [])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default HalftoneShadingLesson