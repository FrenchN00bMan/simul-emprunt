<script>
  import { TYPES_PRETS, updatePret } from '../stores/prets.js';
  import { calculerMontantRelais, calculerEcheance } from '../utils/calculs.js';
  import CalculateurFinancier from './CalculateurFinancier.svelte';

  export let pret;
  export let index;

  let showCalculateur = false;

  const typesLabels = {
    [TYPES_PRETS.AMORTISSABLE]: 'Amortissable',
    [TYPES_PRETS.PTZ]: 'PTZ',
    [TYPES_PRETS.IN_FINE]: 'In Fine',
    [TYPES_PRETS.RELAIS]: 'Relais'
  };

  const typesColors = {
    [TYPES_PRETS.AMORTISSABLE]: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    [TYPES_PRETS.PTZ]: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    [TYPES_PRETS.IN_FINE]: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    [TYPES_PRETS.RELAIS]: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' }
  };

  $: typeStyle = typesColors[pret.type];

  $: montantRelaisAutorise = pret.type === TYPES_PRETS.RELAIS
    ? calculerMontantRelais(pret.valeurBien, pret.capitalRestantDu, pret.pourcentageFinancement)
    : 0;

  $: montantRelaisNegatif = montantRelaisAutorise < 0;

  $: echeanceEstimee = pret.type === TYPES_PRETS.AMORTISSABLE && pret.montant > 0
    ? calculerEcheance(pret.montant, pret.tauxAnnuel, pret.dureeMois)
    : 0;

  function handleCalculateurUpdate(event) {
    const { montant, dureeMois, tauxAnnuel } = event.detail;
    updatePret(index, { montant, dureeMois, tauxAnnuel });
  }

  function handleUpdate(field, value) {
    updatePret(index, { [field]: value });
  }

  function handleNumberUpdate(field, event) {
    const value = parseFloat(event.target.value) || 0;
    updatePret(index, { [field]: value });
  }

  function handleCheckboxUpdate(field, event) {
    updatePret(index, { [field]: event.target.checked });
  }

  function formatMontant(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<div class="pret-card" class:inactive={!pret.actif} class:expanded={pret.actif}>
  <div class="card-header">
    <label class="toggle">
      <input
        type="checkbox"
        checked={pret.actif}
        on:change={(e) => handleCheckboxUpdate('actif', e)}
      />
      <span class="toggle-track">
        <span class="toggle-thumb"></span>
      </span>
    </label>
    <span class="pret-label">Prêt {index + 1}</span>
    {#if pret.actif}
      <span class="type-tag" style="background: {typeStyle.bg}; color: {typeStyle.text}; border-color: {typeStyle.border}">
        {typesLabels[pret.type]}
      </span>
    {/if}
  </div>

  {#if pret.actif}
    <div class="card-body">
      <div class="field">
        <label for="label-{index}">Libellé</label>
        <input
          type="text"
          id="label-{index}"
          value={pret.label}
          on:input={(e) => handleUpdate('label', e.target.value)}
          placeholder="Nom du prêt"
          class="input-text"
        />
      </div>

      <div class="field">
        <label for="type-{index}">Type de prêt</label>
        <select
          id="type-{index}"
          value={pret.type}
          on:change={(e) => handleUpdate('type', e.target.value)}
        >
          {#each Object.entries(typesLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
      </div>

      <div class="separator"></div>

      {#if pret.type === TYPES_PRETS.RELAIS}
        <div class="field">
          <label for="valeurBien-{index}">Valeur du bien</label>
          <div class="input-group">
            <input
              type="number"
              id="valeurBien-{index}"
              value={pret.valeurBien}
              on:input={(e) => handleNumberUpdate('valeurBien', e)}
              min="0"
              step="1000"
            />
            <span class="suffix">€</span>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="capitalRestantDu-{index}">CRD existant</label>
            <div class="input-group">
              <input
                type="number"
                id="capitalRestantDu-{index}"
                value={pret.capitalRestantDu}
                on:input={(e) => handleNumberUpdate('capitalRestantDu', e)}
                min="0"
                step="1000"
              />
              <span class="suffix">€</span>
            </div>
          </div>

          <div class="field small">
            <label for="pourcentageFinancement-{index}">% finc.</label>
            <div class="input-group">
              <input
                type="number"
                id="pourcentageFinancement-{index}"
                value={pret.pourcentageFinancement}
                on:input={(e) => handleNumberUpdate('pourcentageFinancement', e)}
                min="0"
                max="100"
                step="5"
              />
              <span class="suffix">%</span>
            </div>
          </div>
        </div>

        <div class="result-box" class:danger={montantRelaisNegatif}>
          <span class="result-label">Montant autorisé</span>
          <span class="result-value">{formatMontant(montantRelaisAutorise)}</span>
        </div>
      {:else}
        <div class="field">
          <label for="montant-{index}">Montant emprunté</label>
          <div class="input-group">
            <input
              type="number"
              id="montant-{index}"
              value={pret.montant}
              on:input={(e) => handleNumberUpdate('montant', e)}
              min="0"
              step="1000"
            />
            <span class="suffix">€</span>
          </div>
        </div>
      {/if}

      {#if pret.type === TYPES_PRETS.PTZ}
        <div class="field-row">
          <div class="field">
            <label for="dureeDiffere-{index}">Différé</label>
            <div class="input-group">
              <input
                type="number"
                id="dureeDiffere-{index}"
                value={pret.dureeDiffere}
                on:input={(e) => handleNumberUpdate('dureeDiffere', e)}
                min="0"
                max="300"
              />
              <span class="suffix">mois</span>
            </div>
          </div>

          <div class="field">
            <label for="dureeRemboursement-{index}">Remb.</label>
            <div class="input-group">
              <input
                type="number"
                id="dureeRemboursement-{index}"
                value={pret.dureeRemboursement}
                on:input={(e) => handleNumberUpdate('dureeRemboursement', e)}
                min="1"
                max="300"
              />
              <span class="suffix">mois</span>
            </div>
          </div>
        </div>
      {:else}
        <div class="field-row">
          <div class="field">
            <label for="dureeMois-{index}">Durée</label>
            <div class="input-group">
              <input
                type="number"
                id="dureeMois-{index}"
                value={pret.dureeMois}
                on:input={(e) => handleNumberUpdate('dureeMois', e)}
                min="1"
                max="360"
              />
              <span class="suffix">mois</span>
            </div>
          </div>

          {#if pret.type !== TYPES_PRETS.PTZ}
            <div class="field">
              <label for="tauxAnnuel-{index}">Taux</label>
              <div class="input-group">
                <input
                  type="number"
                  id="tauxAnnuel-{index}"
                  value={pret.tauxAnnuel}
                  on:input={(e) => handleNumberUpdate('tauxAnnuel', e)}
                  min="0"
                  max="20"
                  step="0.01"
                />
                <span class="suffix">%</span>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="separator"></div>

      <div class="section-label">Assurance</div>

      <div class="field-row">
        <div class="field">
          <label for="tauxAssurance-{index}">Taux</label>
          <div class="input-group">
            <input
              type="number"
              id="tauxAssurance-{index}"
              value={pret.tauxAssurance}
              on:input={(e) => handleNumberUpdate('tauxAssurance', e)}
              min="0"
              max="5"
              step="0.01"
            />
            <span class="suffix">%</span>
          </div>
        </div>

        <div class="field">
          <label for="quotiteAssurance-{index}">Quotité</label>
          <div class="input-group">
            <input
              type="number"
              id="quotiteAssurance-{index}"
              value={pret.quotiteAssurance}
              on:input={(e) => handleNumberUpdate('quotiteAssurance', e)}
              min="0"
              max="200"
              step="10"
            />
            <span class="suffix">%</span>
          </div>
        </div>
      </div>

      <label class="checkbox-field">
        <input
          type="checkbox"
          checked={pret.assuranceSurCRD}
          on:change={(e) => handleCheckboxUpdate('assuranceSurCRD', e)}
        />
        <span class="checkbox-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </span>
        <span class="checkbox-text">Sur capital restant dû</span>
      </label>

      {#if pret.type === TYPES_PRETS.AMORTISSABLE && echeanceEstimee > 0}
        <div class="result-box success">
          <span class="result-label">Échéance estimée (hors ass.)</span>
          <span class="result-value">{formatMontant(echeanceEstimee)}<small>/mois</small></span>
        </div>
      {/if}

      {#if pret.type === TYPES_PRETS.AMORTISSABLE}
        <button
          class="btn-calculator"
          on:click={() => showCalculateur = !showCalculateur}
          class:active={showCalculateur}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="12" y2="14"/>
            <line x1="8" y1="18" x2="12" y2="18"/>
          </svg>
          Calculateur
        </button>

        {#if showCalculateur}
          <CalculateurFinancier
            montant={pret.montant}
            dureeMois={pret.dureeMois}
            tauxAnnuel={pret.tauxAnnuel}
            echeance={echeanceEstimee}
            on:update={handleCalculateurUpdate}
          />
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .pret-card {
    background: #ffffff;
    display: flex;
    flex-direction: column;
    min-height: 52px;
    transition: all 0.2s ease;
  }

  .pret-card.inactive {
    background: #f9fafb;
  }

  .pret-card.inactive .card-header {
    padding: 0.875rem 1rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border-bottom: 1px solid #f0f1f3;
  }

  .toggle {
    position: relative;
    display: inline-flex;
    cursor: pointer;
  }

  .toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-track {
    width: 32px;
    height: 18px;
    background: #d1d5db;
    border-radius: 9px;
    position: relative;
    transition: background 0.2s ease;
  }

  .toggle input:checked + .toggle-track {
    background: #3b82f6;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
  }

  .toggle input:checked + .toggle-track .toggle-thumb {
    transform: translateX(14px);
  }

  .pret-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .type-tag {
    margin-left: auto;
    font-size: 0.625rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border: 1px solid;
  }

  .card-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .field.small {
    flex: 0 0 80px;
  }

  .field-row {
    display: flex;
    gap: 0.625rem;
  }

  label {
    font-size: 0.625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input, select {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 5px;
    font-size: 0.8125rem;
    background: #fafbfc;
    transition: all 0.15s ease;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    color: #1a1d21;
  }

  input[type="text"], select {
    font-family: 'DM Sans', sans-serif;
  }

  input[type="number"] {
    text-align: right;
    padding-right: 2.25rem;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    padding-right: 1.75rem;
  }

  .input-group {
    position: relative;
    display: flex;
  }

  .suffix {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.625rem;
    font-weight: 500;
    color: #9ca3af;
    pointer-events: none;
  }

  .separator {
    height: 1px;
    background: #f0f1f3;
    margin: 0.25rem 0;
  }

  .section-label {
    font-size: 0.5625rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-field input {
    display: none;
  }

  .checkbox-box {
    width: 16px;
    height: 16px;
    border: 1.5px solid #d1d5db;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafbfc;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .checkbox-box svg {
    width: 10px;
    height: 10px;
    opacity: 0;
    color: white;
    transition: opacity 0.15s ease;
  }

  .checkbox-field input:checked + .checkbox-box {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .checkbox-field input:checked + .checkbox-box svg {
    opacity: 1;
  }

  .checkbox-text {
    font-size: 0.75rem;
    color: #4b5563;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }

  .result-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 0.75rem;
    background: #f3f4f6;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .result-box.success {
    background: #ecfdf5;
    border-color: #a7f3d0;
  }

  .result-box.danger {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .result-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .result-box.success .result-label {
    color: #059669;
  }

  .result-box.danger .result-label {
    color: #dc2626;
  }

  .result-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #1a1d21;
  }

  .result-value small {
    font-size: 0.6875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .result-box.success .result-value {
    color: #065f46;
  }

  .result-box.danger .result-value {
    color: #991b1b;
  }

  .btn-calculator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 5px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-calculator svg {
    width: 14px;
    height: 14px;
  }

  .btn-calculator:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }

  .btn-calculator.active {
    background: #eff6ff;
    border-color: #93c5fd;
    border-style: solid;
    color: #2563eb;
  }
</style>
