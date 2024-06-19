import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import lightShadingVertexShader from '../shaders/lightshading/vertex.glsl'
import lightShadingFragmentShader from '../shaders/lightshading/fragment.glsl'

const LightsShadingLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            color: '#95d6fe'
        };

        // GUI
        const gui = new GUI();

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Loaders
        const gltfLoader = new GLTFLoader()

        // Geometry

        // Material
        const material = new THREE.ShaderMaterial({
            vertexShader: lightShadingVertexShader,
            fragmentShader: lightShadingFragmentShader,
            uniforms: {
                uTime: new THREE.Uniform(0),
                uColor: new THREE.Uniform(new THREE.Color(settingsObj.color))
            }
        })
        gui.addColor(settingsObj, 'color').onChange(() => { material.uniforms.uColor.value.set(settingsObj.color) })

        //Mesh Object

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(2, 1.4, 4)
        scene.add(camera)

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

        // Lights
        const directionalLightHelper = new THREE.Mesh(
            new THREE.PlaneGeometry(),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
            })
        )
        directionalLightHelper.material.color.setRGB(0.1, 0.1, 1.0)
        directionalLightHelper.position.set(0, 0, 3)
        scene.add(directionalLightHelper)

        const pointLightHelper = new THREE.Mesh(
            new THREE.SphereGeometry(0.1,8),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
            })
        )
        pointLightHelper.material.color.setRGB(1.0, 0.1, 0.1)
        pointLightHelper.position.set(0, 2.5, 0)
        scene.add(pointLightHelper)

        const pointLightHelper2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.1,8),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
            })
        )
        pointLightHelper2.material.color.setRGB(0.1, 1.0, 0.1)
        pointLightHelper2.position.set(2.0, 2.0, 2.0)
        scene.add(pointLightHelper2)


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

export default LightsShadingLesson