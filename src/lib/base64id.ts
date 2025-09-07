const base = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];
const numbers = [...'0123456789'];

export default function generateId(size: number): string {
  return numbers[Math.random() * numbers.length | 0] +
     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
     [...Array(size)]
       .map(() => base[Math.random() * base.length | 0])
       .join('');
}
