function compile(context, source, type) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.error(`Error compiling shader: ${source}, ${context.getShaderInfoLog(shader)}`);
    context.deleteShader(shader);
    return null;
  }

  return shader;
}

function link(context, vertex, fragment, validate) {
  const program = context.createProgram();
  context.attachShader(program, vertex);
  context.attachShader(program, fragment);

  context.bindAttribLocation(program, 0, "a_vertex");
  context.bindAttribLocation(program, 1, "a_normal");
  context.bindAttribLocation(program, 2, "a_uv");

  context.linkProgram(program);

  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    console.error(`Error linking program: ${context.getProgramInfoLog(program)}`);
    context.deleteProgram(program);
    return null;
  }

  if (validate) {
    context.validateProgram(program);
    if (!context.getProgramParameter(program, context.VALIDATE_STATUS)) {
      console.error(`Error validating program: ${context.getProgramInfoLog(program)}`);
      context.deleteProgram(program);
      return null;
    }
  }

  context.detachShader(program, vertex);
  context.detachShader(program, fragment);
  context.deleteShader(vertex);
  context.deleteShader(fragment);

  return program;
}

// WebGL 2.0 Shader Program
export function create(context, vertexSource, fragmentSource, validate=false) {
  const vertex = compile(context, vertexSource, context.VERTEX_SHADER);
  const fragment = compile(context, fragmentSource, context.FRAGMENT_SHADER);

  if (!vertex || !fragment) {
    return null;
  }
  
  return link(context, vertex, fragment, validate);
}

// WebGL 2.0 Context
export function webGL(canvasID="canvas", width=400, height=300) {
  const context = document.getElementById(canvasID).getContext("webgl2");
  if (!context) {
    console.error(`Your browser does not support WebGL 2.0`);
    return null;
  }

  context.cullFace(context.BACK);
  context.frontFace(context.CCW);
  context.enable(context.DEPTH_TEST);
  context.enable(context.CULL_FACE);
  context.depthFunc(context.LEQUAL);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
  context.clearColor(1.0, 1.0, 1.0, 1.0);

  context.canvas.style.width = `${width}px`;
  context.canvas.style.height = `${height}px`;
  context.canvas.width = width;
  context.canvas.height = height;

  context.viewport(0.0, 0.0, width, height);

  return context;
}

// WebGL 2.0 Clear Canvas
export function clear(context, update=false) {
  const ratio = update ? (window.devicePixelRatio || 1) : 1;
  const width = (context.canvas.clientWidth * ratio) | 0;
  const height = (context.canvas.clientHeight * ratio) | 0;

  if (context.canvas.width != width || context.canvas.height != height) {
    context.canvas.width = width;
    context.canvas.height = height;
    context.viewport(0.0, 0.0, width, height);
  }

  context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
  return context;
}

// WebGL 2.0 Initialize Shaders
export function initialize(context, model) {
  const { color, colorLocation, vertices, vertexSize } = model;
  const vao = context.createVertexArray();

  context.bindVertexArray(vao);

  if (vertices.length > 0) {
    Object.defineProperty(model, "vertexBuffer", {
      enumerable: true,
      value: context.createBuffer(),
    });

    context.bindBuffer(context.ARRAY_BUFFER, model.vertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);

    if (isFinite(colorLocation)) {
      context.enableVertexAttribArray(0);
      context.enableVertexAttribArray(colorLocation);
      context.vertexAttribPointer(0, 3, context.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
      context.vertexAttribPointer(colorLocation, 1, context.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, Float32Array.BYTES_PER_ELEMENT * 3);
    } else {
      context.enableVertexAttribArray(0);
      context.vertexAttribPointer(0, vertexSize, context.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    }

    // <-- normals

    // <-- uvs

    // <-- indices
  }

  return Object.defineProperty(model, "vao", { enumerable: true, value: vao });
}