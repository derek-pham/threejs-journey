/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'

export default function CustomObject() {
    const bufferRef = useRef()
    const verticesCount = 10 * 3

    const positionsMemo = useMemo(() => {
        const positions = new Float32Array(verticesCount * 3)

        for (let i = 0; i < verticesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 3
        }

        return positions
    }, [verticesCount])

    useEffect(() => {
        bufferRef.current.computeVertexNormals()
    }, [])

    return <mesh position={[0, 1, 0]}>
        <bufferGeometry ref={bufferRef}>
            <bufferAttribute
                attach={'attributes-position'}
                count={verticesCount}
                itemSize={3}
                array={positionsMemo}
            />
        </bufferGeometry>
        <meshStandardMaterial color={'red'} side={THREE.DoubleSide} />
    </mesh>
}