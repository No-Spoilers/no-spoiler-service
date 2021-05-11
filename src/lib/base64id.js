const base = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];
const numbers = [...'0123456789'];

export default function generateId (size) {
   return numbers[Math.random()*numbers.length|0] +
     [...Array(size)]
     .map(() => base[Math.random()*base.length|0])
     .join('');
}
