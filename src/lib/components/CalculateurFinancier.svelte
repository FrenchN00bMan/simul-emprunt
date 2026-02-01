<script>
  import { calculerEcheance, calculerMontant, calculerDuree, calculerTaux } from '../utils/calculs.js';

  export let montant = 0;
  export let dureeMois = 240;
  export let tauxAnnuel = 3.5;
  export let echeance = 0;

  // Champ sélectionné pour le calcul (celui marqué avec "?")
  let champACalculer = 'echeance'; // 'montant', 'duree', 'taux', 'echeance'

  // Dispatcher pour renvoyer les valeurs calculées au parent
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // Calcul automatique quand les valeurs changent
  $: {
    if (champACalculer) {
      calculer();
    }
  }

  function calculer() {
    let resultat = { montant, dureeMois, tauxAnnuel, echeance };

    switch (champACalculer) {
      case 'echeance':
        if (montant > 0 && dureeMois > 0 && tauxAnnuel >= 0) {
          resultat.echeance = calculerEcheance(montant, tauxAnnuel, dureeMois);
          echeance = resultat.echeance;
        }
        break;

      case 'montant':
        if (echeance > 0 && dureeMois > 0 && tauxAnnuel >= 0) {
          resultat.montant = calculerMontant(echeance, tauxAnnuel, dureeMois);
          montant = resultat.montant;
        }
        break;

      case 'duree':
        if (montant > 0 && echeance > 0 && tauxAnnuel >= 0) {
          const dureeCalculee = calculerDuree(montant, echeance, tauxAnnuel);
          if (dureeCalculee !== Infinity && dureeCalculee > 0) {
            resultat.dureeMois = dureeCalculee;
            dureeMois = dureeCalculee;
          }
        }
        break;

      case 'taux':
        if (montant > 0 && echeance > 0 && dureeMois > 0) {
          resultat.tauxAnnuel = calculerTaux(montant, echeance, dureeMois);
          tauxAnnuel = resultat.tauxAnnuel;
        }
        break;
    }

    dispatch('update', resultat);
  }

  function setChampACalculer(champ) {
    champACalculer = champ;
  }

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(value);
  }
</script>

<div class="calculateur">
  <div class="titre">Calculateur financier</div>
  <p class="instruction">Cliquez sur "?" pour choisir la valeur à calculer</p>

  <div class="champs-grid">
    <div class="champ" class:calcule={champACalculer === 'montant'}>
      <div class="champ-header">
        <label>Montant (€)</label>
        <button
          class="btn-calculer"
          class:active={champACalculer === 'montant'}
          on:click={() => setChampACalculer('montant')}
          title="Calculer le montant"
        >?</button>
      </div>
      <input
        type="number"
        bind:value={montant}
        disabled={champACalculer === 'montant'}
        min="0"
        step="1000"
      />
    </div>

    <div class="champ" class:calcule={champACalculer === 'duree'}>
      <div class="champ-header">
        <label>Durée (mois)</label>
        <button
          class="btn-calculer"
          class:active={champACalculer === 'duree'}
          on:click={() => setChampACalculer('duree')}
          title="Calculer la durée"
        >?</button>
      </div>
      <input
        type="number"
        bind:value={dureeMois}
        disabled={champACalculer === 'duree'}
        min="1"
        max="360"
      />
    </div>

    <div class="champ" class:calcule={champACalculer === 'taux'}>
      <div class="champ-header">
        <label>Taux (%)</label>
        <button
          class="btn-calculer"
          class:active={champACalculer === 'taux'}
          on:click={() => setChampACalculer('taux')}
          title="Calculer le taux"
        >?</button>
      </div>
      <input
        type="number"
        bind:value={tauxAnnuel}
        disabled={champACalculer === 'taux'}
        min="0"
        max="20"
        step="0.01"
      />
    </div>

    <div class="champ" class:calcule={champACalculer === 'echeance'}>
      <div class="champ-header">
        <label>Échéance (€)</label>
        <button
          class="btn-calculer"
          class:active={champACalculer === 'echeance'}
          on:click={() => setChampACalculer('echeance')}
          title="Calculer l'échéance"
        >?</button>
      </div>
      <input
        type="number"
        bind:value={echeance}
        disabled={champACalculer === 'echeance'}
        min="0"
        step="10"
      />
    </div>
  </div>

  {#if champACalculer === 'echeance' && echeance > 0}
    <div class="resultat">
      Échéance calculée : <strong>{formatMontant(echeance)}</strong>/mois
    </div>
  {:else if champACalculer === 'montant' && montant > 0}
    <div class="resultat">
      Montant calculé : <strong>{formatMontant(montant)}</strong>
    </div>
  {:else if champACalculer === 'duree' && dureeMois > 0}
    <div class="resultat">
      Durée calculée : <strong>{dureeMois} mois</strong> ({(dureeMois / 12).toFixed(1)} ans)
    </div>
  {:else if champACalculer === 'taux' && tauxAnnuel >= 0}
    <div class="resultat">
      Taux calculé : <strong>{tauxAnnuel.toFixed(2)}%</strong>
    </div>
  {/if}
</div>

<style>
  .calculateur {
    background: #edf2f7;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .titre {
    font-weight: 600;
    color: #1a365d;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  .instruction {
    font-size: 0.7rem;
    color: #718096;
    margin: 0 0 0.75rem 0;
  }

  .champs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .champ {
    background: white;
    border-radius: 4px;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .champ.calcule {
    background: #ebf8ff;
    border-color: #3182ce;
  }

  .champ-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .champ-header label {
    font-size: 0.65rem;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .btn-calculer {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid #cbd5e0;
    background: white;
    color: #718096;
    font-weight: 700;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-calculer:hover {
    background: #edf2f7;
    border-color: #3182ce;
    color: #3182ce;
  }

  .btn-calculer.active {
    background: #3182ce;
    border-color: #3182ce;
    color: white;
  }

  .champ input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    font-size: 0.85rem;
    text-align: right;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  .champ input:disabled {
    background: #ebf8ff;
    border-color: #90cdf4;
    color: #2b6cb0;
    font-weight: 600;
  }

  .champ input:focus {
    outline: none;
    border-color: #3182ce;
  }

  .resultat {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: #c6f6d5;
    border: 1px solid #48bb78;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #22543d;
    text-align: center;
  }

  .resultat strong {
    color: #1a4731;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
