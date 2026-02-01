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

<div class="emprunteur-panel">
  <div class="panel-header">
    <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <span class="header-title">Emprunteur</span>
  </div>

  <div class="form-section">
    <div class="field-group full">
      <label for="nomClient">Nom du dossier</label>
      <input
        type="text"
        id="nomClient"
        bind:value={$emprunteur.nomClient}
        placeholder="Ex: Famille Martin"
        class="input-text"
      />
    </div>

    <div class="field-row">
      <div class="field-group">
        <label for="revenusAnnuels">Revenus annuels</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="revenusAnnuels"
            bind:value={$emprunteur.revenusAnnuels}
            min="0"
            step="1000"
          />
          <span class="input-suffix">€/an</span>
        </div>
      </div>

      <div class="field-group small">
        <label for="nbPersonnes">Foyer</label>
        <input
          type="number"
          id="nbPersonnes"
          bind:value={$emprunteur.nbPersonnes}
          min="1"
          max="9"
          class="input-centered"
        />
      </div>
    </div>

    <div class="field-row">
      <div class="field-group">
        <label for="tauxEndettementExistant">Endett. existant</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="tauxEndettementExistant"
            bind:value={$emprunteur.tauxEndettementExistant}
            min="0"
            max="100"
            step="0.1"
          />
          <span class="input-suffix">%</span>
        </div>
      </div>

      <div class="field-group">
        <label for="seuilEndettementMax">Seuil max</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="seuilEndettementMax"
            bind:value={$emprunteur.seuilEndettementMax}
            min="0"
            max="40"
            step="1"
          />
          <span class="input-suffix">%</span>
        </div>
      </div>
    </div>
  </div>

  <div class="form-section">
    <div class="section-label">Charges & Revenus locatifs</div>

    <div class="field-row">
      <div class="field-group">
        <label for="loyerActuel">Loyer actuel</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="loyerActuel"
            bind:value={$emprunteur.loyerActuel}
            min="0"
          />
          <span class="input-suffix">€</span>
        </div>
      </div>

      <div class="field-group">
        <label for="loyersPercus">Loyers perçus</label>
        <div class="input-wrapper">
          <input
            type="number"
            id="loyersPercus"
            bind:value={$emprunteur.loyersPercus}
            min="0"
          />
          <span class="input-suffix">€</span>
        </div>
      </div>
    </div>

    <div class="field-group">
      <label for="loyersPayesEtCharges">Autres charges mensuelles</label>
      <div class="input-wrapper">
        <input
          type="number"
          id="loyersPayesEtCharges"
          bind:value={$emprunteur.loyersPayesEtCharges}
          min="0"
        />
        <span class="input-suffix">€/mois</span>
      </div>
    </div>
  </div>

  <div class="indicators-section">
    <div class="section-label">Indicateurs</div>

    <div class="indicator-row">
      <div class="indicator">
        <span class="indicator-label">Revenus mensuels</span>
        <span class="indicator-value">{formatMontant($indicateursEmprunteur.revenusMensuels)}</span>
      </div>
      <div class="indicator">
        <span class="indicator-label">Charges crédit</span>
        <span class="indicator-value">{formatMontant($indicateursEmprunteur.chargesCreditExistantes)}</span>
      </div>
    </div>

    <div class="indicator-qf" class:ok={$indicateursEmprunteur.qfOk} class:alert={!$indicateursEmprunteur.qfOk}>
      <div class="qf-main">
        <span class="qf-label">Quotient Familial (RAV)</span>
        <span class="qf-value">{formatMontant($indicateursEmprunteur.qfRAV)}</span>
      </div>
      <div class="qf-reference">
        <span class="qf-ref-label">Réf. mini</span>
        <span class="qf-ref-value">{formatMontant($indicateursEmprunteur.qfReference)}</span>
      </div>
      <div class="qf-status">
        {#if $indicateursEmprunteur.qfOk}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .emprunteur-panel {
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
  }

  .header-icon {
    width: 20px;
    height: 20px;
  }

  .header-title {
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .form-section {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f0f1f3;
  }

  .section-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.75rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
  }

  .field-group.full {
    margin-bottom: 0.875rem;
  }

  .field-group.small {
    flex: 0 0 70px;
  }

  .field-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .field-row:last-child {
    margin-bottom: 0;
  }

  label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
    background: #fafbfc;
    transition: all 0.15s ease;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    color: #1a1d21;
  }

  input[type="text"] {
    font-family: 'DM Sans', sans-serif;
  }

  input[type="number"] {
    text-align: right;
    padding-right: 3rem;
  }

  .input-centered {
    text-align: center !important;
    padding-right: 0.625rem !important;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }

  .input-wrapper {
    position: relative;
    display: flex;
  }

  .input-suffix {
    position: absolute;
    right: 0.625rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.6875rem;
    font-weight: 500;
    color: #9ca3af;
    pointer-events: none;
  }

  .indicators-section {
    padding: 1rem 1.25rem;
    background: #f9fafb;
  }

  .indicator-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }

  .indicator {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem 0.75rem;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .indicator-label {
    font-size: 0.5625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .indicator-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a1d21;
  }

  .indicator-qf {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    transition: all 0.2s ease;
  }

  .indicator-qf.ok {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-color: #34d399;
  }

  .indicator-qf.alert {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: #f87171;
  }

  .qf-main {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .qf-label {
    font-size: 0.5625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .indicator-qf.ok .qf-label {
    color: #059669;
  }

  .indicator-qf.alert .qf-label {
    color: #dc2626;
  }

  .qf-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.125rem;
    font-weight: 700;
    color: #1a1d21;
  }

  .indicator-qf.ok .qf-value {
    color: #065f46;
  }

  .indicator-qf.alert .qf-value {
    color: #991b1b;
  }

  .qf-reference {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .qf-ref-label {
    font-size: 0.5625rem;
    font-weight: 500;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .qf-ref-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
  }

  .qf-status {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qf-status svg {
    width: 14px;
    height: 14px;
  }

  .indicator-qf.ok .qf-status {
    background: #10b981;
    color: white;
  }

  .indicator-qf.alert .qf-status {
    background: #ef4444;
    color: white;
  }

  @media (max-width: 1024px) {
    .form-section {
      padding: 1rem 1.5rem;
    }

    .indicators-section {
      padding: 1rem 1.5rem;
    }
  }
</style>
