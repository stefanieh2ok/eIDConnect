import { LANDRAETE_AUTO } from '../data/kommunalpolitiker-auto.ts';

const he = LANDRAETE_AUTO.filter((x) => x.land === 'hessen');
const bw = LANDRAETE_AUTO.filter((x) => x.land === 'baden-wuerttemberg');
console.log('total', LANDRAETE_AUTO.length, 'HE', he.length, 'BW', bw.length);
console.log('HE orter', [...new Set(he.map((x) => x.ort))].sort().join('\n'));
console.log('---');
console.log('BW orter (first 15)', [...new Set(bw.map((x) => x.ort))].sort().slice(0, 15).join('\n'));
