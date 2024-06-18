import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const ModifiedMaterialsLesson = () => {
    const canvasRef = useRef();
    let rotation = 0.003;
    let rotationTrigger = false;
    let animateId;

    useEffect(() => {
        // GUI
        const gui = new GUI();

        /**
         * Loaders
         */
        const textureLoader = new THREE.TextureLoader()
        const gltfLoader = new GLTFLoader()
        const cubeTextureLoader = new THREE.CubeTextureLoader()

        // Canvas
        const canvas = canvasRef.current;

        // Scene
        const scene = new THREE.Scene();

        /**
        * Update all materials
        */
        const updateAllMaterials = () => {
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMapIntensity = 1
                    child.material.needsUpdate = true
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
        }

        /**
         * Environment map
         */
        const environmentMap = cubeTextureLoader.load([
            '/environmentMaps/0/px.jpg',
            '/environmentMaps/0/nx.jpg',
            '/environmentMaps/0/py.jpg',
            '/environmentMaps/0/ny.jpg',
            '/environmentMaps/0/pz.jpg',
            '/environmentMaps/0/nz.jpg'
        ])

        scene.background = environmentMap
        scene.environment = environmentMap

        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Textures
        const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
        mapTexture.colorSpace = THREE.SRGBColorSpace
        const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

        // Material
        const depthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking
        })
        const material = new THREE.MeshStandardMaterial({
            map: mapTexture,
            normalMap: normalTexture
        })
        const customUniforms = {
            uTime: { value: 0 }
        }

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = customUniforms.uTime
            shader.vertexShader = shader.vertexShader.replace('#include <common>', `
                #include <common>

                uniform float uTime;

                mat2 get2dRotateMatrix(float _angle) {
                    return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                }
            `)
            shader.vertexShader = shader.vertexShader.replace(
                '#include <beginnormal_vertex>',
                `
                    #include <beginnormal_vertex>
        
                    float angle = sin(position.y + uTime) * 0.9;
                    mat2 rotateMatrix = get2dRotateMatrix(angle);
        
                    objectNormal.xz = rotateMatrix * objectNormal.xz;
                `
            )
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                #include <begin_vertex>

                transformed.xz = rotateMatrix * transformed.xz;
            `)
        }

        depthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = customUniforms.uTime
            shader.vertexShader = shader.vertexShader.replace('#include <common>', `
                #include <common>

                uniform float uTime;

                mat2 get2dRotateMatrix(float _angle) {
                    return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                }
            `)
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
                #include <begin_vertex>

                float angle = sin(position.y + uTime) * 0.9;
                mat2 rotateMatrix = get2dRotateMatrix(angle);

                transformed.xz = rotateMatrix * transformed.xz;
            `)
        }

        /**
         * Models
         */
        gltfLoader.load(
            '/models/LeePerrySmith/LeePerrySmith.glb',
            (gltf) => {
                // Model
                const mesh = gltf.scene.children[0]
                mesh.rotation.y = Math.PI * 0.5
                mesh.material = material
                mesh.customDepthMaterial = depthMaterial
                scene.add(mesh)

                // Update materials
                updateAllMaterials()
            }
        )

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 14, 10), new THREE.MeshStandardMaterial())
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI
        plane.position.y = -5.5
        plane.position.z = 4.5
        scene.add(plane)

        // Camera
        const sizes = { width: window.innerWidth, height: window.innerHeight }
        const camera = new THREE.PerspectiveCamera(110, sizes.width / sizes.height)
        camera.position.set(4, 2, -3.5)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.far = 15
        directionalLight.shadow.normalBias = 0.05
        directionalLight.position.set(0.25, 2, - 2.25)
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

            customUniforms.uTime.value = elapsedTime

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

export default ModifiedMaterialsLesson