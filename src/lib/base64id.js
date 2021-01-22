const base = [...'abcdefghijklmnopqrstuvwxyz0123456789'];

export default function generateId (size) {
   return [...Array(size)]
     .map(() => base[Math.random()*base.length|0])
     .join('');
}
