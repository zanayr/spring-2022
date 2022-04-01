const FPS = 12;
let entityCount = 0;
let gl;

// Helper functions
function uuid() {
  return "xxxx-yxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(36);
  });
}

// WebGL2
function clear(context, update=false) {
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

// initialize
function getContext(canvasID="canvas", width=400, height=300) {
  const context = document.getElementById(canvasID).getContext("webgl2");
  if (!context) {
    console.error(`Your browser does not support WebGL 2.0`);
    return null;
  }

  // Default Configurations
  context.cullFace(context.BACK);
  context.frontFace(context.CCW);
  context.enable(context.DEPTH_TEST);
  context.enable(context.CULL_FACE);
  context.depthFunc(context.LEQUAL);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
  context.clearColor(1.0, 1.0, 1.0, 1.0);

  // Dimensions
  context.canvas.style.width = `${width}px`;
  context.canvas.style.height = `${height}px`;
  context.canvas.width = width;
  context.canvas.height = height;

  context.viewport(0.0, 0.0, width, height);

  return context;
}

// Create Program
function compileShader(context, source, type) {
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

function linkProgram(context, vertex, fragment, validate) {
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

function createProgram(context, vertexSource, fragmentSource, validate=false) {
  const vertex = compileShader(context, vertexSource, context.VERTEX_SHADER);
  const fragment = compileShader(context, fragmentSource, context.FRAGMENT_SHADER);

  if (!vertex || !fragment) {
    return null;
  }
  return linkProgram(context, vertex, fragment, validate);
}


// Entity
function entity(tag=`entity_${count++}`) {
  return Object.defineProperties({}, {
    id: { enumerable: true, value: uuid() },
    tag: { enumerable: true, value: tag },
  });
}


// Transform Component
function transform([x, y, z]) {
  return Object.defineProperties({}, {
    position: { enumerable: true, value: new Float32Array([x, y, z]), writable: true },
    translation: {
      enumerable: true,
      value: new Float32Array([
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ]),
      writable: true,
    },
  });
}

function update(_, transform) {
  transform.translation = translate(identity(), transform.position);
}


// Manager
function manager(type) {
  return Object.defineProperties({}, {
    components: { enumerable: true, value: [] },
    map: { enumerable: true, value: new Map() },
    type: { enumerable: true, value: type },
  });
}

function add(entity, manager, component) {
  manager.map.set(entity.id, manager.components.push(component) - 1);
}

function destory(entity, manager) {
  const index = manager.map.get(entity.id);
  const last = manager.components.pop();

  manager.map.delete(entity.id);

  if (index !== manager.components.length) {
    manager.components[index] = last;
    manager.map.set(Array.from(manager.map)[manager.map.size - 1][0], size);
  }
}

function find(entity, manager) {
  return manager.components[manager.map.get(entity.id)];
}


// Systems
function movement(_, transforms) {
  for (let transform of transforms) {
    update(ts, transform);
  }
}


// Math
function identity() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function translate(i, [ tx, ty, tz ]) {
  return new Float32Array([
    i[0], i[1], i[2], i[3],
    i[4], i[5], i[6], i[7],
    i[8], i[9], i[10], i[11],
    tx, ty, tz, i[15],
  ]);
}


// Loop
let frameID;

function loop(
  timestamp,
  lastFrameTimeMS=0,
  timestep=1000/FPS,
  delta=0,
  lastFPSUpdate=0,
  currentFPS=FPS,
  framesThisSecond=0,
) {
  let cycles = 0;

  // Check if the current timestamp is less than the last timestamp and the step
  if (timestamp < lastFrameTimeMS + timestep) {
    frameID = requestAnimationFrame(ts => loop(
      ts, lastFrameTimeMS, timestep, delta, lastFPSUpdate, currentFPS, framesThisSecond
    ));
    return;
  }

  delta += (timestamp - lastFrameTimeMS);
  lastFrameTimeMS = timestamp;

  // Check is the last timestamp is greater than the last frame update and a second, throttle if is
  if (timestamp > lastFPSUpdate + 1000) {
    currentFPS = 0.25 * framesThisSecond + 0.75 * currentFPS;
    lastFPSUpdate = timestamp;
    framesThisSecond = 0;
  }

  framesThisSecond++;
  // input

  while(delta >= timestep) {
    // update
    delta -= timestep;
    if (++cycles >= 240) {
      delta = 0;
      break;
    }
  }

  clear(gl, true);
  // render

  frameID = requestAnimationFrame(ts =>loop(
    ts, lastFrameTimeMS, timestep, delta, lastFPSUpdate, currentFPS, framesThisSecond
  ));
}



function init() {
  
  // const point = entity("point_0");
  // const transformer = manager("transform");

  gl = getContext();

  const program = createProgram(gl, document.getElementById("vertex-point").text, document.getElementById("fragment-point").text, true);

  gl.useProgram(program);
  let location = gl.getAttribLocation(program, "a_vertex");
  
  gl.useProgram(null);

  clear(gl);

  let vertices = new Float32Array([0, 0, 0]);
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.useProgram(program);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.drawArrays(gl.POINTS, 0, 1);

  // add(point, transformer, transform([0, 0, 0]));
}

function main() {
  frameID = requestAnimationFrame(ts => loop(ts));

  // For debug purposes
  setTimeout(() => {
    cancelAnimationFrame(frameID);
  }, 3000);
}

// Application
init();
// main();