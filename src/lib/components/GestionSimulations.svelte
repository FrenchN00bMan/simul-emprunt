<script>
  import { emprunteur } from '../stores/emprunteur.js';
  import { prets } from '../stores/prets.js';
  import { onMount } from 'svelte';

  let simulations = [];
  let isPanelOpen = false;
  let nomSauvegarde = '';

  const STORAGE_KEY = 'simulations-pret-immobilier';

  onMount(() => {
    chargerListeSimulations();
  });

  function chargerListeSimulations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      simulations = data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erreur chargement simulations:', e);
      simulations = [];
    }
  }

  function sauvegarderSimulation() {
    const nom = nomSauvegarde.trim() || $emprunteur.nomClient || `Simulation ${simulations.length + 1}`;
    const simulation = {
      id: Date.now(),
      nom,
      date: new Date().toISOString(),
      emprunteur: { ...$emprunteur },
      prets: [...$prets]
    };

    simulations = [simulation, ...simulations];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    nomSauvegarde = '';
  }

  function chargerSimulation(simulation) {
    emprunteur.set(simulation.emprunteur);
    prets.set(simulation.prets);
    isPanelOpen = false;
  }

  function supprimerSimulation(id) {
    if (confirm('Supprimer cette simulation ?')) {
      simulations = simulations.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    }
  }

  function exporterJSON() {
    const data = {
      version: '1.0',
      date: new Date().toISOString(),
      emprunteur: $emprunteur,
      prets: $prets
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${$emprunteur.nomClient || 'export'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importerJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.emprunteur && data.prets) {
          emprunteur.set(data.emprunteur);
          prets.set(data.prets);
          isPanelOpen = false;
        } else {
          alert('Format de fichier invalide.');
        }
      } catch (err) {
        alert('Erreur lors de l\'import : ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<button class="header-btn" on:click={() => isPanelOpen = !isPanelOpen}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
  <span class="btn-text">Simulations</span>
  {#if simulations.length > 0}
    <span class="badge">{simulations.length}</span>
  {/if}
</button>

{#if isPanelOpen}
  <div class="panel-overlay" on:click={() => isPanelOpen = false} on:keydown={(e) => e.key === 'Escape' && (isPanelOpen = false)} role="button" tabindex="0"></div>
  <div class="panel" role="dialog" aria-modal="true">
    <div class="panel-header">
      <h3>Mes simulations</h3>
      <button class="btn-close" on:click={() => isPanelOpen = false} aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="panel-body">
      <div class="section">
        <div class="section-label">Sauvegarder</div>
        <div class="save-form">
          <input
            type="text"
            bind:value={nomSauvegarde}
            placeholder="Nom de la simulation"
            on:keydown={(e) => e.key === 'Enter' && sauvegarderSimulation()}
          />
          <button class="btn-save" on:click={sauvegarderSimulation}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-label">Import / Export</div>
        <div class="json-actions">
          <button class="btn-action" on:click={exporterJSON}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter JSON
          </button>
          <label class="btn-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importer JSON
            <input type="file" accept=".json" on:change={importerJSON} />
          </label>
        </div>
      </div>

      <div class="section">
        <div class="section-label">Historique ({simulations.length})</div>
        {#if simulations.length === 0}
          <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Aucune simulation sauvegardée</p>
          </div>
        {:else}
          <ul class="simulations-list">
            {#each simulations as simulation}
              <li>
                <div class="simulation-info">
                  <span class="nom">{simulation.nom}</span>
                  <span class="date">{formatDate(simulation.date)}</span>
                </div>
                <div class="simulation-actions">
                  <button class="btn-charger" on:click={() => chargerSimulation(simulation)} title="Charger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="1,4 1,10 7,10"/>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                  </button>
                  <button class="btn-supprimer" on:click={() => supprimerSimulation(simulation.id)} title="Supprimer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
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

  .badge {
    background: #2563eb;
    color: white;
    padding: 0.125rem 0.375rem;
    border-radius: 8px;
    font-size: 0.625rem;
    font-weight: 600;
    min-width: 18px;
    text-align: center;
  }

  .panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 999;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    max-width: 100%;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .panel-header h3 {
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
    border-radius: 6px;
    cursor: pointer;
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

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  .section-label {
    font-size: 0.625rem;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.625rem;
  }

  .save-form {
    display: flex;
    gap: 0.5rem;
  }

  .save-form input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.8125rem;
    background: #fafbfc;
    font-family: 'DM Sans', sans-serif;
  }

  .save-form input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }

  .btn-save {
    padding: 0 0.875rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-save svg {
    width: 16px;
    height: 16px;
  }

  .btn-save:hover {
    background: #1d4ed8;
  }

  .json-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem 0.625rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-action svg {
    width: 14px;
    height: 14px;
  }

  .btn-action:hover {
    background: #f3f4f6;
    color: #1a1d21;
  }

  .btn-action input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #9ca3af;
    text-align: center;
  }

  .empty svg {
    width: 32px;
    height: 32px;
    margin-bottom: 0.5rem;
  }

  .empty p {
    margin: 0;
    font-size: 0.8125rem;
  }

  .simulations-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .simulations-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.15s ease;
  }

  .simulations-list li:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .simulation-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .simulation-info .nom {
    font-weight: 600;
    color: #1a1d21;
    font-size: 0.8125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .simulation-info .date {
    font-size: 0.6875rem;
    color: #9ca3af;
    font-family: 'JetBrains Mono', monospace;
  }

  .simulation-actions {
    display: flex;
    gap: 0.25rem;
  }

  .btn-charger,
  .btn-supprimer {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-charger svg,
  .btn-supprimer svg {
    width: 14px;
    height: 14px;
  }

  .btn-charger {
    background: #dbeafe;
    color: #2563eb;
  }

  .btn-charger:hover {
    background: #2563eb;
    color: white;
  }

  .btn-supprimer {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-supprimer:hover {
    background: #dc2626;
    color: white;
  }

  @media (max-width: 640px) {
    .btn-text {
      display: none;
    }
  }
</style>
