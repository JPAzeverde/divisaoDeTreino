/* =========================================================
   CLUSTER SET — LINHAS DINÂMICAS
========================================================= */

const CLUSTER_STORAGE_KEY = "workout_cluster_structure";


/**
 * Retorna todos os exercícios que utilizam Cluster Set.
 */
function getClusterExercises() {
    return document.querySelectorAll(".exercise-item");
}


/**
 * Verifica se um exercício é do tipo Cluster Set.
 */
function isClusterExercise(exercise) {
    const type = exercise.querySelector(".exercise-item__type");

    if (!type) return false;

    return type.textContent.trim().toLowerCase() === "cluster set";
}


/**
 * Obtém a quantidade esperada de repetições.
 *
 * Exemplos:
 * "∞ x 8"    → 8
 * "∞ x 10"   → 10
 * "2x 8~12"  → não é Cluster, mas retorna 8
 */
function getExpectedClusterReps(exercise) {
    const range = exercise.querySelector(".exercise-item__range-reps");

    if (!range) return null;

    const text = range.textContent.trim();

    /*
     * Procura o último número da informação.
     * Exemplo:
     * "∞ x 8" → 8
     */
    const matches = text.match(/\d+/g);

    if (!matches || matches.length === 0) {
        return null;
    }

    return Number(matches[matches.length - 1]);
}


/**
 * Cria uma nova linha de Cluster.
 */
function createClusterRow(exercise) {

    const table = document.createElement("div");

    table.className = "exercise-item__table";

    table.innerHTML = `
        <div class="exercise-item__inputs">
            <p class="serie-type">C¹</p>

            <input
                inputmode="numeric"
                class="serie-weight"
                type="number"
                placeholder="000kg"
            >

            <input
                inputmode="numeric"
                class="serie-reps"
                type="number"
                placeholder="00"
            >

            <input
                inputmode="numeric"
                class="serie-rpi"
                type="number"
                placeholder="0"
            >
        </div>

        <div class="exercise-item__history">
            <p class="serie-type">Cluster</p>
            <p class="serie-weight">---Kg</p>
            <p class="serie-reps">--</p>
            <p class="serie-rpi">--</p>
        </div>
    `;

    exercise.appendChild(table);

    return table;
}


/**
 * Atualiza a numeração das linhas:
 *
 * C¹
 * C²
 * C³
 * C⁴
 * ...
 */
function updateClusterNumbers(exercise) {

    const rows = exercise.querySelectorAll(".exercise-item__table");

    rows.forEach((row, index) => {

        const type = row.querySelector(
            ".exercise-item__inputs .serie-type"
        );

        if (type) {
            type.textContent = `C${toSuperscript(index + 1)}`;
        }

    });
}


/**
 * Converte números normais para sobrescrito.
 */
function toSuperscript(number) {

    const superscript = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹"
    };

    return String(number)
        .split("")
        .map(number => superscript[number] || number)
        .join("");
}


/**
 * Salva no localStorage a quantidade
 * de linhas existentes em cada exercício Cluster.
 */
function saveClusterStructure() {

    const structure = {};

    getClusterExercises().forEach((exercise, index) => {

        if (!isClusterExercise(exercise)) {
            return;
        }

        const rows = exercise.querySelectorAll(
            ".exercise-item__table"
        );

        structure[index] = rows.length;
    });

    localStorage.setItem(
        CLUSTER_STORAGE_KEY,
        JSON.stringify(structure)
    );
}


/**
 * Restaura as linhas salvas anteriormente.
 */
