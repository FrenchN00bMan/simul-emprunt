<script>
  import { emprunteur, indicateursEmprunteur } from '../stores/emprunteur.js';

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<section class="zone-emprunteur">
  <div class="section-header">
    <h2>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      Emprunteur
    </h2>
  </div>

  <div class="form-content">
    <div class="form-group full-width">
      <label for="nomClient">Nom du dossier</label>
      <input
        type="text"
        id="nomClient"
        bind:value={$emprunteur.nomClient}
        placeholder="Ex: Famille Dupont"
      />
    </div>

    <div class="form-group">
      <label for="revenusAnnuels">Revenus annuels bruts</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="revenusAnnuels"
          bind:value={$emprunteur.revenusAnnuels}
          min="0"
          step="1000"
        />
        <span class="unit">€/an</span>
      </div>
    </div>

    <div class="form-group">
      <label for="nbPersonnes">Personnes au foyer</label>
      <input
        type="number"
        id="nbPersonnes"
        bind:value={$emprunteur.nbPersonnes}
        min="1"
        max="9"
      />
    </div>

    <div class="form-group">
      <label for="tauxEndettementExistant">Endettement existant</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="tauxEndettementExistant"
          bind:value={$emprunteur.tauxEndettementExistant}
          min="0"
          max="100"
          step="0.1"
        />
        <span class="unit">%</span>
      </div>
    </div>

    <div class="form-group">
      <label for="loyerActuel">Loyer actuel</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="loyerActuel"
          bind:value={$emprunteur.loyerActuel}
          min="0"
        />
        <span class="unit">€/mois</span>
      </div>
    </div>

    <div class="form-group">
      <label for="loyersPayesEtCharges">Autres charges</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="loyersPayesEtCharges"
          bind:value={$emprunteur.loyersPayesEtCharges}
          min="0"
        />
        <span class="unit">€/mois</span>
      </div>
    </div>

    <div class="form-group">
      <label for="loyersPercus">Loyers perçus</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="loyersPercus"
          bind:value={$emprunteur.loyersPercus}
          min="0"
        />
        <span class="unit">€/mois</span>
      </div>
    </div>

    <div class="form-group">
      <label for="seuilEndettementMax">Seuil endettement max</label>
      <div class="input-with-unit">
        <input
          type="number"
          id="seuilEndettementMax"
          bind:value={$emprunteur.seuilEndettementMax}
          min="0"
          max="40"
          step="1"
        />
        <span class="unit">%</span>
      </div>
    </div>
  </div>

  <div class="indicateurs">
    <div class="indicateur-title">Indicateurs calculés</div>

    <div class="indicateur-grid">
      <div class="indicateur">
        <span class="label">Revenus mensuels</span>
        <span class="value">{formatMontant($indicateursEmprunteur.revenusMensuels)}</span>
      </div>

      <div class="indicateur">
        <span class="label">Charges crédit</span>
        <span class="value">{formatMontant($indicateursEmprunteur.chargesCreditExistantes)}/mois</span>
      </div>

      <div class="indicateur highlight" class:ok={$indicateursEmprunteur.qfOk} class:alerte={!$indicateursEmprunteur.qfOk}>
        <span class="label">QF RAV</span>
        <span class="value">{formatMontant($indicateursEmprunteur.qfRAV)}</span>
        <span class="status">
          {#if $indicateursEmprunteur.qfOk}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          {/if}
        </span>
      </div>

      <div class="indicateur">
        <span class="label">QF référence</span>
        <span class="value">{formatMontant($indicateursEmprunteur.qfReference)}</span>
      </div>
    </div>
  </div>
</section>

<style>
  .zone-emprunteur {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 1.25rem;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-content {
    padding: 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input {
    padding: 0.6rem 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background: #f8fafc;
  }

  input[type="number"] {
    text-align: right;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-weight: 500;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }

  input::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }

  .input-with-unit {
    position: relative;
    display: flex;
  }

  .input-with-unit input {
    flex: 1;
    padding-right: 3.5rem;
  }

  .unit {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 500;
    pointer-events: none;
  }

  .indicateurs {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 1rem 1.25rem;
  }

  .indicateur-title {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.75rem;
  }

  .indicateur-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .indicateur {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    position: relative;
  }

  .indicateur.highlight {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .indicateur .label {
    font-size: 0.65rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .indicateur .value {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  .indicateur.highlight .value {
    font-size: 1.1rem;
  }

  .indicateur .status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .indicateur.ok {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #34d399;
  }

  .indicateur.ok .value {
    color: #065f46;
  }

  .indicateur.ok .status {
    background: #10b981;
    color: white;
  }

  .indicateur.alerte {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #f87171;
  }

  .indicateur.alerte .value {
    color: #991b1b;
  }

  .indicateur.alerte .status {
    background: #ef4444;
    color: white;
  }

  @media (max-width: 480px) {
    .form-content {
      grid-template-columns: 1fr;
    }

    .indicateur-grid {
      grid-template-columns: 1fr;
    }

    .indicateur.highlight {
      grid-column: 1;
    }
  }
</style>
