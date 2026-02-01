<script>
  import { prets, totauxGlobaux } from '../stores/prets.js';
  import ColonnePret from './ColonnePret.svelte';

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<section class="zone-prets">
  <div class="section-header">
    <div class="header-left">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Configuration des prêts
      </h2>
    </div>

    {#if $totauxGlobaux.nbPretsActifs > 0}
      <div class="totaux-resume">
        <div class="total-item">
          <span class="label">Intérêts</span>
          <span class="value">{formatMontant($totauxGlobaux.totalInterets)}</span>
        </div>
        <div class="total-item">
          <span class="label">Assurance</span>
          <span class="value">{formatMontant($totauxGlobaux.totalAssurance)}</span>
        </div>
        <div class="total-item highlight">
          <span class="label">Coût total</span>
          <span class="value">{formatMontant($totauxGlobaux.totalCredit)}</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="colonnes-wrapper">
    <div class="colonnes-container">
      {#each $prets as pret, index}
        <ColonnePret {pret} {index} />
      {/each}
    </div>
  </div>
</section>

<style>
  .zone-prets {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .section-header {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-left h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .totaux-resume {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .total-item {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    backdrop-filter: blur(4px);
  }

  .total-item.highlight {
    background: rgba(255, 255, 255, 0.25);
  }

  .total-item .label {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 500;
  }

  .total-item .value {
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  .total-item.highlight .value {
    font-size: 1rem;
  }

  .colonnes-wrapper {
    padding: 1.25rem;
    background: #f8fafc;
  }

  .colonnes-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  @media (max-width: 1400px) {
    .colonnes-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 900px) {
    .colonnes-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .colonnes-container {
      grid-template-columns: 1fr;
    }

    .totaux-resume {
      width: 100%;
      justify-content: center;
    }
  }
</style>
