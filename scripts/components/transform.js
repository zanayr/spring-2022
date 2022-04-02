import { translate, identity } from "../math/math.js";

export default function transform([x=0, y=0, z=0]) {
  return Object.defineProperties({}, {
    position: { enumerable: true, value: new Float32Array([x, y, z]), writable: true },
    translation: {
      enumerable: true,
      value: new Float32Array([
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        x, y, z, 1.0,
      ]),
      writable: true,
    },
  });
}

export function update(_, transform) {
  transform.translation = translate(identity(), transform.position);
}