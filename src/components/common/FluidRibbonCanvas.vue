<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  try {
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.96,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 16,
      CURL: 18,
      SPLAT_RADIUS: 0.18,
      SPLAT_FORCE: 3500
    }

    const { gl, ext } = getWebGLContext(canvas)
    if (!gl) return

    function getWebGLContext(c: HTMLCanvasElement) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false
      }

      let glCtx: any = c.getContext('webgl2', params)
      const isWebGL2 = !!glCtx
      if (!isWebGL2) {
        glCtx = c.getContext('webgl', params) || c.getContext('experimental-webgl', params)
      }
      if (!glCtx) return { gl: null, ext: null }

      let halfFloat: any
      let supportLinearFiltering: any

      if (isWebGL2) {
        glCtx.getExtension('EXT_color_buffer_float')
        supportLinearFiltering = glCtx.getExtension('OES_texture_float_linear')
      } else {
        halfFloat = glCtx.getExtension('OES_texture_half_float')
        supportLinearFiltering = glCtx.getExtension('OES_texture_half_float_linear')
      }

      glCtx.clearColor(0.0, 0.0, 0.0, 0.0)

      const halfFloatTexType = isWebGL2 ? glCtx.HALF_FLOAT : halfFloat ? halfFloat.HALF_FLOAT_OES : glCtx.UNSIGNED_BYTE
      let formatRGBA: any
      let formatRG: any
      let formatR: any

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, halfFloatTexType)
        formatR = getSupportedFormat(glCtx, glCtx.R16F, glCtx.RED, halfFloatTexType)
      } else {
        formatRGBA = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
        formatRG = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
        formatR = getSupportedFormat(glCtx, glCtx.RGBA, glCtx.RGBA, halfFloatTexType)
      }

      return {
        gl: glCtx,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering
        }
      }
    }

    function getSupportedFormat(glCtx: any, internalFormat: number, format: number, type: number) {
      if (!supportRenderTextureFormat(glCtx, internalFormat, format, type)) {
        switch (internalFormat) {
          case glCtx.R16F:
            return getSupportedFormat(glCtx, glCtx.RG16F, glCtx.RG, type)
          case glCtx.RG16F:
            return getSupportedFormat(glCtx, glCtx.RGBA16F, glCtx.RGBA, type)
          default:
            return null
        }
      }
      return { internalFormat, format }
    }

    function supportRenderTextureFormat(glCtx: any, internalFormat: number, format: number, type: number) {
      const texture = glCtx.createTexture()
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null)

      const fbo = glCtx.createFramebuffer()
      glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, fbo)
      glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D, texture, 0)

      const status = glCtx.checkFramebufferStatus(glCtx.FRAMEBUFFER)
      return status === glCtx.FRAMEBUFFER_COMPLETE
    }

    class Program {
      program: any
      uniforms: { [key: string]: any }

      constructor(vertexShader: any, fragmentShader: any) {
        this.uniforms = {}
        this.program = createProgram(vertexShader, fragmentShader)
        this.uniforms = getUniforms(this.program)
      }

      bind() {
        gl.useProgram(this.program)
      }
    }

    function createProgram(vertexShader: any, fragmentShader: any) {
      const program = gl.createProgram()!
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.bindAttribLocation(program, 0, 'aPosition')
      gl.linkProgram(program)
      return program
    }

    function getUniforms(program: any) {
      const uniforms: { [key: string]: any } = {}
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        const uniformName = gl.getActiveUniform(program, i)!.name
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName)!
      }
      return uniforms
    }

    function compileShader(type: number, source: string) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `
    )

    const splatShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `
      )
    )

    const advectionShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform float dt;
        uniform float dissipation;

        void main () {
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            gl_FragColor = dissipation * texture2D(uSource, coord);
        }
      `
      )
    )

    const divergenceShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
      )
    )

    const curlShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `
      )
    )

    const vorticityShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;
            vec2 vel = texture2D(uVelocity, vUv).xy;
            gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
        }
      `
      )
    )

    const pressureShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `
      )
    )

    const gradientSubtractShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 vel = texture2D(uVelocity, vUv).xy;
            vel.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(vel, 0.0, 1.0);
        }
      `
      )
    )

    const displayShader = new Program(
      baseVertexShader,
      compileShader(
        gl.FRAGMENT_SHADER,
        `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uDensity;
        uniform sampler2D uBg;

        void main () {
            vec3 fluid = texture2D(uDensity, vUv).rgb;
            float intensity = length(fluid);

            float mask = smoothstep(0.02, 0.22, intensity);
            if (mask <= 0.001) {
                discard;
            }

            float edge = smoothstep(0.02, 0.16, intensity) * (1.0 - smoothstep(0.16, 0.38, intensity));
            vec2 chromaOffset = vec2(0.004, 0.0015) * edge;

            float r = texture2D(uBg, vUv + chromaOffset).r;
            float g = texture2D(uBg, vUv).g;
            float b = texture2D(uBg, vUv - chromaOffset).b;

            vec3 col = vec3(r, g, b) + vec3(0.15, 0.5, 0.9) * edge * 0.4;
            gl_FragColor = vec4(col * mask, mask);
        }
      `
      )
    )

    const quadBuffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    function blit(target: any) {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      } else {
        gl.viewport(0, 0, target.width, target.height)
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      gl.activeTexture(gl.TEXTURE0)
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

      const fbo = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)

      return {
        texture,
        fbo,
        width: w,
        height: h,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          return id
        }
      }
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(w, h, internalFormat, format, type, param)
      return {
        get read() { return fbo1 },
        get write() { return fbo2 },
        swap() {
          const temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
        }
      }
    }

    const filtering = ext?.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    const rgba = ext?.formatRGBA || { internalFormat: gl.RGBA, format: gl.RGBA }
    const rg = ext?.formatRG || rgba
    const r = ext?.formatR || rgba
    const texType = ext?.halfFloatTexType || gl.UNSIGNED_BYTE

    let density = createDoubleFBO(config.DYE_RESOLUTION, config.DYE_RESOLUTION, rgba.internalFormat, rgba.format, texType, filtering)
    let velocity = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION, rg.internalFormat, rg.format, texType, filtering)
    let divergence = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION, r.internalFormat, r.format, texType, gl.NEAREST)
    let curl = createFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION, r.internalFormat, r.format, texType, gl.NEAREST)
    let pressure = createDoubleFBO(config.SIM_RESOLUTION, config.SIM_RESOLUTION, r.internalFormat, r.format, texType, gl.NEAREST)

    const bgTexture = gl.createTexture()
    const bgImg = new Image()
    bgImg.src = '/loader-bg.jpg'
    bgImg.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, bgTexture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgImg)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    function resizeCanvas() {
      if (!canvas) return
      const width = window.innerWidth
      const height = window.innerHeight
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      if (!canvas) return
      splatShader.bind()
      gl.uniform1i(splatShader.uniforms.uTarget, velocity.read.attach(0))
      gl.uniform1f(splatShader.uniforms.aspectRatio, canvas.width / canvas.height)
      gl.uniform2f(splatShader.uniforms.point, x, y)
      gl.uniform3f(splatShader.uniforms.color, dx, dy, 0.0)
      gl.uniform1f(splatShader.uniforms.radius, config.SPLAT_RADIUS / 100.0)
      blit(velocity.write)
      velocity.swap()

      gl.uniform1i(splatShader.uniforms.uTarget, density.read.attach(0))
      gl.uniform3f(splatShader.uniforms.color, color[0], color[1], color[2])
      blit(density.write)
      density.swap()
    }

    const splatStack: { x: number; y: number; dx: number; dy: number; color: [number, number, number] }[] = []
    let lastX = -1000
    let lastY = -1000

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = 1.0 - e.clientY / window.innerHeight

      if (lastX === -1000) {
        lastX = x
        lastY = y
        return
      }

      const dx = (x - lastX) * config.SPLAT_FORCE
      const dy = (y - lastY) * config.SPLAT_FORCE

      splatStack.push({
        x,
        y,
        dx,
        dy,
        color: [1.0, 1.0, 1.0]
      })

      lastX = x
      lastY = y
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseleave', () => {
        lastX = -1000
        lastY = -1000
      })
    }

    let lastUpdateTime = performance.now()

    function update() {
      const now = performance.now()
      let dt = (now - lastUpdateTime) / 1000
      dt = Math.min(dt, 0.016666)
      lastUpdateTime = now

      // 1. Splat
      while (splatStack.length > 0) {
        const s = splatStack.pop()!
        splat(s.x, s.y, s.dx, s.dy, s.color)
      }

      // 2. Curl & Vorticity
      curlShader.bind()
      gl.uniform2f(curlShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(curlShader.uniforms.uVelocity, velocity.read.attach(0))
      blit(curl)

      vorticityShader.bind()
      gl.uniform2f(vorticityShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(vorticityShader.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(vorticityShader.uniforms.uCurl, curl.attach(1))
      gl.uniform1f(vorticityShader.uniforms.curl, config.CURL)
      gl.uniform1f(vorticityShader.uniforms.dt, dt)
      blit(velocity.write)
      velocity.swap()

      // 3. Divergence
      divergenceShader.bind()
      gl.uniform2f(divergenceShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(divergenceShader.uniforms.uVelocity, velocity.read.attach(0))
      blit(divergence)

      // 4. Pressure (Poisson Solver)
      pressureShader.bind()
      gl.uniform2f(pressureShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(pressureShader.uniforms.uDivergence, divergence.attach(1))
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureShader.uniforms.uPressure, pressure.read.attach(0))
        blit(pressure.write)
        pressure.swap()
      }

      // 5. Gradient Subtract
      gradientSubtractShader.bind()
      gl.uniform2f(gradientSubtractShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(gradientSubtractShader.uniforms.uPressure, pressure.read.attach(0))
      gl.uniform1i(gradientSubtractShader.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write)
      velocity.swap()

      // 6. Advection
      advectionShader.bind()
      gl.uniform2f(advectionShader.uniforms.texelSize, 1.0 / config.SIM_RESOLUTION, 1.0 / config.SIM_RESOLUTION)
      gl.uniform1i(advectionShader.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(advectionShader.uniforms.uSource, velocity.read.attach(0))
      gl.uniform1f(advectionShader.uniforms.dt, dt)
      gl.uniform1f(advectionShader.uniforms.dissipation, config.VELOCITY_DISSIPATION)
      blit(velocity.write)
      velocity.swap()

      gl.uniform2f(advectionShader.uniforms.texelSize, 1.0 / config.DYE_RESOLUTION, 1.0 / config.DYE_RESOLUTION)
      gl.uniform1i(advectionShader.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(advectionShader.uniforms.uSource, density.read.attach(1))
      gl.uniform1f(advectionShader.uniforms.dissipation, config.DENSITY_DISSIPATION)
      blit(density.write)
      density.swap()

      // 7. Output Display to Screen
      displayShader.bind()
      gl.uniform1i(displayShader.uniforms.uDensity, density.read.attach(0))
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, bgTexture)
      gl.uniform1i(displayShader.uniforms.uBg, 1)

      blit(null)

      animationId = requestAnimationFrame(update)
    }

    update()
  } catch (err) {
    console.warn('WebGL Fluid Canvas initialized in fallback mode:', err)
  }

  onUnmounted(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
  })
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="webgl-navier-stokes-canvas"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.webgl-navier-stokes-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
  mix-blend-mode: normal;
  will-change: transform;
}
</style>
