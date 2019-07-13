//@ts-check

import * as THREE from './vendor/three.module.js'

/**
 * HTML elements
 * @type {{container: HTMLElement | undefined; info: HTMLElement | undefined}}
 */
const dom = {container: undefined, info: undefined}
/** @type {THREE.OrthographicCamera} */
let camera
/** @type {*} */
let scene
/** @type {THREE.WebGLRenderer} */
let renderer

/** Values that are passed to shader every render */
const uniforms = {
	time: {value: 1},
	resolution: {value: [window.innerWidth, window.innerHeight]}
}

/**
 * Initialize THREE Renderer and Scene
 * @param {string} vertexShader
 * @param {string} fragmentShader
 */
function initRenderer (vertexShader, fragmentShader) {
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
	dom.container.appendChild(renderer.domElement)

	onWindowResize()
	window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
	const w = window.innerWidth
	const h = window.innerHeight
	renderer.setSize(w, h)
	uniforms.resolution.value = [w, h]
}

/**
 * Start the animation loop
 * @param {number} timestamp
 */
function animate (timestamp) {
	uniforms.time.value = timestamp / 1000
	renderer.render(scene, camera)
	requestAnimationFrame(animate)
}

/** @param {Response} r */
function decodeResponse (r) {
	return r.status >= 200 && r.status < 400 ? r.text()
		: Promise.reject(new Error(`HTTP error ${r.status}: ${r.url}`))
}

/** Load the shader sources, then set up the THREE Renderer */
async function init() {
	// Collect some needed DOM elements
	dom.container = document.querySelector('.container')
	if (dom.container == null) {
		throw new Error('.container element not found in dom')
	}
	dom.info = document.querySelector('.info')
	// cache buster value
	const t = Date.now()
	const [vshader, fshader] = await Promise.all([
		// append a cache-buster query string
		fetch(`./shader/vertex.glsl?t=${t}`).then(decodeResponse),
		fetch(`./shader/fragment.glsl?t=${t}`).then(decodeResponse)
	])
	initRenderer(vshader, fshader)
}

init().then(() => {
	requestAnimationFrame(animate)
}).catch(err => {
	if (dom.info != null) {
		dom.info.textContent = err.message
	}
	console.error(err.stack)
})
