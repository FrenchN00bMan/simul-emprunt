<script>
  import { baremeAssurances } from '../data/bareme-assurances.js';
  import { prets, updatePret } from '../stores/prets.js';

  let isOpen = false;
  let selectedPretIndex = 0;

  $: pretsActifs = $prets
    .map((p, i) => ({ ...p, index: i }))
    .filter(p => p.actif);

  function toggleModal() {
    isOpen = !isOpen;
  }

  function appliquerTaux(item) {
    updatePret(selectedPretIndex, {
      tauxAssurance: item.taux,
      assuranceSurCRD: item.surCRD
    });
    isOpen = false;
  }

  $: categoriesGroupees = baremeAssurances.reduce((acc, item) => {
    if (!acc[item.categorie]) {
      acc[item.categorie] = [];
    }
    acc[item.categorie].push(item);
    return acc;
  }, {});
</script>

<button class="header-btn" on:click={toggleModal}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
  <span class="btn-text">Assurances</span>
</button>

{#if isOpen}
  <div class="modal-overlay" on:click={toggleModal} on:keydown={(e) => e.key === 'Escape' && toggleModal()} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Barème des assurances</h3>
        <button class="btn-close" on:click={toggleModal} aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        {#if pretsActifs.length > 0}
          <div class="select-pret">
            <label for="selectPret">Appliquer au prêt</label>
            <select id="selectPret" bind:value={selectedPretIndex}>
              {#each pretsActifs as pret}
                <option value={pret.index}>
                  Prêt {pret.index + 1} — {pret.label}
                </option>
              {/each}
            </select>
          </div>
        {:else}
          <div class="no-pret">
            Activez au moins un prêt pour utiliser le barème
          </div>
        {/if}

        <div class="table-container">
          {#each Object.entries(categoriesGroupees) as [categorie, items]}
            <div class="categorie">
              <h4>{categorie}</h4>
              <div class="items-list">
                {#each items as item}
                  <button
                    class="item-row"
                    on:click={() => appliquerTaux(item)}
                    disabled={pretsActifs.length === 0}
                  >
                    <span class="profil">{item.profil}</span>
                    <span class="details">
                      <span class="taux">{item.taux.toFixed(3)}%</span>
                      <span class="crd" class:active={item.surCRD}>
                        {item.surCRD ? 'Sur CRD' : 'Capital'}
                      </span>
                    </span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .header-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .header-btn:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  .header-btn svg {
    width: 15px;
    height: 15px;
  }

  .btn-text {
    display: inline;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    max-height: 80vh;
    width: 95%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.2s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1d21;
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    color: #6b7280;
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-close svg {
    width: 16px;
    height: 16px;
  }

  .btn-close:hover {
    background: #e5e7eb;
    color: #1a1d21;
  }

  .modal-body {
    padding: 1.25rem;
    overflow-y: auto;
  }

  .select-pret {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 1.25rem;
  }

  .select-pret label {
    font-size: 0.625rem;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .select-pret select {
    padding: 0.5rem 0.75rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.8125rem;
    background: #fafbfc;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .select-pret select:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }

  .no-pret {
    background: #fffbeb;
    color: #92400e;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    text-align: center;
    margin-bottom: 1rem;
    border: 1px solid #fde68a;
  }

  .table-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .categorie h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.625rem;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 0.875rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
  }

  .item-row:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }

  .item-row:hover:not(:disabled) .profil,
  .item-row:hover:not(:disabled) .taux {
    color: white;
  }

  .item-row:hover:not(:disabled) .crd {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .item-row:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .profil {
    font-size: 0.8125rem;
    color: #1a1d21;
    font-weight: 500;
  }

  .details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .taux {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: 0.8125rem;
    color: #2563eb;
  }

  .crd {
    font-size: 0.625rem;
    padding: 0.1875rem 0.375rem;
    background: #e5e7eb;
    border-radius: 3px;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
  }

  .crd.active {
    background: #dbeafe;
    color: #1d4ed8;
  }

  @media (max-width: 640px) {
    .btn-text {
      display: none;
    }
  }
</style>
