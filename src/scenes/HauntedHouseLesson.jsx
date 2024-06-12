import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import GUI from 'lil-gui'
import { Sky } from 'three/examples/jsm/Addons.js'

const HauntedHouseScene = () => {
    const canvasRef = useRef()

    useEffect(() => {
        // Canvas
        const canvas = canvasRef.current

        // Scene
        const scene = new THREE.Scene()

        // GUI
        const gui = new GUI()

        // ----- Textures -----
        const textureLoader = new THREE.TextureLoader();
        // ~ Floor Texture
        const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.jpg')
        const floorColorTexture = textureLoader.load('/textures/floor/coastsandrock/coast_sand_rocks_02_diff_1k.jpg')
        const floorARMTexture = textureLoader.load('/textures/floor/coastsandrock/coast_sand_rocks_02_arm_1k.jpg')
        const floorNormalTexture = textureLoader.load('/textures/floor/coastsandrock/coast_sand_rocks_02_nor_gl_1k.jpg')
        const floorDisplacementTexture = textureLoader.load('/textures/floor/coastsandrock/coast_sand_rocks_02_disp_1k.jpg')
        floorColorTexture.repeat.set(8, 8)
        floorColorTexture.wrapS = THREE.RepeatWrapping
        floorColorTexture.wrapT = THREE.RepeatWrapping
        floorColorTexture.colorSpace = THREE.SRGBColorSpace

        floorARMTexture.repeat.set(8, 8)
        floorARMTexture.wrapS = THREE.RepeatWrapping
        floorARMTexture.wrapT = THREE.RepeatWrapping

        floorNormalTexture.repeat.set(8, 8)
        floorNormalTexture.wrapS = THREE.RepeatWrapping
        floorNormalTexture.wrapT = THREE.RepeatWrapping

        floorDisplacementTexture.repeat.set(8, 8)
        floorDisplacementTexture.wrapS = THREE.RepeatWrapping
        floorDisplacementTexture.wrapT = THREE.RepeatWrapping

        // ~ Wall Texture
        const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg')
        const wallARMTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg')
        const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg')
        wallColorTexture.colorSpace = THREE.SRGBColorSpace

        // ~ Roof Texture
        const roofColorTexture = textureLoader.load('/textures/roof_slates_02_1k/roof_slates_02_diff_1k.jpg')
        const roofARMTexture = textureLoader.load('/textures/roof_slates_02_1k/roof_slates_02_arm_1k.jpg')
        const roofNormalTexture = textureLoader.load('/textures/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg')
        roofColorTexture.colorSpace = THREE.SRGBColorSpace

        roofColorTexture.repeat.set(3, 1)
        roofARMTexture.repeat.set(3, 1)
        roofNormalTexture.repeat.set(3, 1)

        roofColorTexture.wrapS = THREE.RepeatWrapping
        roofARMTexture.wrapS = THREE.RepeatWrapping
        roofNormalTexture.wrapS = THREE.RepeatWrapping

        // ~ Bush Texture
        const bushColorTexture = textureLoader.load('/textures/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
        const bushARMTexture = textureLoader.load('/textures/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')
        const bushNormalTexture = textureLoader.load('/textures/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')
        bushColorTexture.colorSpace = THREE.SRGBColorSpace

        // ~ Grave Texture
        const graveColorTexture = textureLoader.load('/textures/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg')
        const graveARMTexture = textureLoader.load('/textures/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg')
        const graveNormalTexture = textureLoader.load('/textures/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg')
        graveColorTexture.colorSpace = THREE.SRGBColorSpace

        graveColorTexture.repeat.set(0.3, 0.4)
        graveARMTexture.repeat.set(0.3, 0.4)
        graveNormalTexture.repeat.set(0.3, 0.4)

        // ~ Door Texture
        const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
        const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
        const doorAOTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
        const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
        const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
        const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
        const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
        doorColorTexture.colorSpace = THREE.SRGBColorSpace

        // Materials
        const floorMat = new THREE.MeshStandardMaterial({
            alphaMap: floorAlphaTexture,
            transparent: true,
            map: floorColorTexture,
            aoMap: floorARMTexture,
            roughnessMap: floorARMTexture,
            metalnessMap: floorARMTexture,
            normalMap: floorNormalTexture,
            displacementMap: floorDisplacementTexture,
            displacementScale: 0.3,
            displacementBias: -0.15
        })
        const bushMaterial = new THREE.MeshStandardMaterial({
            color: '#ccffcc',
            map: bushColorTexture,
            aoMap: bushARMTexture,
            roughnessMap: bushARMTexture,
            metalnessMap: bushARMTexture,
            normalMap: bushNormalTexture,
        })
        const graveMaterial = new THREE.MeshStandardMaterial({
            map: graveColorTexture,
            aoMap: graveARMTexture,
            roughnessMap: graveARMTexture,
            metalnessMap: graveARMTexture,
            normalMap: graveNormalTexture,
        })

        // Geometries
        const floorPlane = new THREE.PlaneGeometry(20, 20, 100, 100)
        const bushGeometry = new THREE.SphereGeometry(1, 16, 10)
        const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)

        // Groupsk
        const house = new THREE.Group()
        scene.add(house)
        const graves = new THREE.Group()
        scene.add(graves)

        // ----- MESHES -----
        // ~ House
        const floorMesh = new THREE.Mesh(floorPlane, floorMat)
        floorMesh.rotation.x = -Math.PI / 2
        house.add(floorMesh)
        gui.add(floorMesh.material, 'displacementScale').min(0).max(1).step(0.01).name('displacementScale')
        gui.add(floorMesh.material, 'displacementBias').min(-1).max(1).step(0.01).name('displacementBias')

        const wallsMesh = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2.5, 4),
            new THREE.MeshStandardMaterial({
                map: wallColorTexture,
                aoMap: wallARMTexture,
                roughnessMap: wallARMTexture,
                metalnessMap: wallARMTexture,
                normalMap: wallNormalTexture
            })
        )
        wallsMesh.position.y += 1.25
        house.add(wallsMesh)

        const roofMesh = new THREE.Mesh(
            new THREE.ConeGeometry(3.5, 1.5, 4),
            new THREE.MeshStandardMaterial({
                map: roofColorTexture,
                aoMap: roofARMTexture,
                roughnessMap: roofARMTexture,
                metalnessMap: roofARMTexture,
                normalMap: roofNormalTexture
            })
        )
        roofMesh.position.y += 2.5 + 0.75
        roofMesh.rotation.y = Math.PI / 4
        house.add(roofMesh)

        const doorMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
            new THREE.MeshStandardMaterial({
                map: doorColorTexture,
                aoMap: doorAOTexture,
                roughnessMap: doorRoughnessTexture,
                metalnessMap: doorMetalnessTexture,
                normalMap: doorNormalTexture,
                alphaMap: doorAlphaTexture,
                transparent: true,
                displacementMap: doorHeightTexture,
                displacementScale: 0.15,
                displacementBias: -0.04

            })
        )
        doorMesh.position.y += 1
        doorMesh.position.z += 2.01
        house.add(doorMesh)

        // ~ Bushes
        const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush1.scale.setScalar(0.5)
        bush1.position.set(0.8, 0.2, 2.2)
        bush1.rotation.x = - 0.75
        house.add(bush1)

        const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush2.scale.setScalar(0.25)
        bush2.position.set(1.4, 0.1, 2.1)
        bush2.rotation.x = - 0.75
        house.add(bush2)

        const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush3.scale.setScalar(0.4)
        bush3.position.set(-0.8, 0.1, 2.2)
        bush3.rotation.x = - 0.75
        house.add(bush3)

        const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
        bush4.scale.setScalar(0.15)
        bush4.position.set(-1, 0.05, 2.6)
        bush4.rotation.x = - 0.75
        house.add(bush4)

        // ~ Graves
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 3 + Math.random() * 4
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            const graveMesh = new THREE.Mesh(graveGeometry, graveMaterial)
            graveMesh.position.x = x
            graveMesh.position.z = z
            graveMesh.position.y = Math.random() * 0.4
            graveMesh.rotation.x = (Math.random() - 0.5) * 0.4
            graveMesh.rotation.y = (Math.random() - 0.5) * 0.6
            graveMesh.rotation.z = (Math.random() - 0.5) * 0.4
            graves.add(graveMesh)
        }

        // Camera
        const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100)
        camera.position.y = 4
        camera.position.z = 6

        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0x86cdff, 0.275)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0x86cdff, 1)
        directionalLight.position.set(3, 2, -8)
        scene.add(directionalLight)

        const doorLight = new THREE.PointLight('#ff7d46', 5)
        doorLight.position.set(0, 2.2, 2.5)
        house.add(doorLight)

        // ~ Ghost Lights
        const ghost1 = new THREE.PointLight("#8800ff", 6)
        const ghost2 = new THREE.PointLight("#ff0088", 6)
        const ghost3 = new THREE.PointLight("#ff0000", 6)
        scene.add(ghost1, ghost2, ghost3)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.update();

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.render(scene, camera)

        // Shadows
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // ~ Cast and receive
        directionalLight.castShadow = true
        ghost1.castShadow = true
        ghost2.castShadow = true
        ghost3.castShadow = true

        wallsMesh.castShadow = true
        wallsMesh.receiveShadow = true
        roofMesh.castShadow = true
        floorMesh.receiveShadow = true
        for (const grave of graves.children) {
            grave.castShadow = true
            grave.receiveShadow = true
        }

        // Sky
        const sky = new Sky()
        scene.add(sky)
        sky.scale.set(100, 100, 100)
        sky.material.uniforms['turbidity'].value = 10
        sky.material.uniforms['rayleigh'].value = 3
        sky.material.uniforms['mieCoefficient'].value = 0.1
        sky.material.uniforms['mieDirectionalG'].value = 0.95
        sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

        directionalLight.shadow.mapSize.width = 256
        directionalLight.shadow.mapSize.height = 256
        directionalLight.shadow.camera.top = 8
        directionalLight.shadow.camera.right = 8
        directionalLight.shadow.camera.bottom = -8
        directionalLight.shadow.camera.left = -8
        directionalLight.shadow.camera.near = 1
        directionalLight.shadow.camera.far = 20

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.render(scene, camera)
        })

        // Fog
        scene.fog = new THREE.FogExp2('#02423f', 0.1)

        // Clock
        const clock = new THREE.Clock()

        // --------- Animate function ---------
        function animate() {
            const elapsedTime = clock.getElapsedTime()

            //Ghost
            const ghost1Angle = elapsedTime * 0.5
            ghost1.position.x = Math.cos(ghost1Angle) * 4
            ghost1.position.z = Math.sin(ghost1Angle) * 4
            ghost1.position.y = Math.cos(ghost1Angle) * Math.cos(ghost1Angle * 2.34) * Math.cos(ghost1Angle * 3.15)
            const ghost2Angle = -elapsedTime * 0.5
            ghost2.position.x = Math.cos(ghost2Angle) * 5
            ghost2.position.z = Math.sin(ghost2Angle) * 5
            ghost2.position.y = Math.cos(ghost2Angle) * Math.cos(ghost2Angle * 2.34) * Math.cos(ghost2Angle * 3.15)
            const ghost3Angle = -elapsedTime * 0.23
            ghost3.position.x = Math.cos(ghost3Angle) * 6
            ghost3.position.z = Math.sin(ghost3Angle) * 6
            ghost3.position.y = Math.cos(ghost3Angle) * Math.cos(ghost3Angle * 2.34) * Math.cos(ghost3Angle * 3.15)


            controls.update();
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
        <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }}></canvas>
    )
}

export default HauntedHouseScene