import { writable, derived } from 'svelte/store';
import { getQFReference } from '../data/quotient-familial.js';
import { calculerQFRAV, round2 } from '../utils/calculs.js';

// État de l'emprunteur
export const emprunteur = writable({
  nomClient: '',
  revenusAnnuels: 0,
  nbPersonnes: 1,
  tauxEndettementExistant: 0,
  loyerActuel: 0,
  loyersPayesEtCharges: 0,
  loyersPercus: 0,
  seuilEndettementMax: 35
});

// Indicateurs calculés dérivés
export const indicateursEmprunteur = derived(emprunteur, ($emprunteur) => {
  const revenusMensuels = round2($emprunteur.revenusAnnuels / 12);
  const chargesCreditExistantes = round2(($emprunteur.tauxEndettementExistant / 100) * revenusMensuels);
  const qfRAV = calculerQFRAV($emprunteur.revenusAnnuels, chargesCreditExistantes, $emprunteur.nbPersonnes);
  const qfReference = getQFReference($emprunteur.nbPersonnes);
  const qfOk = qfRAV >= qfReference;

  return {
    revenusMensuels,
    chargesCreditExistantes,
    qfRAV,
    qfReference,
    qfOk
  };
});
