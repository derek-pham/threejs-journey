import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import * as CANNON from 'cannon-es'

const PhysicsLesson = () => {
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
        const geometry = new THREE.SphereGeometry(0.7, 16, 16)

        // Material
        const material = new THREE.MeshStandardMaterial({ color: 0xc863e3 })

        //Sounds 
        const hitSound = new Audio('/sounds/hit.mp3')

        function playHitSound(collision) {
            const impactStrength = collision.contact.getImpactVelocityAlongNormal()
            // console.log(impactStrength)

            if (impactStrength > 1.5) {
                hitSound.volume = Math.random()
                hitSound.currentTime = 0
                hitSound.play()
            }

        }

        //Mesh Object
        const mesh = new THREE.Mesh(geometry, material)
        // scene.add(mesh)
        const meshDebug = { color: '#c863e3' }
        gui.addColor(meshDebug, 'color').name("Colour")
            .onChange(() => mesh.material.color.set(meshDebug.color))
        mesh.position.y = 1.3
        mesh.castShadow = true


        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.receiveShadow = true
        plane.rotation.x = Math.PI / 2
        plane.rotation.y = Math.PI
        plane.position.y = -1

        scene.add(plane)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(0, 1, 3)
        scene.add(camera);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x00ffcf, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 20;
        scene.add(directionalLight);

        const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
        scene.add(cameraHelper)

        // Controls
        const controls = new OrbitControls(camera, canvas)


        // -----CREATE A PHYSICS WORLD-----
        const world = new CANNON.World()
        world.broadphase = new CANNON.SAPBroadphase(world)
        world.allowSleep = true
        world.gravity.set(0, -9.82, 0)

        // MATERIAL
        const defaultMaterial = new CANNON.Material('default')

        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {
                friction: 0.9,
                restitution: 0.7

            }
        )
        world.addContactMaterial(defaultContactMaterial)
        world.defaultContactMaterial = defaultContactMaterial

        // Create sphere
        // const sphereShape = new CANNON.Sphere(0.7)
        // const sphereBody = new CANNON.Body({
        //     mass: 1,
        //     position: new CANNON.Vec3(0, 3, 0),
        //     shape: sphereShape
        // })        
        // sphereBody.applyLocalForce(new CANNON.Vec3(100,0,0),new CANNON.Vec3(0,0,0),)
        // world.addBody(sphereBody)

        const floorShape = new CANNON.Plane()
        const floorBody = new CANNON.Body({
            mass: 0, // 0 by default
            position: new CANNON.Vec3(0, -1, 0)
        })
        floorBody.addShape(floorShape)

        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
        world.addBody(floorBody)

        // Renderer 
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        })
        renderer.setSize(sizes.width, sizes.height) // Set size of renderer
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // renderer.render(scene, camera) // Initiate rendering the scene

        const objectsTemplate = []

        const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
        const sphereMaterial = new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
            color: '#c863e3'
        })

        // ---- CREATE SPHERE -----
        const createSphere = (radius, position) => {
            // Three.js Mesh
            const mesh = new THREE.Mesh(
                sphereGeometry,
                sphereMaterial
            )
            mesh.scale.set(radius, radius, radius);
            mesh.castShadow = true
            mesh.position.copy(position)
            scene.add(mesh)

            // Cannon.js Body
            const shape = new CANNON.Sphere(radius)
            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(0, 3, 0),
                shape,
                material: defaultMaterial
            })
            body.position.copy(position)
            body.addEventListener('collide', playHitSound)

            world.addBody(body)

            objectsTemplate.push({
                mesh,
                body
            })

            renderer.shadowMap.needsUpdate = true;
        }
        // createSphere(0.5, { x: 0, y: 3, z: 0 })
        // createSphere(0.5, { x: 2, y: 3, z: 0 })
        createSphere(0.5, { x: 2, y: 3, z: -3 })

        // Box
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
        const boxMaterial = new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
            color: '#c863e3'
        })

        const createBox = (width, height, depth, position) => {
            // Three.js Mesh
            const mesh = new THREE.Mesh(
                boxGeometry,
                boxMaterial
            )
            mesh.scale.set(width, height, depth);
            mesh.castShadow = true
            mesh.position.copy(position)
            scene.add(mesh)

            // Cannon.js Body
            const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(0, 3, 0),
                shape: shape,
                material: defaultMaterial
            })
            body.addEventListener('collide', playHitSound)
            body.position.copy(position)
            world.addBody(body)

            objectsTemplate.push({
                mesh,
                body
            })

            renderer.shadowMap.needsUpdate = true;
        }


        const debugObject = {}

        debugObject.createSphere = () => {
            createSphere(Math.random() * 0.5, { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })

        }
        gui.add(debugObject, 'createSphere')

        debugObject.createBox = () => {
            createBox(Math.random() + 0.15, Math.random() + 0.15, Math.random() + 0.15, { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })

        }
        gui.add(debugObject, 'createBox')  

        debugObject.reset = () => {
            console.log('reet')
            for (const object of objectsTemplate) {
                object.body.removeEventListener('collide', playHitSound)
                world.removeBody(object.body)
                scene.remove(object.mesh)
            }
            objectsTemplate.splice(0,objectsTemplate.length)
        }


        gui.add(debugObject, 'reset')

        // Clock
        const clock = new THREE.Clock()
        let oldElapsedTime = 0;

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
            // mesh.rotation.y += rotation
            // mesh.rotation.x -= rotation / 2
            // Update physics world
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime
            // sphereBody.applyForce(new CANNON.Vec3(-0.05,0,0),sphereBody.position)

            world.step(1 / 60, deltaTime, 3)
            // mesh.position.copy(sphereBody.position)
            for (const object of objectsTemplate) {
                object.mesh.position.copy(object.body.position);
                object.mesh.quaternion.copy(object.body.quaternion);
            }
            renderer.shadowMap.needsUpdate = true;

            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            renderer.dispose();
            gui.destroy()
        };

    }, [])

    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default PhysicsLesson