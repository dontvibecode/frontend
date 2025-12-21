"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface FluidImageProps {
  src: string;
  alt?: string;
  className?: string;
  fluidIntensity?: number;
  cursorRadius?: number;
}

// Shader sources
const baseVertex = `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position, 0, 1);
  }
`;

const clearShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const splatShader = `
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
`;

const advectionShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;
  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }
  void main () {
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
    gl_FragColor.a = 1.0;
  }
`;

const divergenceShader = `
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
`;

const curlShader = `
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
`;

const vorticityShader = `
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
`;

const pressureShader = `
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
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractShader = `
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
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const displayShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform sampler2D uFluid;
  uniform float uFluidIntensity;
  void main () {
    vec3 fluid = texture2D(uFluid, vUv).rgb;
    vec2 uv = vUv - fluid.rg * uFluidIntensity;
    // Flip Y coordinate to correct for WebGL's inverted Y axis
    uv.y = 1.0 - uv.y;
    gl_FragColor = texture2D(uTexture, uv);
  }
`;

const displayVertex = `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

export default function FluidImage({
  src,
  alt = "",
  className = "",
  fluidIntensity = 0.0003,
  cursorRadius = 0.0003,
}: FluidImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationRef = useRef<number>(0);
  const imageLoadedRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0, isInit: false });
  const splatsRef = useRef<Array<{ x: number; y: number; dx: number; dy: number }>>([]);

  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    []
  );

  const createProgram = useCallback(
    (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      if (!vertexShader || !fragmentShader) return null;

      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    },
    [createShader]
  );

  const createFBO = useCallback(
    (gl: WebGLRenderingContext, width: number, height: number, internalFormat: number, format: number, type: number, filter: number) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return {
        fbo,
        texture,
        width,
        height,
      };
    },
    []
  );

  const createDoubleFBO = useCallback(
    (gl: WebGLRenderingContext, width: number, height: number, internalFormat: number, format: number, type: number, filter: number) => {
      let fbo1 = createFBO(gl, width, height, internalFormat, format, type, filter);
      let fbo2 = createFBO(gl, width, height, internalFormat, format, type, filter);

      return {
        get read() {
          return fbo1;
        },
        get write() {
          return fbo2;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    },
    [createFBO]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;

    // Enable float textures extension
    const ext = gl.getExtension("OES_texture_half_float");
    const extLinear = gl.getExtension("OES_texture_half_float_linear");
    
    let halfFloatType = gl.UNSIGNED_BYTE;
    if (ext) {
      halfFloatType = ext.HALF_FLOAT_OES;
    }

    // Configuration
    const simRes = 128;
    const dyeRes = 512;
    const iterations = 4;
    const densityDissipation = 0.97;
    const velocityDissipation = 0.98;
    const pressureDissipation = 0.8;
    const curlStrength = 20;
    const splatRadius = cursorRadius;

    // Resize canvas
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create programs
    const clearProgram = createProgram(gl, baseVertex, clearShader);
    const splatProgram = createProgram(gl, baseVertex, splatShader);
    const advectionProgram = createProgram(gl, baseVertex, advectionShader);
    const divergenceProgram = createProgram(gl, baseVertex, divergenceShader);
    const curlProgram = createProgram(gl, baseVertex, curlShader);
    const vorticityProgram = createProgram(gl, baseVertex, vorticityShader);
    const pressureProgram = createProgram(gl, baseVertex, pressureShader);
    const gradientSubtractProgram = createProgram(gl, baseVertex, gradientSubtractShader);
    const displayProgram = createProgram(gl, displayVertex, displayShader);

    if (!clearProgram || !splatProgram || !advectionProgram || !divergenceProgram ||
        !curlProgram || !vorticityProgram || !pressureProgram || !gradientSubtractProgram || !displayProgram) {
      console.error("Failed to create shader programs");
      return;
    }

    // Create vertex buffer for full-screen quad
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Create FBOs for simulation
    const texType = extLinear ? halfFloatType : gl.UNSIGNED_BYTE;
    const velocity = createDoubleFBO(gl, simRes, simRes, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    const density = createDoubleFBO(gl, dyeRes, dyeRes, gl.RGBA, gl.RGBA, texType, gl.LINEAR);
    const pressure = createDoubleFBO(gl, simRes, simRes, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    const divergenceFBO = createFBO(gl, simRes, simRes, gl.RGBA, gl.RGBA, texType, gl.NEAREST);
    const curlFBO = createFBO(gl, simRes, simRes, gl.RGBA, gl.RGBA, texType, gl.NEAREST);

    // Load image texture
    const imageTexture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      imageLoadedRef.current = true;
    };
    image.src = src;

    // Helper function to bind attributes
    const bindAttributes = (program: WebGLProgram) => {
      const positionLoc = gl.getAttribLocation(program, "position");
      const uvLoc = gl.getAttribLocation(program, "uv");
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
      if (uvLoc >= 0) {
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);
      }
    };

    // Splat function
    const splat = (x: number, y: number, dx: number, dy: number) => {
      gl.useProgram(splatProgram);
      bindAttributes(splatProgram);

      gl.uniform1i(gl.getUniformLocation(splatProgram, "uTarget"), 0);
      gl.uniform1f(gl.getUniformLocation(splatProgram, "aspectRatio"), canvas.width / canvas.height);
      gl.uniform2f(gl.getUniformLocation(splatProgram, "point"), x, y);
      gl.uniform3f(gl.getUniformLocation(splatProgram, "color"), dx, dy, 1.0);
      gl.uniform1f(gl.getUniformLocation(splatProgram, "radius"), splatRadius);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, density.write.fbo);
      gl.viewport(0, 0, dyeRes, dyeRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      density.swap();
    };

    // Animation loop
    const update = () => {
      if (!imageLoadedRef.current) {
        animationRef.current = requestAnimationFrame(update);
        return;
      }

      // Process splats
      const splats = splatsRef.current;
      for (let i = splats.length - 1; i >= 0; i--) {
        const s = splats.splice(i, 1)[0];
        splat(s.x, s.y, s.dx, s.dy);
      }

      // Curl
      gl.useProgram(curlProgram);
      bindAttributes(curlProgram);
      gl.uniform2f(gl.getUniformLocation(curlProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(curlProgram, "uVelocity"), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, curlFBO.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Vorticity
      gl.useProgram(vorticityProgram);
      bindAttributes(vorticityProgram);
      gl.uniform2f(gl.getUniformLocation(vorticityProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(vorticityProgram, "uVelocity"), 0);
      gl.uniform1i(gl.getUniformLocation(vorticityProgram, "uCurl"), 1);
      gl.uniform1f(gl.getUniformLocation(vorticityProgram, "curl"), curlStrength);
      gl.uniform1f(gl.getUniformLocation(vorticityProgram, "dt"), 0.016);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, curlFBO.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      // Divergence
      gl.useProgram(divergenceProgram);
      bindAttributes(divergenceProgram);
      gl.uniform2f(gl.getUniformLocation(divergenceProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(divergenceProgram, "uVelocity"), 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, divergenceFBO.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Clear pressure
      gl.useProgram(clearProgram);
      bindAttributes(clearProgram);
      gl.uniform1i(gl.getUniformLocation(clearProgram, "uTexture"), 0);
      gl.uniform1f(gl.getUniformLocation(clearProgram, "value"), pressureDissipation);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      pressure.swap();

      // Pressure iterations
      gl.useProgram(pressureProgram);
      bindAttributes(pressureProgram);
      gl.uniform2f(gl.getUniformLocation(pressureProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(pressureProgram, "uDivergence"), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, divergenceFBO.texture);

      for (let i = 0; i < iterations; i++) {
        gl.uniform1i(gl.getUniformLocation(pressureProgram, "uPressure"), 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.fbo);
        gl.viewport(0, 0, simRes, simRes);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        pressure.swap();
      }

      // Gradient subtract
      gl.useProgram(gradientSubtractProgram);
      bindAttributes(gradientSubtractProgram);
      gl.uniform2f(gl.getUniformLocation(gradientSubtractProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, "uPressure"), 0);
      gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, "uVelocity"), 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      // Advect velocity
      gl.useProgram(advectionProgram);
      bindAttributes(advectionProgram);
      gl.uniform2f(gl.getUniformLocation(advectionProgram, "texelSize"), 1 / simRes, 1 / simRes);
      gl.uniform2f(gl.getUniformLocation(advectionProgram, "dyeTexelSize"), 1 / simRes, 1 / simRes);
      gl.uniform1i(gl.getUniformLocation(advectionProgram, "uVelocity"), 0);
      gl.uniform1i(gl.getUniformLocation(advectionProgram, "uSource"), 0);
      gl.uniform1f(gl.getUniformLocation(advectionProgram, "dt"), 0.016);
      gl.uniform1f(gl.getUniformLocation(advectionProgram, "dissipation"), velocityDissipation);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
      gl.viewport(0, 0, simRes, simRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      velocity.swap();

      // Advect density
      gl.uniform2f(gl.getUniformLocation(advectionProgram, "dyeTexelSize"), 1 / dyeRes, 1 / dyeRes);
      gl.uniform1i(gl.getUniformLocation(advectionProgram, "uSource"), 1);
      gl.uniform1f(gl.getUniformLocation(advectionProgram, "dissipation"), densityDissipation);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, density.write.fbo);
      gl.viewport(0, 0, dyeRes, dyeRes);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      density.swap();

      // Render final image with fluid distortion
      gl.useProgram(displayProgram);
      bindAttributes(displayProgram);
      gl.uniform1i(gl.getUniformLocation(displayProgram, "uTexture"), 0);
      gl.uniform1i(gl.getUniformLocation(displayProgram, "uFluid"), 1);
      gl.uniform1f(gl.getUniformLocation(displayProgram, "uFluidIntensity"), fluidIntensity);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(update);
    };

    // Mouse/touch handlers
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e && e.touches.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;

      if (!lastMouseRef.current.isInit) {
        lastMouseRef.current = { x: clientX, y: clientY, isInit: true };
        return;
      }

      const deltaX = clientX - lastMouseRef.current.x;
      const deltaY = clientY - lastMouseRef.current.y;

      lastMouseRef.current = { x: clientX, y: clientY, isInit: true };

      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        splatsRef.current.push({
          x,
          y,
          dx: deltaX * 5,
          dy: deltaY * -5,
        });
      }
    };

    const handleLeave = () => {
      lastMouseRef.current.isInit = false;
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    canvas.addEventListener("touchend", handleLeave);

    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      canvas.removeEventListener("touchend", handleLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [src, fluidIntensity, cursorRadius, createProgram, createFBO, createDoubleFBO]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={alt}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

