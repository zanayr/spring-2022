import { webGL, clear, create, initialize } from "./webgl/webgl.js";
import entity from "./entity/entity.js";
import manager, { add, find } from "./components/manager/manager.js";
import transform from "./components/transform.js";
import model from "./components/model.js";
import render from "./components/render.js";

const context = webGL("canvas", 400, 300);

let FPS = 30;
let frameID;
let renderManager;
// let modelManager;
let transformManager;

function draw(webglContext) {
  for (let [ id, i ] of renderManager.map) {
    const { program, mode, vertices } = find(renderManager, id);

    webglContext.useProgram(program);

    webglContext.bindVertexArray(vertices.vao);

    // <-- Check options here

    // <-- Set uniform values here

    context.drawArrays(mode, 0, 1);

    context.bindVertexArray(null);
    context.useProgram(null);
  }
}

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

  clear(context, true);
  draw(context);

  frameID = requestAnimationFrame(ts =>loop(
    ts, lastFrameTimeMS, timestep, delta, lastFPSUpdate, currentFPS, framesThisSecond
  ));
}



function init() {
  // Simple black point
  const data = {
    color: {
      color: [ 0.0, 0.0, 0.0, 1.0 ],
      location: 4,
    },
    indices: [],
    normals: [],
    uvs: [],
    vertices: {
      size: 4,
      vertices: [ 0.0, 0.0, 0.0, 0.0 ],
    },
  };

  const point = entity();
  

  const pointShader = create(context, document.getElementById("vertex-point").text, document.getElementById("fragment-point").text, true);

  transformManager = manager("transform");
  renderManager = manager("render");
  add(transformManager, point, transform);
  add(renderManager, point, render(pointShader, initialize(context, model(data)), context.POINTS));


  clear(context);
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
main();