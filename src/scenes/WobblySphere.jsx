import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader, DRACOLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import wobblySphereVertexShader from '../shaders/wobblysphere/vertex.glsl'
import wobblySphereFragmentShader from '../shaders/wobblysphere/fragment.glsl'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const WobblySphere = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        // Settings Objects for GUI
        const settingsObj = {
            colorA: '#0000ff',
            colorB: '#ff0000',
        };
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

        // Loaders
        const rgbeLoader = new RGBELoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('./draco/')
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        // Environment Map
        rgbeLoader.load('./environmentMaps/urban_alley_01_1k.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping

            scene.background = environmentMap
            scene.environment = environmentMap
        })

        // Geometry
        let geometry = new THREE.IcosahedronGeometry(1.5, 50)
        geometry = mergeVertices(geometry)
        geometry.computeTangents()
        console.log(geometry.attributes)


        // Material        
        const uniforms = {
            uTime: new THREE.Uniform(0),
            uPositionFrequency: new THREE.Uniform(0.7),
            uTimeFrequency: new THREE.Uniform(0.6),
            uStrength: new THREE.Uniform(0.5),

            uWarpedPositionFrequency: new THREE.Uniform(0.38),
            uWarpedTimeFrequency: new THREE.Uniform(0.12),
            uWarpedStrength: new THREE.Uniform(1.7),

            uColorA: new THREE.Uniform(new THREE.Color(settingsObj.colorA)),
            uColorB: new THREE.Uniform(new THREE.Color(settingsObj.colorB))
        }

        const depthMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshDepthMaterial,
            vertexShader: wobblySphereVertexShader,
            //MeshDepthMaterial
            depthPacking: THREE.RGBADepthPacking,
            uniforms: uniforms
        })
        const material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: wobblySphereVertexShader,
            fragmentShader: wobblySphereFragmentShader,
            uniforms: uniforms,
            metalness: 0,
            roughness: 0.5,
            color: '#ffffff',
            transmission: 0,
            ior: 1.5,
            thickness: 1.5,
            transparent: true,
            wireframe: false
        })
        gui.add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001).name('uPositionFrequency')
        gui.add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001).name('uTimeFrequency')
        gui.add(uniforms.uStrength, 'value', 0, 2, 0.001).name('uStrength')
        gui.add(uniforms.uWarpedPositionFrequency, 'value', 0, 2, 0.001).name('uWarpedPositionFrequency')
        gui.add(uniforms.uWarpedTimeFrequency, 'value', 0, 2, 0.001).name('uWarpedTimeFrequency')
        gui.add(uniforms.uWarpedStrength, 'value', 0, 2, 0.001).name('uWarpedStrength')
        gui.addColor(settingsObj, 'colorA').onChange(() => {
            uniforms.uColorA.value.set(settingsObj.colorA)
        })
        gui.addColor(settingsObj, 'colorB').onChange(() => {
            uniforms.uColorB.value.set(settingsObj.colorB)
        })

        gui.add(material, 'metalness', 0, 1, 0.001)
        gui.add(material, 'roughness', 0, 1, 0.001)
        gui.add(material, 'transmission', 0, 1, 0.001)
        gui.add(material, 'ior', 0, 10, 0.001)
        gui.add(material, 'thickness', 0, 10, 0.001)

        // Mesh
        // const wobble = new THREE.Mesh(geometry, material)
        // wobble.customDepthMaterial = depthMaterial
        // wobble.receiveShadow = true
        // wobble.castShadow = true
        // scene.add(wobble)

        // Suzanne
        gltfLoader.load('/suzanne.glb', (gltf) => {
            const wobble = gltf.scene.children[0]
            wobble.receiveShadow = true
            wobble.castShadow = true
            wobble.customDepthMaterial = depthMaterial
            wobble.material = material

            scene.add(wobble)
        })

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 10),
            new THREE.MeshStandardMaterial()
        )
        plane.receiveShadow = true
        plane.position.y = -1
        plane.position.z = -1.5
        scene.add(plane)

        // Camera
        const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height)
        camera.position.set(-2.5, -0.1, 2.5)
        scene.add(camera)

        // Lights
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.z = 1
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.normalBias = 0.05
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)
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

            uniforms.uTime.value = elapsedTime

            controls.update()
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

export default WobblySphere