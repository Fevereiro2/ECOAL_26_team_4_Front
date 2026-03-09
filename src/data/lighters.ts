import { Lighter } from '../types';

export const lightersSeed: Lighter[] = [
  {
    id: 'l-1',
    name: 'Zippo Classic Chrome',
    description: 'The iconic windproof lighter with timeless brushed chrome styling.',
    image:
      'https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7?auto=format&fit=crop&w=900&q=80',
    isPublic: true,
    categories: ['flint', 'petrol'],
    criteria: { weight: 57, temperature: 900, ignition: 12000, year: 1932 },
    notes:
      'Widely recognized as a collectible benchmark. Case finish can affect long-term value.',
    createdAt: '2025-10-02'
  },
  {
    id: 'l-2',
    name: 'Bic Mini',
    description: 'Ultra-light disposable lighter known for practicality and portability.',
    image:
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80',
    isPublic: false,
    categories: ['flint', 'butane'],
    criteria: { weight: 12, temperature: 1050, ignition: 3000, year: 1973 },
    notes: 'Not premium in materials, but useful baseline for size and flame consistency.',
    createdAt: '2025-11-10'
  },
  {
    id: 'l-3',
    name: 'Tesla Coil Lighter',
    description: 'USB rechargeable dual-arc plasma lighter for wind-resistant ignition.',
    image:
      'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?auto=format&fit=crop&w=900&q=80',
    isPublic: true,
    categories: ['plasma', 'electric'],
    criteria: { weight: 72, temperature: 1400, ignition: 9000, year: 2019 },
    notes: 'Excellent for outdoor conditions. Arc module maintenance is recommended monthly.',
    createdAt: '2025-12-04'
  },
  {
    id: 'l-4',
    name: 'Torch Lighter Pro',
    description: 'High-intensity single jet torch ideal for precision and high heat output.',
    image:
      'https://images.unsplash.com/photo-1593535968999-7f5f7c5c5e53?auto=format&fit=crop&w=900&q=80',
    isPublic: true,
    categories: ['piezo', 'butane'],
    criteria: { weight: 89, temperature: 1300, ignition: 7000, year: 2021 },
    notes: 'Excellent for cigar lighting and workshop use. Fuel quality impacts nozzle lifespan.',
    createdAt: '2026-01-11'
  },
  {
    id: 'l-5',
    name: 'Vintage Petrol Lighter',
    description: 'Antique brass lighter with hand-engraved body and wick mechanism.',
    image:
      'https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=900&q=80',
    isPublic: false,
    categories: ['petrol'],
    criteria: { weight: 64, temperature: 860, ignition: 5000, year: 1958 },
    notes: 'Restoration performed in 2024. Keep away from excessive moisture.',
    createdAt: '2025-08-20'
  },
  {
    id: 'l-6',
    name: 'Aurora Arc Slim',
    description: 'Minimal electric arc lighter with brushed aluminum shell.',
    image:
      'https://images.unsplash.com/photo-1523419409543-7584f4fda5d0?auto=format&fit=crop&w=900&q=80',
    isPublic: true,
    categories: ['electric', 'plasma'],
    criteria: { weight: 49, temperature: 1250, ignition: 8000, year: 2022 },
    notes: 'Designed for modern carry. Battery remains stable for around 1 week of light use.',
    createdAt: '2026-01-26'
  },
  {
    id: 'l-7',
    name: 'Cyclone Butane X2',
    description: 'Dual flame butane lighter with reinforced alloy housing.',
    image:
      'https://images.unsplash.com/photo-1599493758267-c6c884c7071f?auto=format&fit=crop&w=900&q=80',
    isPublic: true,
    categories: ['butane', 'piezo'],
    criteria: { weight: 101, temperature: 1280, ignition: 6500, year: 2020 },
    notes: 'Dual ignition design improves reliability under wind but uses fuel faster.',
    createdAt: '2026-02-02'
  },
  {
    id: 'l-8',
    name: 'Nocturne Flint Edition',
    description: 'Matte black flint lighter inspired by vintage military form factors.',
    image:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
    isPublic: false,
    categories: ['flint'],
    criteria: { weight: 61, temperature: 940, ignition: 10000, year: 2017 },
    notes: 'Collectors appreciate rare serial batches from the first production run.',
    createdAt: '2025-09-18'
  }
];
