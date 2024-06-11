import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/Addons.js';


const MaterialsLesson = () => {
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
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
        const sphereGeometry = new THREE.SphereGeometry(1, 12, 12)
        const planeGeomtery = new THREE.PlaneGeometry(1, 1, 100, 100)
        const torusGeometry = new THREE.TorusGeometry(1, 0.25, 10, 20)

        // Textures
        const textureLoader = new THREE.TextureLoader()

        const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
        const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
        const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
        const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
        const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
        const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
        const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
        const matcapTexture = textureLoader.load('/textures/matcaps/10.png');
        const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');

        doorColorTexture.colorSpace = THREE.SRGBColorSpace
        matcapTexture.colorSpace = THREE.SRGBColorSpace

        // Material
        // const material = new THREE.MeshBasicMaterial({ map: doorColorTexture })
        // const material = new THREE.MeshNormalMaterial()
        // const material = new THREE.MeshMatcapMaterial()
        // const material = new THREE.MeshDepthMaterial()
        // const material = new THREE.MeshLambertMaterial()
        // const material = new THREE.MeshPhongMaterial()
        // const material = new THREE.MeshToonMaterial()
        // const material = new THREE.MeshStandardMaterial()
        const material = new THREE.MeshPhysicalMaterial()

        // material.wireframe = true
        // material.flatShading = true
        // material.transparent = true
        // material.alphaMap = doorAlphaTexture
        // material.side = THREE.DoubleSide // Use with caution in regard to performance
        // material.matcap = matcapTexture
        // material.shininess = 10
        // material.specular = new THREE.Color(0x1188ff)

        // gradientTexture.minFilter = THREE.NearestFilter
        // gradientTexture.magFilter = THREE.NearestFilter
        // gradientTexture.generateMipmaps = false
        // material.gradientMap = gradientTexture
        material.metalness = 1
        material.roughness = 1;
        // material.map = doorColorTexture
        // material.aoMap = doorAmbientOcclusionTexture
        // material.displacementMap = doorHeightTexture
        // material.displacementScale = 0.1
        material.metalnessMap = doorMetalnessTexture
        material.roughnessMap = doorRoughnessTexture
        material.normalMap = doorNormalTexture
        // material.alphaMap = doorAlphaTexture

        // Clearcoat
        // material.clearcoat = 1
        // material.clearcoatRoughness = 0

        // Sheen
        // material.sheen = 1
        // material.sheenRoughness = 0.25
        // material.sheenColor.set(1,1,1)

        // Iridescence
        // material.iridescence = 1
        // material.iridescenceIOR = 1
        // material.iridescenceThicknessRange = [100, 800]

        // Transmission
        material.transmission = 1
        material.ior = 1.5
        material.thickness = 0.5

        gui.add(material, 'metalness').min(0).max(1).step(0.01)
        gui.add(material, 'roughness').min(0).max(1).step(0.01)
        // gui.add(material, 'clearcoat').min(0).max(1).step(0.01)
        // gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.01)
        gui.add(material, 'sheen').min(0).max(1).step(0.01)
        gui.add(material, 'sheenRoughness').min(0).max(1).step(0.01)
        gui.add(material, 'iridescence').min(0).max(1).step(0.01)
        gui.add(material, 'iridescenceIOR').min(0).max(2.333).step(0.01)
        gui.add(material.iridescenceThicknessRange, '0').min(0).max(1000).step(1)
        gui.add(material.iridescenceThicknessRange, '1').min(0).max(1000).step(1)

        gui.add(material, 'transmission').min(0).max(1).step(0.01)
        gui.add(material, 'ior').min(1).max(2).step(0.01)
        gui.add(material, 'thickness').min(0).max(1).step(0.01)


        //Mesh Object
        const mesh = new THREE.Mesh(cubeGeometry, material)
        mesh.position.y = 2
        scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour").onChange(() => mesh.material.color.set(meshDebug.color))

        const sphere = new THREE.Mesh(sphereGeometry, material)
        sphere.position.x = -3
        scene.add(sphere)

        const plane = new THREE.Mesh(planeGeomtery, material)
        scene.add(plane)

        const torus = new THREE.Mesh(torusGeometry, material)
        torus.position.x = 3
        scene.add(torus)

        // Lights
        // const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        // scene.add(ambientLight)

        // const pointLight = new THREE.PointLight(0xffffff, 100)
        // pointLight.position.x = 2
        // pointLight.position.y = 3
        // pointLight.position.z = 4
        // scene.add(pointLight)

        // Environment Map
        const rgbeLoader = new RGBELoader()
        rgbeLoader.load('/textures/environmentMap/2k.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping
            scene.background = environmentMap
            scene.environment = environmentMap
        })

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 0, 4)
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
            mesh.rotation.y += rotation

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

export default MaterialsLesson