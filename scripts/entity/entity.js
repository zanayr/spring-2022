import { uuid } from "../utility/utility.js";

let count = 0;

export default function entity(tag=`entity_${count++}`) {
  return Object.defineProperties({}, {
    id: { enumerable: true, value: uuid() },
    tag: { enumerable: true, value: tag },
  });
}