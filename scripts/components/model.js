export default function model({ color, indices, normals, uvs, vertices}, options={}) {
  return Object.defineProperties({}, {
    color: {
      enumerable: true,
      value: new Float32Array(color.color),
      writable: true,
    },
    colorLocation: {
      enumerable: true,
      value: color.location,
      writable: true,
    },
    indices: {
      enumerable: true,
      value: new Float32Array(indices),
      writable: true,
    },
    normals: {
      enumerable: true,
      value: new Float32Array(normals),
      writable: true,
    },
    options: {
      enumerable: true,
      value: options,
      writable: true,
    },
    uvs: {
      enumerable: true,
      value: new Float32Array(uvs),
      writable: true,
    },
    vertexSize: {
      enumerable: true,
      value: new Float32Array(vertices.size),
      writable: true,
    },
    vertices: {
      enumerable: true,
      value: new Float32Array(vertices.vertices),
      writable: true,
    },
  })
}