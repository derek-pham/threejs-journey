import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import earthVertexShader from '../shaders/earth/vertex.glsl'
import earthFragmentShader from '../shaders/earth/fragment.glsl'
import earthatmosphereVertexShader from '../shaders/earthatmosphere/vertex.glsl'
import earthatmosphereFragmentShader from '../shaders/earthatmosphere/fragment.glsl'

const EarthLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.0005;
    let rotationTrigger = false;
    let animateId;

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
            },
            atmosphereDayColor: '#00aaff',
            atmosphereTwilightColor: '#ff6600',
        };

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Textures
        const loadingManager = new THREE.LoadingManager()
        loadingManager.onStart = () => console.log('onStart')
        loadingManager.onProgress = () => console.log('onProgress')
        loadingManager.onLoad = () => console.log('onLoad')

        const textureLoader = new THREE.TextureLoader(loadingManager)

        const earthNightTexture = textureLoader.load('/textures/earth/night.jpg')
        earthNightTexture.colorSpace = THREE.SRGBColorSpace
        earthNightTexture.anisotropy = 8

        const earthSpecularCloudTexture = textureLoader.load('/textures/earth/specularClouds.jpg')
        earthSpecularCloudTexture.anisotropy = 8

        const earthDayTexture = textureLoader.load('/textures/earth/day.jpg')
        earthDayTexture.colorSpace = THREE.SRGBColorSpace
        earthDayTexture.anisotropy = 8

        // Geometry
        const geometry = new THREE.SphereGeometry(1, 30, 30)

        // Material

        const material = new THREE.ShaderMaterial({
            vertexShader: earthVertexShader,
            fragmentShader: earthFragmentShader,
            uniforms: {
                uDayTexture: new THREE.Uniform(earthDayTexture),
                uNightTexture: new THREE.Uniform(earthNightTexture),
                uSpecularCloudTexture: new THREE.Uniform(earthSpecularCloudTexture),
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(settingsObj.atmosphereDayColor)),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(settingsObj.atmosphereTwilightColor)),
            }
        })
        gui.addColor(settingsObj, 'atmosphereDayColor').name("atmosphereDayColor").onChange(() => {
            material.uniforms.uAtmosphereDayColor.value.set(settingsObj.atmosphereDayColor)
            atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(settingsObj.atmosphereDayColor)
        })

        gui.addColor(settingsObj, 'atmosphereTwilightColor').name("atmosphereTwilightColor").onChange(() => {
            material.uniforms.uAtmosphereTwilightColor.value.set(settingsObj.atmosphereTwilightColor)
            atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(settingsObj.atmosphereTwilightColor)
        })

        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: earthatmosphereVertexShader,
            fragmentShader: earthatmosphereFragmentShader,
            uniforms: {
                uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(settingsObj.atmosphereDayColor)),
                uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(settingsObj.atmosphereTwilightColor)),
            },
            side: THREE.BackSide,
            transparent: true,
        })

        //Mesh Object
        // EARTH
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        // SUN
        const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
        const sunDirection = new THREE.Vector3()
        function updateSun() {
            sunDirection.setFromSpherical(sunSpherical)
            debugSun.position.copy(sunDirection).multiplyScalar(3)

            material.uniforms.uSunDirection.value.copy(sunDirection)
            atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
        }

        // ~~ Debug
        const debugSun = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.1, 12),
            new THREE.MeshBasicMaterial()
        )
        scene.add(debugSun)
        updateSun()

        //
        gui.add(sunSpherical, 'phi').min(0).max(Math.PI).step(0.01).onChange(updateSun)
        gui.add(sunSpherical, 'theta').min(-Math.PI).max(Math.PI).step(0.01).onChange(updateSun)

        // ATMOSPHERE
        const atmosphereMesh = new THREE.Mesh(geometry, atmosphereMaterial)
        atmosphereMesh.scale.set(1.04, 1.04, 1.04)
        scene.add(atmosphereMesh)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(4, 1, 0)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)

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
            mesh.rotation.y += rotation

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

export default EarthLesson