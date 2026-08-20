<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  active?: boolean
}>()

type RenderTarget = {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer
  width: number
  height: number
}

type PingPong = {
  read: RenderTarget
  write: RenderTarget
}

type FluidSplat = {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  strength: number
}

type Programs = {
  velocitySplat: WebGLProgram
  dyeSplat: WebGLProgram
  velocityAdvect: WebGLProgram
  dyeAdvect: WebGLProgram
  display: WebGLProgram
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const colorImage = new Image()
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const hoverless = window.matchMedia('(hover: none)')

const SIM_WIDTH = 160
const TRAIL_LIFETIME = 4200

const vertexShader = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const velocitySplatShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec2 uForce;
uniform float uAspect;
uniform float uRadius;

void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float influence = exp(-dot(p, p) / uRadius);
  vec2 velocity = texture(uTarget, vUv).xy * 2.0 - 1.0;
  velocity = clamp(velocity + uForce * influence, -1.0, 1.0);
  outColor = vec4(velocity * 0.5 + 0.5, 0.0, 1.0);
}`

const dyeSplatShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform float uAspect;
uniform float uRadius;
uniform float uStrength;

void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  float influence = exp(-dot(p, p) / uRadius) * uStrength;
  float dye = max(texture(uTarget, vUv).r, influence);
  outColor = vec4(dye, dye, dye, 1.0);
}`

const velocityAdvectShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;

void main() {
  vec2 current = texture(uVelocity, vUv).xy * 2.0 - 1.0;
  vec2 coord = clamp(vUv - current * uTexelSize * uDt * 1.65, 0.0, 1.0);
  vec2 velocity = (texture(uVelocity, coord).xy * 2.0 - 1.0) * uDissipation;
  outColor = vec4(velocity * 0.5 + 0.5, 0.0, 1.0);
}`

const dyeAdvectShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;

void main() {
  vec2 velocity = texture(uVelocity, vUv).xy * 2.0 - 1.0;
  vec2 coord = clamp(vUv - velocity * uTexelSize * uDt * 1.65, 0.0, 1.0);
  float centre = texture(uDye, coord).r;
  float neighbours = (
    texture(uDye, coord + vec2(uTexelSize.x, 0.0)).r +
    texture(uDye, coord - vec2(uTexelSize.x, 0.0)).r +
    texture(uDye, coord + vec2(0.0, uTexelSize.y)).r +
    texture(uDye, coord - vec2(0.0, uTexelSize.y)).r
  ) * 0.25;
  float dye = mix(centre, neighbours, 0.075) * uDissipation;
  outColor = vec4(dye, dye, dye, 1.0);
}`

const displayShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uImage;
uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform vec2 uCoverScale;

