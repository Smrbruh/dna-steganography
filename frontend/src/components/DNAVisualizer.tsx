import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { DNAStats } from '../types'
interface Props {
  stats: DNAStats | null
  isAnimating: boolean
}
const NUCLEOTIDE_COLORS: Record<string, number> = {
  A: 0xef4444,
  C: 0x22c55e,
  G: 0x3b82f6,
  T: 0xeab308,
}
const NUCLEOTIDE_COLORS_HOVER: Record<string, number> = {
  A: 0xff8888,
  C: 0x88ffaa,
  G: 0x88aaff,
  T: 0xffee44,
}
export default function DNAVisualizer({ stats, isAnimating }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number>(0)
  const nucleotidesRef = useRef<THREE.Mesh[]>([])
  const hoveredRef = useRef<THREE.Mesh | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)
  const angleRef = useRef(0)
  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050a14)
    scene.fog = new THREE.FogExp2(0x050a14, 0.035)
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200)
    camera.position.set(0, 0, 18)
    cameraRef.current = camera
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    const ambientLight = new THREE.AmbientLight(0x112244, 1.5)
    scene.add(ambientLight)
    const light1 = new THREE.PointLight(0x00d4ff, 3, 50)
    light1.position.set(5, 10, 5)
    scene.add(light1)
    const light2 = new THREE.PointLight(0x7c3aed, 3, 50)
    light2.position.set(-5, -10, -5)
    scene.add(light2)
    const light3 = new THREE.DirectionalLight(0xffffff, 0.5)
    light3.position.set(0, 20, 10)
    scene.add(light3)
    buildHelix(scene, stats?.sequence ?? null)
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(nucleotidesRef.current)
      if (hoveredRef.current) {
        const mat = hoveredRef.current.material as THREE.MeshStandardMaterial
        const nuc = hoveredRef.current.userData.nucleotide as string
        mat.color.setHex(NUCLEOTIDE_COLORS[nuc])
        mat.emissiveIntensity = 0.3
        hoveredRef.current = null
        setTooltip(null)
      }
      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        const nuc = mesh.userData.nucleotide as string
        mat.color.setHex(NUCLEOTIDE_COLORS_HOVER[nuc])
        mat.emissiveIntensity = 1.0
        hoveredRef.current = mesh
        const nucleotideNames: Record<string, string> = {
          A: 'Аденин',
          C: 'Цитозин',
          G: 'Гуанин',
          T: 'Тимин',
        }
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 30,
          label: `${nuc} — ${nucleotideNames[nuc]}`,
        })
      }
    }
    container.addEventListener('mousemove', onMouseMove)
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)
    let time = 0
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      time += 0.008
      angleRef.current += 0.003
      const r = 14
      camera.position.x = Math.sin(angleRef.current) * r
      camera.position.z = Math.cos(angleRef.current) * r
      camera.position.y = Math.sin(time * 0.3) * 2
      camera.lookAt(0, 0, 0)
      light1.position.x = Math.sin(time * 0.5) * 8
      light1.position.z = Math.cos(time * 0.5) * 8
      light2.position.x = -Math.sin(time * 0.5) * 8
      light2.position.z = -Math.cos(time * 0.5) * 8
      renderer.render(scene, camera)
    }
    animate()
    return () => {
      cancelAnimationFrame(frameRef.current)
      container.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])
  useEffect(() => {
    if (!sceneRef.current) return
    nucleotidesRef.current.forEach((m) => {
      sceneRef.current!.remove(m)
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    })
    nucleotidesRef.current = []
    buildHelix(sceneRef.current, stats?.sequence ?? null)
  }, [stats])
  const buildHelix = (scene: THREE.Scene, sequence: string | null) => {
    const seq = sequence ?? 'ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT'
    const displaySeq = seq.slice(0, 120)
    const stepsPerTurn = 10
    const radius = 2.5
    const rise = 0.55
    const totalSteps = displaySeq.length
    const sphereGeo = new THREE.SphereGeometry(0.22, 12, 12)
    const backboneGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 8)
    const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8)
    const positions1: THREE.Vector3[] = []
    const positions2: THREE.Vector3[] = []
    for (let i = 0; i < totalSteps; i++) {
      const angle = (i / stepsPerTurn) * Math.PI * 2
      const y = i * rise - (totalSteps * rise) / 2
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius
      positions1.push(new THREE.Vector3(x1, y, z1))
      positions2.push(new THREE.Vector3(x2, y, z2))
      const nuc1 = displaySeq[i] as keyof typeof NUCLEOTIDE_COLORS
      const complement: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' }
      const nuc2 = complement[nuc1] as keyof typeof NUCLEOTIDE_COLORS
      const mat1 = new THREE.MeshStandardMaterial({
        color: NUCLEOTIDE_COLORS[nuc1],
        emissive: new THREE.Color(NUCLEOTIDE_COLORS[nuc1]),
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.2,
      })
      const mat2 = new THREE.MeshStandardMaterial({
        color: NUCLEOTIDE_COLORS[nuc2],
        emissive: new THREE.Color(NUCLEOTIDE_COLORS[nuc2]),
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.2,
      })
      const sphere1 = new THREE.Mesh(sphereGeo, mat1)
      sphere1.position.set(x1, y, z1)
      sphere1.userData.nucleotide = nuc1
      sphere1.userData.index = i
      scene.add(sphere1)
      nucleotidesRef.current.push(sphere1)
      const sphere2 = new THREE.Mesh(sphereGeo, mat2)
      sphere2.position.set(x2, y, z2)
      sphere2.userData.nucleotide = nuc2
      sphere2.userData.index = i
      scene.add(sphere2)
      nucleotidesRef.current.push(sphere2)
      const mid = new THREE.Vector3((x1 + x2) / 2, y, (z1 + z2) / 2)
      const bondLength = new THREE.Vector3(x1, y, z1).distanceTo(new THREE.Vector3(x2, y, z2))
      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x334466,
        roughness: 0.5,
        metalness: 0.1,
        transparent: true,
        opacity: 0.7,
      })
      const bond = new THREE.Mesh(bondGeo, bondMat)
      bond.position.copy(mid)
      bond.scale.y = bondLength
      bond.lookAt(x2, y, z2)
      bond.rotateX(Math.PI / 2)
      scene.add(bond)
    }
    const backboneMat1 = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: new THREE.Color(0x003344),
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.6,
    })
    const backboneMat2 = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: new THREE.Color(0x220044),
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.6,
    })
    for (let i = 0; i < positions1.length - 1; i++) {
      const p1 = positions1[i]
      const p2 = positions1[i + 1]
      const seg1 = createSegment(backboneGeo, backboneMat1, p1, p2)
      scene.add(seg1)
      const q1 = positions2[i]
      const q2 = positions2[i + 1]
      const seg2 = createSegment(backboneGeo, backboneMat2, q1, q2)
      scene.add(seg2)
    }
  }
  const createSegment = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    from: THREE.Vector3,
    to: THREE.Vector3
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, mat)
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5)
    mesh.position.copy(mid)
    const len = from.distanceTo(to)
    mesh.scale.y = len
    mesh.lookAt(to)
    mesh.rotateX(Math.PI / 2)
    return mesh
  }
  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      {!isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-border font-mono text-sm">Загрузите файл для визуализации</p>
        </div>
      )}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-card border border-accent/40 text-accent font-mono text-xs px-3 py-1.5 rounded-lg shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs font-mono">
        {(['A', 'C', 'G', 'T'] as const).map((n) => {
          const colors: Record<string, string> = {
            A: 'bg-red-500',
            C: 'bg-green-500',
            G: 'bg-blue-500',
            T: 'bg-yellow-400',
          }
          const names: Record<string, string> = {
            A: 'Аденин',
            C: 'Цитозин',
            G: 'Гуанин',
            T: 'Тимин',
          }
          return (
            <div key={n} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${colors[n]}`} />
              <span className="text-gray-400">{n}</span>
              <span className="text-gray-600 hidden sm:inline">— {names[n]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}