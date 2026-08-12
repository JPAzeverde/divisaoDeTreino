(function() {
  "use strict";

  // ---------- Gera chave única para o localStorage ----------
  function getStorageKey(cardTitle, exerciseName, serieIndex, field) {
    const clean = (str) => str.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    return `workout_${clean(cardTitle)}_${clean(exerciseName)}_serie${serieIndex}_${field}`;
  }

  // ---------- Salva o valor digitado ----------
  function saveInputData(input) {
    const serieTable = input.closest('.exercise-item__table');
    if (!serieTable) return;

    const exerciseItem = serieTable.closest('.exercise-item');
    if (!exerciseItem) return;

    const card = exerciseItem.closest('.workout-card');
    if (!card) return;

    const cardTitle = card.querySelector('.workout-card__title')?.textContent?.trim() || 'Unknown';
    const exerciseName = exerciseItem.querySelector('.exercise-item__name')?.textContent?.trim() || 'Unknown';

    const allTables = exerciseItem.querySelectorAll('.exercise-item__table');
    let serieIndex = -1;
    allTables.forEach((table, idx) => {
      if (table === serieTable) serieIndex = idx;
    });
    if (serieIndex === -1) return;

    let field = '';
    if (input.classList.contains('serie-weight')) field = 'weight';
    else if (input.classList.contains('serie-reps')) field = 'reps';
    else if (input.classList.contains('serie-rpi')) field = 'rpi';
    else return;

    const value = input.value.trim();
    const key = getStorageKey(cardTitle, exerciseName, serieIndex, field);
    if (value === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }

    // Atualiza histórico em tempo real
    updateHistoryForSerie(serieTable, cardTitle, exerciseName, serieIndex);
  }

  // ---------- Atualiza o histórico de uma série ----------
  function updateHistoryForSerie(serieTable, cardTitle, exerciseName, serieIndex) {
    const historyContainer = serieTable.querySelector(".exercise-item__history");
    if (!historyContainer) return;

    const weightEl = historyContainer.querySelector(".serie-weight");
    const repsEl = historyContainer.querySelector(".serie-reps");
    const rpiEl = historyContainer.querySelector(".serie-rpi");

    const weightKey = getStorageKey(cardTitle, exerciseName, serieIndex, "weight");
    const repsKey = getStorageKey(cardTitle, exerciseName, serieIndex, "reps");
    const rpiKey = getStorageKey(cardTitle, exerciseName, serieIndex, "rpi");

    const weight = localStorage.getItem(weightKey);
    const reps = localStorage.getItem(repsKey);
    const rpi = localStorage.getItem(rpiKey);

    weightEl.textContent = weight ? `${weight} Kg` : "___Kg";
    repsEl.textContent = reps || "__";
    rpiEl.textContent = rpi || "_";

    // --- LÓGICA DE CORES: PROGRESSÃO DE CARGA ---
    historyContainer.classList.remove('status-low', 'status-ok', 'status-high');

    if (reps) {
        const parsedReps = parseInt(reps, 10);
        const exerciseItem = serieTable.closest('.exercise-item');
        const rangeElement = exerciseItem ? exerciseItem.querySelector('.exercise-item__range-reps') : null;

        if (rangeElement && !isNaN(parsedReps)) {
            const rangeText = rangeElement.textContent;
            let minReps = 0;
            let maxReps = 0;

            const rangeMatch = rangeText.match(/(\d+)\s*(?:~|-|a)\s*(\d+)/i);
            
            if (rangeMatch) {
                minReps = parseInt(rangeMatch[1], 10);
                maxReps = parseInt(rangeMatch[2], 10);
            } else {
                const singleMatch = rangeText.match(/(\d+)(?!.*\d)/);
                if (singleMatch) {
                    minReps = parseInt(singleMatch[1], 10);
                    maxReps = parseInt(singleMatch[1], 10);
                }
            }

            if (minReps > 0) {
                if (parsedReps < minReps) {
                    historyContainer.classList.add('status-low');
                } else if (parsedReps >= minReps && parsedReps <= maxReps) {
                    historyContainer.classList.add('status-ok');
                } else if (parsedReps > maxReps) {
                    historyContainer.classList.add('status-high');
                }
            }
        }
    }
  }

  // ---------- Carrega todos os históricos ao iniciar ----------
  function loadAllHistory() {
    const cards = document.querySelectorAll('.workout-card');
    cards.forEach(card => {
      const cardTitle = card.querySelector('.workout-card__title')?.textContent?.trim() || 'Unknown';
      const exerciseItems = card.querySelectorAll('.exercise-item');
      exerciseItems.forEach(exerciseItem => {
        const exerciseName = exerciseItem.querySelector('.exercise-item__name')?.textContent?.trim() || 'Unknown';
        const tables = exerciseItem.querySelectorAll('.exercise-item__table');
        tables.forEach((table, idx) => {
          updateHistoryForSerie(table, cardTitle, exerciseName, idx);
        });
      });
    });
  }

  // ---------- Configura listener via delegação de eventos ----------
  function setupListeners() {
    document.addEventListener('input', function(e) {
      const target = e.target;
      if (target.matches('.serie-weight, .serie-reps, .serie-rpi')) {
        saveInputData(target);
      }
    });
  }

  // ---------- Inicialização ----------
  loadAllHistory();
  setupListeners();
})();