import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import textVertexShaders from '../shaders/ragingsea/vertex.glsl'
import textFragmentShaders from '../shaders/ragingsea/fragment.glsl'

const RagingSeaLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            depthColor: '#186691',
            surfaceColor: '#9bd8ff',
        };

        // GUI
        const gui = new GUI();

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BoxGeometry(10, 10, 10, 100, 100, 100)
        const planeGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

        // Textures
        const textureLoader = new THREE.TextureLoader()
        const flagTexture = textureLoader.load('/flag-french.jpg')

        //Random Array
        const count = planeGeometry.attributes.position.count
        const randoms = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            randoms[i] = Math.random()
        }

        planeGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })
        const rawShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: textVertexShaders,
            fragmentShader: textFragmentShaders,
            side: THREE.DoubleSide,
            // wireframe: true
            uniforms: {
                uBigWavesElevation: { value: 0.4 },
                uBigWavesFrequency: { value: new THREE.Vector2(4.0, 1.5) },
                uTime: { value: 0.0 },
                uBigWavesSpeed: { value: 0.75 },
                uSmallWavesElevation: { value: 0.15 },
                uSmallWavesFrequency: { value: 3 },
                uSmallWavesSpeed: { value: 0.2 },
                uSmallIterations: { value: 4.0 },

                uDepthColor: { value: new THREE.Color(settingsObj.depthColor) },
                uSurfaceColor: { value: new THREE.Color(settingsObj.surfaceColor) },
                uColorOffset: { value: 1.0 },
                uColorMultiplier: { value: 2.0 },
            }
        })
        gui.add(rawShaderMaterial.uniforms.uBigWavesElevation, 'value').min(-2).max(2).step(0.01).name('uBigWavesElevation')
        gui.add(rawShaderMaterial.uniforms.uBigWavesFrequency.value, 'x').min(-5).max(5).step(0.01).name('uBigWavesFrequencyX')
        gui.add(rawShaderMaterial.uniforms.uBigWavesFrequency.value, 'y').min(-5).max(5).step(0.01).name('uBigWavesFrequencyY')
        gui.add(rawShaderMaterial.uniforms.uBigWavesSpeed, 'value').min(-3).max(3).step(0.01).name('uBigWavesSpeed')
        gui.addColor(settingsObj, 'depthColor').name('depthColor').onChange(() => {
            rawShaderMaterial.uniforms.uDepthColor.value.set(settingsObj.depthColor)
        })
        gui.addColor(settingsObj, 'surfaceColor').name('surfaceColor').onChange(() => {
            rawShaderMaterial.uniforms.uSurfaceColor.value.set(settingsObj.surfaceColor)
        })
        gui.add(rawShaderMaterial.uniforms.uColorOffset, 'value').min(0).max(3).step(0.001).name('uColorOffset')
        gui.add(rawShaderMaterial.uniforms.uColorMultiplier, 'value').min(0).max(5).step(0.01).name('uColorMultiplier')
        gui.add(rawShaderMaterial.uniforms.uSmallWavesElevation, 'value').min(-3).max(3).step(0.001).name('uSmallWavesElevation')
        gui.add(rawShaderMaterial.uniforms.uSmallWavesFrequency, 'value').min(-3).max(3).step(0.01).name('uSmallWavesFrequency')
        gui.add(rawShaderMaterial.uniforms.uSmallWavesSpeed, 'value').min(-3).max(3).step(0.01).name('uSmallWavesSpeed')
        gui.add(rawShaderMaterial.uniforms.uSmallIterations, 'value').min(-3).max(3).step(0.01).name('uSmallIterations')


        //Mesh Object
        const plane = new THREE.Mesh(planeGeometry, rawShaderMaterial)

        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = -1
        scene.add(plane)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0.4, 0.8, 0.6)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
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

            rawShaderMaterial.uniforms.uTime.value = elapsedTime

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

export default RagingSeaLesson