import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';


const ThreeDTextLesson = () => {
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

        // Axes Helper
        const axesHelper = new THREE.AxesHelper()
        scene.add(axesHelper)

        // Texture Loader
        const textureLoader = new THREE.TextureLoader()

        // Fonts
        const fontLoader = new FontLoader()
        fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
            console.log('Font loaded')
            const textGeometry = new TextGeometry(
                'Hello World!',
                {
                    font: font,
                    size: 0.5,
                    depth: 0.2,
                    curveSegments: 5,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 3
                }
            )
            // textGeometry.computeBoundingBox()
            // textGeometry.translate(
            //     -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
            //     -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
            //     -(textGeometry.boundingBox.max.z - 0.03)* 0.5,
            // )
            // console.log(textGeometry.boundingBox)

            textGeometry.center()          
            const textMatcapMap = textureLoader.load('/textures/matcaps/9.png')
            const material = new THREE.MeshMatcapMaterial({ matcap: textMatcapMap })
  
            textMatcapMap.colorSpace = THREE.SRGBColorSpace
            material.matcap = textMatcapMap
            const text = new THREE.Mesh(textGeometry, material)
            scene.add(text)

            const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
            // const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: textMatcapMap })

            console.time('donuts')
            for (let i = 0; i < 300; i++) {

                const donut = new THREE.Mesh(donutGeometry, material)

                donut.position.x = (Math.random() - 0.5) * 15
                donut.position.y = (Math.random() - 0.5) * 15
                donut.position.z = (Math.random() - 0.5) * 15

                donut.rotation.x = Math.random() * Math.PI
                donut.rotation.y = Math.random() * Math.PI

                const scale = Math.random()
                donut.scale.set(scale, scale, scale)

                scene.add(donut)
            }
            console.timeEnd('donuts')
        })

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)


        // Material
        const material = new THREE.MeshBasicMaterial({ color: 0xc863e3 })

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 2
        scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 0, 5)
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

export default ThreeDTextLesson