/**
 * QUAZION Platform Data Repository
 * All sample mock publications and contributor profiles removed.
 * Real data is served live from Supabase.
 */

import { Category, Publication, Profile } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Astrophysics",
    slug: "astrophysics",
    description: "Physical properties, stellar evolution, compact objects, and high-energy celestial phenomena.",
    iconName: "Sparkles",
    publicationCount: 0,
  },
  {
    id: "cat-2",
    name: "Cosmology",
    slug: "cosmology",
    description: "The origin, expansion dynamics, cosmic microwave background, and fate of the universe.",
    iconName: "Globe",
    publicationCount: 0,
  },
  {
    id: "cat-3",
    name: "Theoretical Physics",
    slug: "theoretical-physics",
    description: "Mathematical formulations, quantum gravity, field theories, and spacetime geometry.",
    iconName: "Atom",
    publicationCount: 0,
  },
  {
    id: "cat-4",
    name: "Space Science & Exploration",
    slug: "space-science",
    description: "Orbital mechanics, satellite instrumentation, exoplanetary systems, and robotic missions.",
    iconName: "Compass",
    publicationCount: 0,
  },
  {
    id: "cat-5",
    name: "Mathematics & Analysis",
    slug: "mathematics",
    description: "Differential geometry, topology, numerical relativity algorithms, and statistical mechanics.",
    iconName: "Binary",
    publicationCount: 0,
  },
  {
    id: "cat-6",
    name: "Quantum Mechanics",
    slug: "quantum-mechanics",
    description: "Subatomic state dynamics, entanglement phenomena, decoherence, and quantum optics.",
    iconName: "Cpu",
    publicationCount: 0,
  },
  {
    id: "cat-7",
    name: "Life Sciences & Genetics",
    slug: "life-sciences",
    description: "Cellular biochemistry, CRISPR gene editing, genomics, molecular biology, and evolutionary dynamics.",
    iconName: "Dna",
    publicationCount: 0,
  },
  {
    id: "cat-8",
    name: "Medicine & Neuroscience",
    slug: "medicine-health",
    description: "Clinical investigations, neural circuits, cognitive neuroscience, immunology, and oncology.",
    iconName: "HeartPulse",
    publicationCount: 0,
  },
  {
    id: "cat-9",
    name: "Computer Science & AI",
    slug: "computer-science-ai",
    description: "Machine intelligence, neural architectures, distributed computing systems, and algorithmic theory.",
    iconName: "Brain",
    publicationCount: 0,
  },
  {
    id: "cat-10",
    name: "Chemistry & Materials",
    slug: "chemistry",
    description: "Chemical synthesis, nanostructures, quantum chemistry, catalysis, and advanced materials.",
    iconName: "FlaskConical",
    publicationCount: 0,
  },
];

export const MOCK_AUTHORS: Record<string, Profile> = {};

export const MOCK_FEATURED_PUBLICATIONS: Publication[] = [];

export const MOCK_LATEST_PUBLICATIONS: Publication[] = [];

export const MOCK_PUBLICATIONS: Publication[] = [];

export const MOCK_FEATURED_CONTRIBUTORS: Profile[] = [];
