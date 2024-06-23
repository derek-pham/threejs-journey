import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import Stats from 'stats.js';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

const PerformanceTipsLesson = () => {
    const canvasRef = useRef();
    let animateId;

    useEffect(() => {
        const stats = new Stats()
        stats.showPanel(0)
        document.body.append(stats.dom)

        // Settings Objects for GUI
        const settingsObj = {

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
        const textureLoader = new THREE.TextureLoader()
        const displacementTexture = textureLoader.load('/textures/displacementMap.png')


        // Geometry
        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // Material
        const material = new THREE.MeshStandardMaterial({
            color: 0xc863e3,
        })

        //Mesh Object
        const cube = new THREE.Mesh(geometry, material)
        cube.position.x = -2.5
        cube.castShadow = true
        scene.add(cube)

        const torus = new THREE.Mesh(
            new THREE.TorusKnotGeometry(4.5, 1.5, 80, 10),
            material
        )
        torus.geometry.scale(0.1, 0.1, 0.1)
        torus.material.roughness = 0
        torus.castShadow = true
        scene.add(torus)

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.75, 16, 16),
            material
        )
        sphere.position.x = 2.5
        sphere.castShadow = true
        scene.add(sphere)

        // Tip 18
        // const geometries = []
        // for (let i = 0; i < 50; i++) {
        //     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
        //     geometry.rotateX((Math.random() - 0.5) * Math.PI*2)
        //     geometry.rotateY((Math.random() - 0.5) * Math.PI*2)
        //     geometry.translate(
        //         (Math.random() - 0.5) * 10,
        //         (Math.random() - 0.5) * 10,
        //         (Math.random() - 0.5) * 10,
        //     )
        //     geometries.push(geometry)
        // }
        // const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        // const mesh = new THREE.Mesh(mergedGeometry, material)
        // scene.add(mesh)

        // // Tip 22
        // const tgeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

        // const tmaterial = new THREE.MeshNormalMaterial()
        // const mesh = new THREE.InstancedMesh(tgeometry, tmaterial, 50)
        // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        // scene.add(mesh)

        // for (let i = 0; i < 50; i++) {
        //     const matrix = new THREE.Matrix4()

        //     const position = new THREE.Vector3(
        //         (Math.random() - 0.5) * 10,
        //         (Math.random() - 0.5) * 10,
        //         (Math.random() - 0.5) * 10,
        //     )

        //     const quaternion = new THREE.Quaternion()
        //     quaternion.setFromEuler(new THREE.Euler((Math.random() - 0.5) * Math.PI*2,
        //     (Math.random() - 0.5) * Math.PI*2),0)

        //     matrix.makeRotationFromQuaternion(quaternion)    
        //     matrix.setPosition(position)

        //     mesh.setMatrixAt(i, matrix)
        // }

        // // Tip 31, 32, 34 and 35
        const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256)

        const shaderMaterial = new THREE.ShaderMaterial({
            precision: 'lowp',
            uniforms:
            {
                uDisplacementTexture: { value: displacementTexture },
                uDisplacementStrength: { value: 1.5 }
            },
            vertexShader: `
        uniform sampler2D uDisplacementTexture;
        uniform float uDisplacementStrength;

        varying vec3 vColor;

        void main()
        {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            // Position
            float elevation = texture2D(uDisplacementTexture, uv).r;
            elevation = clamp(elevation,0.5,1.0);
            modelPosition.y += elevation * uDisplacementStrength;
            gl_Position = projectionMatrix * viewMatrix * modelPosition;

            // Color
            float colorElevation = max(elevation,0.25);
            colorElevation = clamp(elevation,0.25,1.0);

            vec3 finalColor = mix(vec3(1.0, 0.1, 0.1), vec3(0.1, 0.0, 0.5), colorElevation);

            vColor = finalColor;
        }
    `,
            fragmentShader: `
        uniform sampler2D uDisplacementTexture;

        varying vec3 vColor;

        void main()
        {
            gl_FragColor = vec4(vColor,1.0);
        }
    `
        })

        const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
        shaderMesh.rotation.x = - Math.PI * 0.5
        scene.add(shaderMesh)

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10), material)
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        plane.position.y = -1
        scene.add(plane)

        // Camera
        const camera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height)
        camera.position.set(0, 4, 4)
        scene.add(camera)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        gui.add(ambientLight, 'intensity').min(-5).max(1).step(0.001).name('ambientLight')
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.castShadow = true
        directionalLight.position.z = 1
        gui.add(directionalLight, 'intensity').min(0).max(50).step(0.1).name('directionalLight')
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
            stats.begin()
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - oldElapsedTime
            oldElapsedTime = elapsedTime

            controls.update()
            renderer.render(scene, camera)
            animateId = window.requestAnimationFrame(animate);
            stats.end()
        }
        animate()

        // --------- Clean up function ---------
        return () => {
            window.cancelAnimationFrame(animateId);
            renderer.dispose();
            gui.destroy();
            window.removeEventListener('resize', handleResize);
            document.body.removeChild(stats.dom);
        };

    }, [])


    return (
        <>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0 }} />
        </>
    )
}

export default PerformanceTipsLesson