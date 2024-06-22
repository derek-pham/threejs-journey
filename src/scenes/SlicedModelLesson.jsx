import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import GUI from 'lil-gui';
import slicedVertexShader from '../shaders/sliced/vertex.glsl'
import slicedFragmentShader from '../shaders/sliced/fragment.glsl'

const SlicedModelLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
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
            }
        };
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

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


        // Environment map
        rgbeLoader.load('./aerodynamics_workshop.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping

            scene.background = environmentMap
            scene.backgroundBlurriness = 0.5
            scene.environment = environmentMap
        })

        // Geometry
        const geometry = new THREE.IcosahedronGeometry(1, 5)

        const uniforms = {
            uSliceStart: new THREE.Uniform(1.75),
            uSliceArc: new THREE.Uniform(1.25),
        }

        gui.add(uniforms.uSliceStart, 'value', -Math.PI, Math.PI, 0.001).name('uSliceStart')
        gui.add(uniforms.uSliceArc, 'value', 0, Math.PI * 2, 0.001).name('uSliceArc')

        const patchMap = {
            csm_Slice: {
                '#include <colorspace_fragment>': `
                    #include <colorspace_fragment>

                    if(!gl_FrontFacing)
                        gl_FragColor = vec4(0.75,0.15,0.3,1.0);                    
                `
            }
        }

        // Material
        const material = new THREE.MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.25,
            envMapIntensity: 0.5,
            color: '#858080'
        })
        const slicedMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshStandardMaterial,
            silent: true,
            vertexShader: slicedVertexShader,
            fragmentShader: slicedFragmentShader,
            uniforms: uniforms,

            // MeshStandardMaterial
            metalness: 0.5,
            roughness: 0.25,
            envMapIntensity: 0.5,
            color: '#858080',
            side: THREE.DoubleSide,
            patchMap: patchMap
        })
        const slicedDepthMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshDepthMaterial,
            silent: true,
            vertexShader: slicedVertexShader,
            fragmentShader: slicedFragmentShader,
            uniforms: uniforms,

            // MeshStandardMaterial
            depthPacking: THREE.RGBADepthPacking
        })

        //Model
        let model;
        gltfLoader.load('/gears.glb', (gltf) => {
            model = gltf.scene
            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.name === 'outerHull') {
                        child.material = slicedMaterial
                        child.customDepthMaterial = slicedDepthMaterial
                    } else {
                        child.material = material
                    }
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })

            scene.add(model)
        })

        //Mesh Object
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ color: 'brown' }))
        plane.receiveShadow = true
        plane.position.x = - 4
        plane.position.y = - 3
        plane.position.z = - 4
        plane.lookAt(new THREE.Vector3(0, 0, 0))
        scene.add(plane)

        // Camera
        const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height)
        camera.position.set(-2.5, 0.8, 4.5)
        scene.add(camera)

        // Lights
        const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
        directionalLight.position.set(6.25, 3, 4)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.near = 0.1
        directionalLight.shadow.camera.far = 30
        directionalLight.shadow.normalBias = 0.05
        directionalLight.shadow.camera.top = 8
        directionalLight.shadow.camera.right = 8
        directionalLight.shadow.camera.bottom = -8
        directionalLight.shadow.camera.left = -8
        scene.add(directionalLight)


        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

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
            if (model) {
                model.rotation.y += rotation * 0.1
                model.rotation.x -= rotation * 0.03
            }

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

export default SlicedModelLesson