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

<button class="btn-ouvrir" on:click={toggleModal}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
  Assurances
</button>

{#if isOpen}
  <div class="modal-overlay" on:click={toggleModal} on:keydown={(e) => e.key === 'Escape' && toggleModal()} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Barème des assurances</h3>
        <button class="btn-fermer" on:click={toggleModal} aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                        {item.surCRD ? 'Sur CRD' : 'Capital initial'}
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
  .btn-ouvrir {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-ouvrir:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: white;
    border-radius: 16px;
    max-width: 550px;
    max-height: 85vh;
    width: 95%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
  }

  .btn-fermer {
    width: 36px;
    height: 36px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-fermer:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .select-pret {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .select-pret label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .select-pret select {
    padding: 0.65rem 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #f8fafc;
    cursor: pointer;
  }

  .select-pret select:focus {
    outline: none;
    border-color: #667eea;
    background: white;
  }

  .no-pret {
    background: #fef3c7;
    color: #92400e;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .table-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .categorie h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .item-row:hover:not(:disabled) {
    background: #667eea;
    border-color: #667eea;
    color: white;
    transform: translateX(4px);
  }

  .item-row:hover:not(:disabled) .profil {
    color: white;
  }

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
    font-size: 0.85rem;
    color: #1e293b;
    font-weight: 500;
  }

  .details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .taux {
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    color: #667eea;
  }

  .crd {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    background: #e2e8f0;
    border-radius: 4px;
    color: #64748b;
    font-weight: 500;
  }

  .crd.active {
    background: #dbeafe;
    color: #1d4ed8;
  }
</style>