function loadClusterStructure() {

    const saved = localStorage.getItem(
        CLUSTER_STORAGE_KEY
    );

    if (!saved) return;

    let structure;

    try {
        structure = JSON.parse(saved);
    } catch (error) {
        console.error(
            "Erro ao carregar estrutura Cluster:",
            error
        );

        return;
    }

    getClusterExercises().forEach((exercise, index) => {

        if (!isClusterExercise(exercise)) {
            return;
        }

        const savedRows = Number(structure[index]);

        if (!savedRows || savedRows <= 1) {
            return;
        }

        let currentRows = exercise.querySelectorAll(
            ".exercise-item__table"
        ).length;

        while (currentRows < savedRows) {

            createClusterRow(exercise);

            currentRows++;
        }

        updateClusterNumbers(exercise);
    });
}


/**
 * Verifica uma linha específica.
 *
 * Se as reps forem iguais à meta,
 * cria uma nova linha.
 */
function checkClusterRow(input) {

    const exercise = input.closest(".exercise-item");

    if (!exercise) return;

    if (!isClusterExercise(exercise)) {
        return;
    }

    const expectedReps =
        getExpectedClusterReps(exercise);

    if (!expectedReps) {
        return;
    }

    const reps = Number(input.value);

    if (!reps) {
        return;
    }


    /*
     * Só cria uma nova linha quando:
     *
     * reps === reps esperadas
     */
    if (reps === expectedReps) {

        const rows = exercise.querySelectorAll(
            ".exercise-item__table"
        );

        const lastRow = rows[rows.length - 1];

        /*
         * Só cria uma nova linha se a linha
         * preenchida for a última existente.
         *
         * Isso evita criar várias linhas
         * acidentalmente ao editar uma linha antiga.
         */
        if (lastRow && lastRow.contains(input)) {

            createClusterRow(exercise);

            updateClusterNumbers(exercise);

            saveClusterStructure();
        }
    }
}


/**
 * Configura os eventos dos exercícios Cluster.
 */
function setupClusterListeners() {

    document.addEventListener("input", function(event) {

        if (
            event.target.classList.contains("serie-reps")
        ) {

            checkClusterRow(event.target);
        }

    });
}


/**
 * Inicializa o sistema Cluster.
 */
function initClusterSystem() {

    loadClusterStructure();

    setupClusterListeners();
}


/*
 * Inicia depois que o HTML estiver carregado.
 */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initClusterSystem
    );

} else {

    initClusterSystem();
}

/* =========================================================
   REMOVE LINHA CLUSTER SE TODOS OS INPUTS FOREM 0
========================================================= */

function checkZeroClusterRow(input) {

    const row = input.closest(".exercise-item__table");

    if (!row) return;


    const exercise =
        row.closest(".exercise-item");

    if (!exercise) return;


    /* ---------------------------------------------------------
       Só funciona em exercícios Cluster Set
    --------------------------------------------------------- */

    if (!isClusterExercise(exercise)) {
        return;
    }


    /* ---------------------------------------------------------
       Descobre o índice da série
       
       C¹ = índice 0
       C² = índice 1
       C³ = índice 2
       ...
    --------------------------------------------------------- */

    const rows =
        Array.from(
            exercise.querySelectorAll(
                ".exercise-item__table"
            )
        );


    const rowIndex =
        rows.indexOf(row);


    /*
     * C¹ NUNCA pode ser removido.
     */

    if (rowIndex === 0) {
        return;
    }


    /* ---------------------------------------------------------
       Pega os três inputs
    --------------------------------------------------------- */

    const weight =
        row.querySelector(
            ".serie-weight"
        )?.value.trim();


    const reps =
        row.querySelector(
            ".serie-reps"
        )?.value.trim();


    const rpi =
        row.querySelector(
            ".serie-rpi"
        )?.value.trim();


    /* ---------------------------------------------------------
       Só remove se TODOS forem 0
    --------------------------------------------------------- */

    if (
        weight === "0" &&
        reps === "0" &&
        rpi === "0"
    ) {

        /*
         * Remove a linha da tela.
         */

        row.remove();


        /*
         * Renumera as linhas restantes.
         */

        updateClusterNumbers(
            exercise
        );


        /*
         * Salva a nova estrutura.
         */

        saveClusterStructure();
    }
}