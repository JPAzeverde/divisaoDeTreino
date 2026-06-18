document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       MENU MOBILE
       ========================================= */
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    /* =========================================
       PROGRAMAÇÃO SEMANAL (Schedule)
       ========================================= */
    const miniCards = document.querySelectorAll('.mini-card');
    const btnRestart = document.getElementById('btnRestart');

    // Carrega o estado salvo no localStorage
    const savedSchedule = JSON.parse(localStorage.getItem('miniCardsState')) || {};

    function updateScheduleState() {
        let markedCount = 0;
        const currentState = {};

        miniCards.forEach(card => {
            const day = card.dataset.day;
            if (card.classList.contains('mark')) {
                markedCount++;
                currentState[day] = true;
            } else {
                currentState[day] = false;
            }
        });

        // Salva estado atualizado no navegador
        localStorage.setItem('miniCardsState', JSON.stringify(currentState));

        // Exibe ou oculta o botão de recomeçar
        if (markedCount === miniCards.length && miniCards.length > 0) {
            btnRestart.classList.remove('hidden');
        } else {
            btnRestart.classList.add('hidden');
        }
    }

    // Inicializa os cards com os dados salvos
    miniCards.forEach(card => {
        const day = card.dataset.day;
        if (savedSchedule[day]) {
            card.classList.add('mark');
        }

        card.addEventListener('click', () => {
            card.classList.toggle('mark');
            updateScheduleState();
        });
    });

    // Estado inicial do botão
    updateScheduleState();

    // Botão Recomeçar Ciclo
    btnRestart.addEventListener('click', () => {
        miniCards.forEach(card => card.classList.remove('mark'));
        updateScheduleState();
    });

    /* =========================================
       WORKOUT HISTORY & AUTO-CALC
       ========================================= */
    const exercises = document.querySelectorAll('.exercise');

    exercises.forEach(exercise => {
        const exName = exercise.dataset.name;
        if (!exName) return;

        const inputRows = exercise.querySelectorAll('.input-row');
        const histRows = exercise.querySelectorAll('.hist-row');
        
        // Estrutura salva: { "0": {rep: "10", carga: "50", rpi: "8"}, "1": {...} }
        const savedWorkout = JSON.parse(localStorage.getItem(`workoutData_${exName}`)) || {};

        inputRows.forEach((row, index) => {
            // SELEÇÃO ROBUSTA: Pega os inputs pela ordem real (0=Rep, 1=Carga, 2=RPI)
            const inputs = row.querySelectorAll('input');
            const repIn = inputs[0];
            const cargaIn = inputs[1];
            const rpiIn = inputs[2];
            
            const histRow = histRows[index];
            const isWorkRow = row.classList.contains('work-row'); // Verifica se é série de trabalho

            // 1. Preenche o Histórico Visual (Séries de Trabalho)
            if (histRow) {
                const typeCell = histRow.querySelector('td:first-child').innerText.trim();
                const histRep = histRow.querySelector('.hist-rep, td:nth-child(2)'); // Célula de reps
                const histCarga = histRow.querySelector('.hist-carga, td:nth-child(3)');
                const histRpi = histRow.querySelector('.hist-rpi, td:nth-child(4)');

                // Apenas as linhas "Trab" recebem o histórico da sessão anterior
                if (typeCell.includes('Trab')) {
                    // Preenche as repetições feitas apenas se existirem
                    if (histRep && savedWorkout[index] && savedWorkout[index].rep) {
                        histRep.innerText = savedWorkout[index].rep;
                        histRep.style.color = "var(--accent-white)"; // Destaca visualmente
                    }
                    if (histCarga && savedWorkout[index] && savedWorkout[index].carga) {
                        histCarga.innerText = savedWorkout[index].carga;
                    }
                    if (histRpi && savedWorkout[index] && savedWorkout[index].rpi) {
                        histRpi.innerText = savedWorkout[index].rpi;
                    }
                }
            }

            // Obs: Removemos o preenchimento dos inputs (repIn.value = ...) para que 
            // as caixas comecem vazias ao recarregar a página.

            // 2. Salva automaticamente ao digitar
            const saveInputs = () => {
                if (!savedWorkout[index]) savedWorkout[index] = {};
                
                // Salva a repetição APENAS se for uma linha de trabalho (work-row) e não estiver vazia
                if (isWorkRow && repIn && repIn.value !== "") {
                    savedWorkout[index].rep = repIn.value;
                }
                
                // Carga e RPI salvam se não estiverem vazios
                if (cargaIn && cargaIn.value !== "") savedWorkout[index].carga = cargaIn.value;
                if (rpiIn && rpiIn.value !== "") savedWorkout[index].rpi = rpiIn.value;

                localStorage.setItem(`workoutData_${exName}`, JSON.stringify(savedWorkout));

                // Se digitar na carga de trabalho (Top Set), dispara cálculo automático na hora
                if (cargaIn && cargaIn.classList.contains('work-carga')) {
                    calculateWarmups(exercise, cargaIn.value);
                }
            };

            // Adiciona os eventos de input
            if (repIn) repIn.addEventListener('input', saveInputs);
            if (cargaIn) cargaIn.addEventListener('input', saveInputs);
            if (rpiIn) rpiIn.addEventListener('input', saveInputs);
        });

        // 3. EXECUTA O CÁLCULO AO CARREGAR A PÁGINA BASEADO NO HISTÓRICO
        // Busca o input que tem a classe 'work-carga' para saber de onde tirar a base
        const mainWorkLoadInput = exercise.querySelector('.work-carga');
        if (mainWorkLoadInput) {
            // Acha em qual linha (index) esse input de carga principal está
            let topSetIndex = -1;
            inputRows.forEach((r, idx) => {
                if (r.contains(mainWorkLoadInput)) topSetIndex = idx;
            });
            
            // Se achou a linha e tem carga salva nela no LocalStorage, faz o cálculo!
            if (topSetIndex !== -1 && savedWorkout[topSetIndex] && savedWorkout[topSetIndex].carga) {
                calculateWarmups(exercise, savedWorkout[topSetIndex].carga);
            }
        }
    });

    /**
     * Calcula 50% (Aquecimento) e 80% (Preparatória) da carga base
     * e injeta nas linhas de histórico 'Aq' e 'Prep'.
     */
    function calculateWarmups(exerciseBlock, workLoadStr) {
        const load = parseFloat(workLoadStr);
        if (isNaN(load)) return;

        const warmUpLoad = Math.round(load * 0.5);
        const prepLoad = Math.round(load * 0.8);

        const histRows = exerciseBlock.querySelectorAll('.hist-row');
        histRows.forEach(row => {
            const typeCell = row.querySelector('td:first-child').innerText.trim();
            const cargaCell = row.querySelector('.hist-carga, td:nth-child(3)');
            
            if (cargaCell) {
                if (typeCell === 'Aq') {
                    cargaCell.innerText = warmUpLoad;
                    cargaCell.style.color = "var(--accent-white)";
                } else if (typeCell === 'Prep') {
                    cargaCell.innerText = prepLoad;
                    cargaCell.style.color = "var(--accent-white)";
                }
            }
        });
    }

});