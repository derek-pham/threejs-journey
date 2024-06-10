import { useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TransformObjectsLesson = () => {
    const canvasRef = useRef();

    // Canvas
    const canvas = canvasRef.current

    // Scene
    const scene = new THREE.Scene();

    // Creating a group
    const group = new THREE.Group()
    scene.add(group)

    // Geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    // Material
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    // MAKING CUBES TO ADD TO THE GROUP
    const cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color: 0xff0000})
    )
    group.add(cube1)

    const cube2 = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color: 0x00ff00})
    )
    cube2.position.set(0.7, 0.7, -1)
    group.add(cube2)

    const cube3 = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({color: 0x0000ff})
    )
    cube3.position.set(1, 2, -1)
    group.add(cube3)

    // Change position of group
    group.position.y=1
    group.scale.y=1.2
    group.rotation.y = 2

    //Mesh Object
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0.7, 0.7, -1)
    // scene.add(mesh)

    // Camera
    const sizes = { width: 800, height: 600 }
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
    camera.position.set(1, 1, 3)
    scene.add(camera)

    // Creating a AxisHelper
    const axisHelper = new THREE.AxesHelper(0.2)
    scene.add(axisHelper)

    // Changing scale
    mesh.scale.x = 2
    mesh.scale.y = 0.5
    mesh.scale.z = 0.7

    // Changing rotation
    mesh.rotation.z = Math.PI * 0.1
    mesh.rotation.y = Math.PI * 0.7

    // LookAt
    // camera.lookAt(mesh.position)

    // Renderer 
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height) // Set size of renderer
    renderer.render(scene, camera) // Initiate rendering the scene

    return (
        <>
            <canvas ref={canvasRef} />
        </>
    )
}

export default TransformObjectsLesson