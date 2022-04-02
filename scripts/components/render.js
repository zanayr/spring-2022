export default function render(program, model, mode, options={}) {
  return Object.defineProperties({}, {
    attribute: { enumerable: true, value: {} },
    mode: { enumerable: true, value: mode },
    options: { enumerable: true, value: options },
    program: { enumerable: true, value: program },
    uniform: { enumerable: true, value: {} },
    vertices: { enumerable: true, value: model },
  });
}