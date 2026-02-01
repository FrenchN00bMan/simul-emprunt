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
    [TYPES_PRETS.RELAIS]: 'Prêt Relais'
  };

  const typesColors = {
    [TYPES_PRETS.AMORTISSABLE]: '#0ea5e9',
    [TYPES_PRETS.PTZ]: '#10b981',
    [TYPES_PRETS.IN_FINE]: '#f59e0b',
    [TYPES_PRETS.RELAIS]: '#8b5cf6'
  };

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

<div class="colonne-pret" class:inactive={!pret.actif} style="--type-color: {typesColors[pret.type]}">
  <div class="header">
    <label class="toggle-actif">
      <input
        type="checkbox"
        checked={pret.actif}
        on:change={(e) => handleCheckboxUpdate('actif', e)}
      />
      <span class="toggle-slider"></span>
    </label>
    <span class="pret-numero">Prêt {index + 1}</span>
    {#if pret.actif}
      <span class="type-badge" style="background: {typesColors[pret.type]}">{typesLabels[pret.type]}</span>
    {/if}
  </div>

  {#if pret.actif}
    <div class="form-content">
      <div class="form-group">
        <label for="label-{index}">Libellé</label>
        <input
          type="text"
          id="label-{index}"
          value={pret.label}
          on:input={(e) => handleUpdate('label', e.target.value)}
          placeholder="Ex: Prêt principal"
        />
      </div>

      <div class="form-group">
        <label for="type-{index}">Type</label>
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
        <div class="form-group">
          <label for="valeurBien-{index}">Valeur du bien</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="valeurBien-{index}"
              value={pret.valeurBien}
              on:input={(e) => handleNumberUpdate('valeurBien', e)}
              min="0"
              step="1000"
            />
            <span class="unit">€</span>
          </div>
        </div>

        <div class="form-group">
          <label for="capitalRestantDu-{index}">Capital restant dû</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="capitalRestantDu-{index}"
              value={pret.capitalRestantDu}
              on:input={(e) => handleNumberUpdate('capitalRestantDu', e)}
              min="0"
              step="1000"
            />
            <span class="unit">€</span>
          </div>
        </div>

        <div class="form-group">
          <label for="pourcentageFinancement-{index}">% financement</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="pourcentageFinancement-{index}"
              value={pret.pourcentageFinancement}
              on:input={(e) => handleNumberUpdate('pourcentageFinancement', e)}
              min="0"
              max="100"
              step="5"
            />
            <span class="unit">%</span>
          </div>
        </div>

        <div class="indicateur-box" class:danger={montantRelaisNegatif}>
          <span class="ind-label">Montant autorisé</span>
          <span class="ind-value">{formatMontant(montantRelaisAutorise)}</span>
        </div>
      {:else}
        <div class="form-group">
          <label for="montant-{index}">Montant</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="montant-{index}"
              value={pret.montant}
              on:input={(e) => handleNumberUpdate('montant', e)}
              min="0"
              step="1000"
            />
            <span class="unit">€</span>
          </div>
        </div>
      {/if}

      {#if pret.type === TYPES_PRETS.PTZ}
        <div class="form-group">
          <label for="dureeDiffere-{index}">Différé</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="dureeDiffere-{index}"
              value={pret.dureeDiffere}
              on:input={(e) => handleNumberUpdate('dureeDiffere', e)}
              min="0"
              max="300"
            />
            <span class="unit">mois</span>
          </div>
        </div>

        <div class="form-group">
          <label for="dureeRemboursement-{index}">Remboursement</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="dureeRemboursement-{index}"
              value={pret.dureeRemboursement}
              on:input={(e) => handleNumberUpdate('dureeRemboursement', e)}
              min="1"
              max="300"
            />
            <span class="unit">mois</span>
          </div>
        </div>
      {:else}
        <div class="form-group">
          <label for="dureeMois-{index}">Durée</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="dureeMois-{index}"
              value={pret.dureeMois}
              on:input={(e) => handleNumberUpdate('dureeMois', e)}
              min="1"
              max="360"
            />
            <span class="unit">mois</span>
          </div>
        </div>

        {#if pret.type !== TYPES_PRETS.PTZ}
          <div class="form-group">
            <label for="tauxAnnuel-{index}">Taux nominal</label>
            <div class="input-with-unit">
              <input
                type="number"
                id="tauxAnnuel-{index}"
                value={pret.tauxAnnuel}
                on:input={(e) => handleNumberUpdate('tauxAnnuel', e)}
                min="0"
                max="20"
                step="0.01"
              />
              <span class="unit">%</span>
            </div>
          </div>
        {/if}
      {/if}

      <div class="separator"></div>

      <div class="section-title">Assurance</div>

      <div class="form-row">
        <div class="form-group compact">
          <label for="tauxAssurance-{index}">Taux</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="tauxAssurance-{index}"
              value={pret.tauxAssurance}
              on:input={(e) => handleNumberUpdate('tauxAssurance', e)}
              min="0"
              max="5"
              step="0.01"
            />
            <span class="unit">%</span>
          </div>
        </div>

        <div class="form-group compact">
          <label for="quotiteAssurance-{index}">Quotité</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="quotiteAssurance-{index}"
              value={pret.quotiteAssurance}
              on:input={(e) => handleNumberUpdate('quotiteAssurance', e)}
              min="0"
              max="200"
              step="10"
            />
            <span class="unit">%</span>
          </div>
        </div>
      </div>

      <label class="checkbox-label">
        <input
          type="checkbox"
          checked={pret.assuranceSurCRD}
          on:change={(e) => handleCheckboxUpdate('assuranceSurCRD', e)}
        />
        <span class="checkmark"></span>
        Sur capital restant dû
      </label>

      {#if pret.type === TYPES_PRETS.AMORTISSABLE && echeanceEstimee > 0}
        <div class="indicateur-box success">
          <span class="ind-label">Échéance estimée (hors ass.)</span>
          <span class="ind-value">{formatMontant(echeanceEstimee)}/mois</span>
        </div>
      {/if}

      {#if pret.type === TYPES_PRETS.AMORTISSABLE}
        <button
          class="btn-calculateur"
          on:click={() => showCalculateur = !showCalculateur}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="12" y2="14"/>
            <line x1="8" y1="18" x2="12" y2="18"/>
          </svg>
          {showCalculateur ? 'Masquer' : 'Calculateur'} 3→4
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
  .colonne-pret {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .colonne-pret:hover:not(.inactive) {
    border-color: var(--type-color, #0ea5e9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .colonne-pret.inactive {
    background: #f8fafc;
    border-color: #e2e8f0;
    opacity: 0.7;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .toggle-actif {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    cursor: pointer;
  }

  .toggle-actif input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 20px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .toggle-actif input:checked + .toggle-slider {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  }

  .toggle-actif input:checked + .toggle-slider:before {
    transform: translateX(16px);
  }

  .pret-numero {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
  }

  .type-badge {
    margin-left: auto;
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .form-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .form-group.compact {
    flex: 1;
  }

  .form-row {
    display: flex;
    gap: 0.75rem;
  }

  label {
    font-size: 0.65rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  input, select {
    padding: 0.55rem 0.65rem;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.85rem;
    background: #f8fafc;
    transition: all 0.2s ease;
  }

  input[type="number"] {
    text-align: right;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-weight: 500;
  }

  input:focus, select:focus {
    outline: none;
    border-color: var(--type-color, #0ea5e9);
    background: white;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    padding-right: 2rem;
  }

  .input-with-unit {
    position: relative;
    display: flex;
  }

  .input-with-unit input {
    flex: 1;
    padding-right: 2.5rem;
  }

  .unit {
    position: absolute;
    right: 0.65rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 500;
    pointer-events: none;
  }

  .separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    margin: 0.25rem 0;
  }

  .section-title {
    font-size: 0.65rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #475569;
    cursor: pointer;
    text-transform: none;
    font-weight: 500;
  }

  .checkbox-label input {
    display: none;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .checkbox-label input:checked + .checkmark {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    border-color: #0284c7;
  }

  .checkbox-label input:checked + .checkmark::after {
    content: '';
    width: 5px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .indicateur-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 0.85rem;
    background: #f1f5f9;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .indicateur-box.success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #34d399;
  }

  .indicateur-box.danger {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #f87171;
  }

  .ind-label {
    font-size: 0.65rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .indicateur-box.success .ind-label {
    color: #065f46;
  }

  .indicateur-box.danger .ind-label {
    color: #991b1b;
  }

  .ind-value {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  }

  .indicateur-box.success .ind-value {
    color: #065f46;
  }

  .indicateur-box.danger .ind-value {
    color: #991b1b;
  }

  .btn-calculateur {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem;
    background: #f1f5f9;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .btn-calculateur:hover {
    background: #e2e8f0;
    border-color: #94a3b8;
    color: #475569;
  }
</style>
