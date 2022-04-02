export default function manager(type) {
  return Object.defineProperties({}, {
    components: { enumerable: true, value: [] },
    map: { enumerable: true, value: new Map() },
    type: { enumerable: true, value: type },
  });
}

export function add(manager, entity, component) {
  manager.map.set(entity.id, manager.components.push(component) - 1);
}

export function remove(manager, entity) {
  const index = manager.map.get(entity.id);
  const last = manager.components.pop();

  manager.map.delete(entity.id);

  if (index !== manager.components.length) {
    manager.components[index] = last;
    manager.map.set(Array.from(manager.map)[manager.map.size - 1][0], size);
  }
}

export function find(manager, id) {
  return manager.components[manager.map.get(id)];
}