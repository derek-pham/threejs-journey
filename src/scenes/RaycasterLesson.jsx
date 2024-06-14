import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const RaycasterLesson = () => {
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

        // GUI
        const gui = new GUI();
        gui.add(settingsObj, 'toggleRotation').name('Toggle Rotation');

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        // Geometry
        const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })
        // material.side = THREE.DoubleSide;

        //Mesh Object        
        const meshDebug = { color: '#c863e3' }
        const meshes = []

        const mesh1 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xc863e3 }))
        mesh1.castShadow = true
        scene.add(mesh1)

        const mesh2 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xc863e3 }))
        mesh2.castShadow = true
        scene.add(mesh2)
        mesh2.position.set(2, 0, 0)

        const mesh3 = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xc863e3 }))
        mesh3.castShadow = true
        scene.add(mesh3)
        mesh3.position.set(-2, 0, 0)

        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => {
                mesh3.material.color.set(meshDebug.color)
                mesh2.material.color.set(meshDebug.color)
                mesh2.material.color.set(meshDebug.color)
            })

        meshes.push(mesh1, mesh2, mesh3)

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ color: 0xc863e3 }))
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = -1
        scene.add(plane)

        // LOADING DUCK
        let duckModel
        const gltfLoader = new GLTFLoader()
        gltfLoader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
            duckModel = gltf.scene
            duckModel.position.y = -1.1
            scene.add(duckModel)
        })

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 0, 2)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
        scene.add(directionalLight)

        mesh1.updateMatrixWorld()
        mesh2.updateMatrixWorld()
        mesh3.updateMatrixWorld()

        // Raycaster
        const raycaster = new THREE.Raycaster()
        // const rayOrigin = new THREE.Vector3(-3, 0, 0)
        // const rayDirection = new THREE.Vector3(10, 0, 0)
        // rayDirection.normalize() // ALWAYS NORMALIZE 
        // raycaster.set(rayOrigin, rayDirection)

        // const intersects = raycaster.intersectObjects(meshes)
        // console.log(intersects)

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

        // Mouse
        const mouse = new THREE.Vector2()

        const handleMouseMove = (event) => {
            mouse.x = event.clientX / window.innerWidth * 2 - 1
            mouse.y = - event.clientY / window.innerHeight * 2 + 1
            // console.log(mouse.y)
            // Browsers can fire the mousemouse event FASTER than the framerate
        }
        window.addEventListener('mousemove', handleMouseMove);

        const handleClick = (event) => {
            if (currentIntersect) {
                if (currentIntersect.object === mesh1) {
                    console.log('clicked on mesh1')
                } else if (currentIntersect.object === mesh2) {
                    console.log('clicked on mesh2')
                } else if (currentIntersect.object === mesh3) {
                    console.log('clicked on mesh3')
                }
            }
        }
        window.addEventListener('click', handleClick);

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

        let currentIntersect = null

        // --------- Animate function ---------
        const animate = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
            mesh1.position.y = Math.sin(elapsedTime + 2)
            mesh1.rotation.x -= rotation / 2
            mesh2.position.y = Math.sin(elapsedTime + 1)
            mesh2.rotation.x += rotation / 2
            mesh3.position.y = Math.sin(elapsedTime + 3)
            mesh3.rotation.x += rotation / 2

            raycaster.setFromCamera(mouse, camera)


            // const rayOrigin = new THREE.Vector3(-3, 0, 0)
            // const rayDirection = new THREE.Vector3(10, 0, 0)
            // rayDirection.normalize() // ALWAYS NORMALIZE 
            // raycaster.set(rayOrigin, rayDirection)
            const intersects = raycaster.intersectObjects(meshes)

            for (const mesh of meshes) {
                mesh.material.color.set('red')
            }

            for (const intersect of intersects) {
                intersect.object.material.color.set('pink')
            }

            if (intersects.length) {
                if (currentIntersect == null) {
                    console.log('mouseenter')
                }
                currentIntersect = intersects[0]
            } else {
                if (currentIntersect) {
                    console.log('mouse leave')
                }

                currentIntersect = null
            }

            if (duckModel) {
                const modelIntersects = raycaster.intersectObject(duckModel)
                // console.log(modelIntersects)
                if (modelIntersects.length) {
                    // console.log('DGSDG')
                    duckModel.scale.set(1.2, 1.2, 1.2)
                } else {
                    duckModel.scale.set(1, 1, 1)
                }
            }


            // console.log(intersects)

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
            window.removeEventListener('mousemove', handleMouseMove);

        };

    }, [])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default RaycasterLesson