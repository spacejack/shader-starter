import * as THREE from './vendor/three.module.js'

let container
let camera, scene, renderer

const uniforms = {
	time: {value: 1},
	resolution: {value: [640, 480]}
}

function init (vertexShader, fragmentShader) {
	container = document.getElementById('container')
	camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
	scene = new THREE.Scene()

	const geometry = new THREE.PlaneBufferGeometry(2, 2)
	const material = new THREE.ShaderMaterial({
		uniforms, vertexShader, fragmentShader
	})
	const mesh = new THREE.Mesh(geometry, material)
	scene.add(mesh)

	renderer = new THREE.WebGLRenderer()
	renderer.setPixelRatio(window.devicePixelRatio)
	container.appendChild(renderer.domElement)

	onWindowResize()
	window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
	const w = window.innerWidth
	const h = window.innerHeight
	renderer.setSize(w, h)
	uniforms.resolution.value = [w, h]
}

function animate (timestamp) {
	uniforms.time.value = timestamp / 1000
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
}

async function run() {
	let r = await fetch('./shader/vertex.glsl' + '?t=' + Date.now()) // (appends cache-buster)
	const vshader = await r.text()
	r = await fetch('./shader/fragment.glsl' + '?t=' + Date.now())
	const fshader = await r.text()
	init(vshader, fshader)
}

run().then(() => {
	requestAnimationFrame(animate)
}).catch(err => {
	console.error(err.stack)
})
