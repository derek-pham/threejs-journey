import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import particlesVertexShader from '../shaders/flowfield/vertex.glsl'
import particlesFragmentShader from '../shaders/flowfield/fragment.glsl'
import gpgpuParticlesShader from '../shaders/flowfield/gpgpu/particles.glsl'
import { GLTFLoader, DRACOLoader, GPUComputationRenderer } from 'three/examples/jsm/Addons.js';


const GPGPUFlowFieldLesson = () => {
    const canvasRef = useRef();
    const [baseGeometryState, setBaseGeometryState] = useState(new THREE.SphereGeometry(3))
    const [sceneInitialized, setSceneInitialized] = useState(false);
    let animateId;

    useEffect(() => {
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI();

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Load Model
        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager)
        dracoLoader.setDecoderPath('/draco/')
        const gltfLoader = new GLTFLoader(loadingManager);
        gltfLoader.setDRACOLoader(dracoLoader)

        async function loadModel() {
            const gltf = await gltfLoader.loadAsync('/models/ship.glb')
            setBaseGeometryState(gltf.scene.children[0].geometry)
            setSceneInitialized(true)
        }
        loadModel()

        // ~ BASE GEOMETRY6
        const baseGeometry = {}

        baseGeometry.instance = baseGeometryState
        baseGeometry.count = baseGeometry.instance.attributes.position.count
        console.log(baseGeometry.instance)

        const gpgpu = {}
        gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count))

        const particlesUVArray = new Float32Array(baseGeometry.count * 2)
        const sizesArray = new Float32Array(baseGeometry.count)
        for (let y = 0; y < gpgpu.size; y++) {
            for (let x = 0; x < gpgpu.size; x++) {
                const i = (y * gpgpu.size + x)
                const i2 = i * 2

                const uvX = (x + 0.5) / gpgpu.size
                const uvY = (y + 0.5) / gpgpu.size

                particlesUVArray[i2 + 0] = uvX
                particlesUVArray[i2 + 1] = uvY

                sizesArray[i] = Math.random()
            }
        }

        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setDrawRange(0, baseGeometry.count)
        newGeometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUVArray, 2))
        if (sceneInitialized) {
            newGeometry.setAttribute('aColor', baseGeometry.instance.attributes.color)
        }
        newGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizesArray, 1))



        // Material
        const material = new THREE.ShaderMaterial({
            vertexShader: particlesVertexShader,
            fragmentShader: particlesFragmentShader,
            uniforms: {
                uSize: new THREE.Uniform(0.04),
                uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                uParticlesTexture: new THREE.Uniform(),
            }
        })

        //Mesh Object
        const sphere = new THREE.Points(newGeometry, material)
        scene.add(sphere)

        // Camera
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(6, 4, 7)
        scene.add(camera)

        // Lights

        // Controls
        const controls = new OrbitControls(camera, canvas)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.setClearColor(new THREE.Color(0xF5DEB3), 1);
        renderer.shadowMap.enabled = true

        // ~ GPU Compute

        gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer)
        gpgpu.computation.init()

        // Base Particles
        const baseParticlesTexture = gpgpu.computation.createTexture()

        for (let i = 0; i < baseGeometry.count; i++) {
            const i3 = i * 3
            const i4 = i * 4

            //Position based on geometry
            baseParticlesTexture.image.data[i4 + 0] = baseGeometry.instance.attributes.position.array[i3 + 0]
            baseParticlesTexture.image.data[i4 + 1] = baseGeometry.instance.attributes.position.array[i3 + 1]
            baseParticlesTexture.image.data[i4 + 2] = baseGeometry.instance.attributes.position.array[i3 + 2]
            baseParticlesTexture.image.data[i4 + 3] = Math.random()

        }

        // Particles variable
        gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
        gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [gpgpu.particlesVariable])
        gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
        gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
        gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(2.0)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5)

        gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value').min(0).max(1).step(0.001).name('uFlowFieldInfluence')
        gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value').min(0).max(10).step(0.01).name('uFlowFieldStrength')
        gui.add(gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value').min(0).max(1).step(0.001).name('uFlowFieldFrequency')

        gpgpu.computation.init()

        gpgpu.debug = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshBasicMaterial({
                map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
            })
        )
        gpgpu.debug.position.x = 3
        scene.add(gpgpu.debug)

        // console.log(gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture)

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
            // Materials

            material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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

            controls.update()
            gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime
            gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime

            gpgpu.computation.compute()
            material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture

            // if (shipGeometry) {
            //     baseGeometry.instance = shipGeometry.scene.children[0].geometry
            //     console.log("adgadg")
            // } 

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

    }, [sceneInitialized])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default GPGPUFlowFieldLesson