void main() {
  float dye = texture(uDye, vUv).r;
  float mask = smoothstep(0.025, 0.22, dye);
  vec2 imageUv = vUv * uCoverScale + (1.0 - uCoverScale) * 0.5;
  vec4 image = texture(uImage, clamp(imageUv, 0.001, 0.999));
  outColor = vec4(image.rgb, image.a * mask);
}`

let gl: WebGL2RenderingContext | null = null
let programs: Programs | null = null
let vertexArray: WebGLVertexArrayObject | null = null
let vertexBuffer: WebGLBuffer | null = null
let imageTexture: WebGLTexture | null = null
let velocity: PingPong | null = null
let dye: PingPong | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame: number | null = null
let imageReady = false
let cssWidth = 1
let cssHeight = 1
let pixelRatio = 1
let lastPointerX = -1
let lastPointerY = -1
let pointerDown = false
let lastFrameTime = 0
let lastInteractionTime = 0
let autoSweepStart = 0
let lastAutoX = -1
let lastAutoY = -1
let simulationCleared = true

const pendingSplats: FluidSplat[] = []

const swap = (pair: PingPong) => {
  const previousRead = pair.read
  pair.read = pair.write
  pair.write = previousRead
}

const compileShader = (type: number, source: string) => {
  if (!gl) throw new Error('WebGL indisponível')
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Não foi possível criar o shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Erro desconhecido no shader'
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

const createProgram = (fragmentSource: string) => {
  if (!gl) throw new Error('WebGL indisponível')
  const vertex = compileShader(gl.VERTEX_SHADER, vertexShader)
  const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!program) throw new Error('Não foi possível criar o programa WebGL')

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Erro ao conectar o programa WebGL'
    gl.deleteProgram(program)
    throw new Error(message)
  }

  return program
}

const createTarget = (width: number, height: number, neutralVelocity = false): RenderTarget => {
  if (!gl) throw new Error('WebGL indisponível')
  const texture = gl.createTexture()
  const framebuffer = gl.createFramebuffer()
  if (!texture || !framebuffer) throw new Error('Não foi possível criar o campo fluido')

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.viewport(0, 0, width, height)
  gl.clearColor(neutralVelocity ? 0.5 : 0, neutralVelocity ? 0.5 : 0, 0, neutralVelocity ? 1 : 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  return { texture, framebuffer, width, height }
}

const bindTexture = (program: WebGLProgram, name: string, texture: WebGLTexture, unit: number) => {
  if (!gl) return
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(gl.getUniformLocation(program, name), unit)
}

const drawTo = (target: RenderTarget | null, width: number, height: number) => {
  if (!gl) return
  gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer || null)
  gl.viewport(0, 0, width, height)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

const clearSimulation = () => {
  if (!gl || !velocity || !dye) return
  const previousTarget = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null

  for (const target of [velocity.read, velocity.write]) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
    gl.viewport(0, 0, target.width, target.height)
    gl.clearColor(0.5, 0.5, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  for (const target of [dye.read, dye.write]) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
    gl.viewport(0, 0, target.width, target.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, previousTarget)
  simulationCleared = true
}

const uploadImage = () => {
  if (!gl || !imageTexture || !imageReady) return
  gl.bindTexture(gl.TEXTURE_2D, imageTexture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, colorImage)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  requestRender()
}

const loadImage = () => {
  imageReady = false
  colorImage.onload = () => {
    imageReady = true
    uploadImage()
  }
  colorImage.src = props.src
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  cssWidth = Math.max(canvas.clientWidth, 1)
  cssHeight = Math.max(canvas.clientHeight, 1)
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.round(cssWidth * pixelRatio)
  canvas.height = Math.round(cssHeight * pixelRatio)
  requestRender()
}

const createResources = () => {
  const canvas = canvasRef.value
  if (!canvas || reducedMotion.matches) return false
  gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  })
  if (!gl) return false

  try {
    programs = {
      velocitySplat: createProgram(velocitySplatShader),
      dyeSplat: createProgram(dyeSplatShader),
      velocityAdvect: createProgram(velocityAdvectShader),
      dyeAdvect: createProgram(dyeAdvectShader),
      display: createProgram(displayShader)
    }

    vertexArray = gl.createVertexArray()
    vertexBuffer = gl.createBuffer()
    imageTexture = gl.createTexture()
    if (!vertexArray || !vertexBuffer || !imageTexture) throw new Error('Recursos WebGL insuficientes')

    gl.bindVertexArray(vertexArray)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    const simHeight = Math.max(72, Math.round(SIM_WIDTH / Math.max(cssWidth / cssHeight, 1)))
    velocity = {
      read: createTarget(SIM_WIDTH, simHeight, true),
      write: createTarget(SIM_WIDTH, simHeight, true)
    }
    dye = {
      read: createTarget(SIM_WIDTH, simHeight),
      write: createTarget(SIM_WIDTH, simHeight)
    }
    clearSimulation()
    uploadImage()
    return true
  } catch (error) {
    console.warn('O efeito fluido foi desativado neste dispositivo.', error)
    return false
  }
}

const queueSplat = (splat: FluidSplat) => {
  pendingSplats.push(splat)
  if (pendingSplats.length > 28) pendingSplats.shift()
  lastInteractionTime = performance.now()
  simulationCleared = false
  requestRender()
}

const processSplats = () => {
  if (!gl || !programs || !velocity || !dye || !vertexArray) return
  gl.bindVertexArray(vertexArray)
  const aspect = cssWidth / cssHeight

  while (pendingSplats.length) {
    const splat = pendingSplats.shift()
    if (!splat) continue

    gl.useProgram(programs.velocitySplat)
    bindTexture(programs.velocitySplat, 'uTarget', velocity.read.texture, 0)
    gl.uniform2f(gl.getUniformLocation(programs.velocitySplat, 'uPoint'), splat.x, splat.y)
    gl.uniform2f(gl.getUniformLocation(programs.velocitySplat, 'uForce'), splat.dx, splat.dy)
    gl.uniform1f(gl.getUniformLocation(programs.velocitySplat, 'uAspect'), aspect)
    gl.uniform1f(gl.getUniformLocation(programs.velocitySplat, 'uRadius'), splat.radius)
    drawTo(velocity.write, velocity.write.width, velocity.write.height)
    swap(velocity)

    gl.useProgram(programs.dyeSplat)
    bindTexture(programs.dyeSplat, 'uTarget', dye.read.texture, 0)
    gl.uniform2f(gl.getUniformLocation(programs.dyeSplat, 'uPoint'), splat.x, splat.y)
    gl.uniform1f(gl.getUniformLocation(programs.dyeSplat, 'uAspect'), aspect)
    gl.uniform1f(gl.getUniformLocation(programs.dyeSplat, 'uRadius'), splat.radius)
    gl.uniform1f(gl.getUniformLocation(programs.dyeSplat, 'uStrength'), splat.strength)
    drawTo(dye.write, dye.write.width, dye.write.height)
    swap(dye)
  }
}

const stepFluid = (dt: number) => {
  if (!gl || !programs || !velocity || !dye || !vertexArray) return
  gl.bindVertexArray(vertexArray)
  const texelX = 1 / velocity.read.width
  const texelY = 1 / velocity.read.height

  gl.useProgram(programs.velocityAdvect)
  bindTexture(programs.velocityAdvect, 'uVelocity', velocity.read.texture, 0)
  gl.uniform2f(gl.getUniformLocation(programs.velocityAdvect, 'uTexelSize'), texelX, texelY)
  gl.uniform1f(gl.getUniformLocation(programs.velocityAdvect, 'uDt'), dt)
  gl.uniform1f(gl.getUniformLocation(programs.velocityAdvect, 'uDissipation'), Math.pow(0.935, dt))
  drawTo(velocity.write, velocity.write.width, velocity.write.height)
  swap(velocity)

  gl.useProgram(programs.dyeAdvect)
  bindTexture(programs.dyeAdvect, 'uVelocity', velocity.read.texture, 0)
  bindTexture(programs.dyeAdvect, 'uDye', dye.read.texture, 1)
  gl.uniform2f(gl.getUniformLocation(programs.dyeAdvect, 'uTexelSize'), 1 / dye.read.width, 1 / dye.read.height)
  gl.uniform1f(gl.getUniformLocation(programs.dyeAdvect, 'uDt'), dt)
  gl.uniform1f(gl.getUniformLocation(programs.dyeAdvect, 'uDissipation'), Math.pow(0.972, dt))
  drawTo(dye.write, dye.write.width, dye.write.height)
  swap(dye)
}

const drawDisplay = () => {
  const canvas = canvasRef.value
  if (!canvas || !gl || !programs || !imageTexture || !velocity || !dye || !imageReady || !vertexArray) return
  gl.bindVertexArray(vertexArray)
  gl.useProgram(programs.display)
  bindTexture(programs.display, 'uImage', imageTexture, 0)
  bindTexture(programs.display, 'uDye', dye.read.texture, 1)
  bindTexture(programs.display, 'uVelocity', velocity.read.texture, 2)

  const imageAspect = colorImage.naturalWidth / colorImage.naturalHeight
  const canvasAspect = cssWidth / cssHeight
  const coverX = Math.min(canvasAspect / imageAspect, 1)
  const coverY = Math.min(imageAspect / canvasAspect, 1)
  gl.uniform2f(gl.getUniformLocation(programs.display, 'uCoverScale'), coverX, coverY)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

const emitAutoSweep = (timestamp: number) => {
  if (!autoSweepStart) return false
  const progress = (timestamp - autoSweepStart) / 1450
  if (progress >= 1) {
    autoSweepStart = 0
    lastAutoX = -1
    lastAutoY = -1
    return false
  }

  const eased = 1 - Math.pow(1 - Math.max(progress, 0), 3)
  const x = 0.25 + eased * 0.5
  const y = 0.53 + Math.sin(eased * Math.PI * 1.35) * 0.065

  if (lastAutoX >= 0) {
    queueSplat({
      x,
      y,
      dx: Math.max(-1, Math.min(1, (x - lastAutoX) * 34)),
      dy: Math.max(-1, Math.min(1, (y - lastAutoY) * 34)),
      radius: 0.0057,
      strength: 0.82
    })
  }

  lastAutoX = x
  lastAutoY = y
  return true
}

const render = (timestamp: number) => {
  animationFrame = null
  if (!gl || !programs) return

  const dt = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 16.667, 2) : 1
  lastFrameTime = timestamp
  const autoActive = emitAutoSweep(timestamp)
  processSplats()

  if (!simulationCleared) stepFluid(dt)
  drawDisplay()

  const elapsed = timestamp - lastInteractionTime
  if (autoActive || pendingSplats.length || (!simulationCleared && elapsed < TRAIL_LIFETIME)) {
    animationFrame = window.requestAnimationFrame(render)
  } else if (!simulationCleared) {
    clearSimulation()
    drawDisplay()
    lastFrameTime = 0
  }
}

const requestRender = () => {
  if (animationFrame === null && gl) animationFrame = window.requestAnimationFrame(render)
}

const pointerPosition = (event: PointerEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0, px: 0, py: 0 }
  const rect = canvas.getBoundingClientRect()
  const px = event.clientX - rect.left
  const py = event.clientY - rect.top
  return {
    x: Math.min(Math.max(px / rect.width, 0), 1),
    y: 1 - Math.min(Math.max(py / rect.height, 0), 1),
    px,
    py
  }
}

const emitPointerTrail = (event: PointerEvent) => {
  if (reducedMotion.matches || (event.pointerType === 'touch' && !pointerDown)) return
  const position = pointerPosition(event)

  if (lastPointerX < 0) {
    lastPointerX = position.px
    lastPointerY = position.py
    queueSplat({ x: position.x, y: position.y, dx: 0, dy: 0, radius: 0.00497, strength: 0.75 })
    return
  }

  const deltaX = position.px - lastPointerX
  const deltaY = position.py - lastPointerY
  const distance = Math.hypot(deltaX, deltaY)
  if (distance < 2) return

  const steps = Math.min(Math.max(Math.ceil(distance / 9), 1), 7)
  const forceX = Math.max(-1, Math.min(1, (deltaX / cssWidth) * 52))
  const forceY = Math.max(-1, Math.min(1, (-deltaY / cssHeight) * 52))
  const radius = 0.00463 + Math.min(distance / 70, 1) * 0.00877

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps
    const px = lastPointerX + deltaX * progress
    const py = lastPointerY + deltaY * progress
    queueSplat({
      x: px / cssWidth,
      y: 1 - py / cssHeight,
      dx: forceX,
      dy: forceY,
      radius,
      strength: 0.92
    })
  }

  lastPointerX = position.px
  lastPointerY = position.py
}

const handlePointerEnter = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return
  lastPointerX = -1
  lastPointerY = -1
  emitPointerTrail(event)
}

const handlePointerMove = (event: PointerEvent) => {
  emitPointerTrail(event)
}

const handlePointerDown = (event: PointerEvent) => {
  pointerDown = true
  lastPointerX = -1
  lastPointerY = -1
  canvasRef.value?.setPointerCapture?.(event.pointerId)
  emitPointerTrail(event)
}

const handlePointerEnd = (event?: PointerEvent) => {
  pointerDown = false
  lastPointerX = -1
  lastPointerY = -1
  if (event && canvasRef.value?.hasPointerCapture?.(event.pointerId)) {
    canvasRef.value.releasePointerCapture(event.pointerId)
  }
}

const startAutoSweep = () => {
  if (!gl || reducedMotion.matches || !hoverless.matches) return
  autoSweepStart = performance.now()
  lastAutoX = -1
  lastAutoY = -1
  requestRender()
}

const destroyTarget = (target: RenderTarget) => {
  gl?.deleteFramebuffer(target.framebuffer)
  gl?.deleteTexture(target.texture)
}

const destroyResources = () => {
  if (!gl) return
  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
  if (velocity) {
    destroyTarget(velocity.read)
    destroyTarget(velocity.write)
  }
  if (dye) {
    destroyTarget(dye.read)
    destroyTarget(dye.write)
  }
  if (programs) Object.values(programs).forEach((program) => gl?.deleteProgram(program))
  if (imageTexture) gl.deleteTexture(imageTexture)
  if (vertexBuffer) gl.deleteBuffer(vertexBuffer)
  if (vertexArray) gl.deleteVertexArray(vertexArray)
  animationFrame = null
  gl = null
}

watch(() => props.src, loadImage)
watch(() => props.active, (active) => {
  if (active) startAutoSweep()
})

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(canvas)
  resizeCanvas()
  loadImage()

  if (createResources() && props.active) startAutoSweep()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  destroyResources()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="project-fluid-reveal"
    aria-hidden="true"
    @pointerenter="handlePointerEnter"
    @pointermove="handlePointerMove"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerEnd"
    @pointercancel="handlePointerEnd"
    @pointerleave="handlePointerEnd"
  ></canvas>
</template>

<style scoped>
.project-fluid-reveal {
  position: absolute;
  inset: -6% 0;
  z-index: 2;
  display: block;
  width: 100%;
  height: 112%;
  cursor: pointer;
  touch-action: pan-y;
  filter: contrast(1.1);
  transform: translate3d(0, var(--media-shift, 0px), 0) scale(1.015);
  transform-origin: center center;
  transition: transform 2000ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.project-card:hover .project-fluid-reveal) {
  transform: translate3d(0, var(--media-shift, 0px), 0) scale(1.03);
}

@media (prefers-reduced-motion: reduce) {
  .project-fluid-reveal,
  :global(.project-card:hover .project-fluid-reveal) {
    transform: scale(1.015);
    transition: none;
  }
}
</style>
