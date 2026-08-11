/* =========================================================
   WORKOUT TRACKER
   app.js
   ========================================================= */

"use strict";


/* =========================================================
   01. STORAGE CONFIGURATION
   ========================================================= */

const STORAGE_KEYS = {
    workoutData: "workoutTracker_workoutData",
    completedDays: "workoutTracker_completedDays"
};


/* =========================================================
   02. STORAGE HELPERS
   ========================================================= */

function getStorageData(key, fallback = {}) {

    try {

        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            `Erro ao ler dados do localStorage (${key}):`,
            error
        );

        return fallback;
    }
}


function saveStorageData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            `Erro ao salvar dados no localStorage (${key}):`,
            error
        );

    }
}


/* =========================================================
   03. GLOBAL DATA
   ========================================================= */

let workoutData = getStorageData(
    STORAGE_KEYS.workoutData,
    {}
);


let completedDays = getStorageData(
    STORAGE_KEYS.completedDays,
    {}
);


/* =========================================================
   04. INPUT KEYS
   ========================================================= */

/*
 * Gera a chave utilizada para salvar
 * os dados de cada série.
 *
 * Exemplo:
 *
 * supino-reto_set-1_weight
 * supino-reto_set-1_reps
 * supino-reto_set-1_partials
 * supino-reto_set-1_rir
 */

function getInputKey(input) {

    const exercise =
        input.dataset.exercise;

    const set =
        input.dataset.set;

    const inputType =
        input.dataset.input;

    return `${exercise}_set-${set}_${inputType}`;
}


/*
 * Chave específica para cardio.
 */

function getCardioInputKey(input) {

    const cardio =
        input.closest("[data-cardio]");

    const cardioName =
        cardio?.dataset.cardio || "default";

    const inputType =
        input.dataset.cardioInput;

    return `cardio_${cardioName}_${inputType}`;
}


/* =========================================================
   05. SET HISTORY
   ========================================================= */

/*
 * Atualiza o histórico de UMA série.
 *
 * A função procura a .set-row correspondente
 * ao input alterado e atualiza:
 *
 * Carga
 * Reps
 * Parciais
 * RIR
 */

function updateSetHistory(input) {

    const row =
        input.closest(".set-row");


    if (!row) {
        return;
    }


    const exercise =
        input.dataset.exercise;

    const set =
        input.dataset.set;


    const history =
        row.querySelector(".set-row-history");


    if (!history) {
        return;
    }


    const fields = [
        "weight",
        "reps",
        "partials",
        "rir"
    ];


    fields.forEach(field => {

        const historyElement =
            history.querySelector(
                `[data-history="${field}"]`
            );


        if (!historyElement) {
            return;
        }


        const key =
            `${exercise}_set-${set}_${field}`;


        const savedValue =
            workoutData[key];


        historyElement.textContent =
            savedValue !== undefined &&
            savedValue !== ""
                ? savedValue
                : "—";

    });

}


/*
 * Atualiza o histórico de todas as séries
 * existentes na página.
 */

function loadAllSetHistories() {

    const rows =
        document.querySelectorAll(
            ".set-row"
        );


    rows.forEach(row => {

        const input =
            row.querySelector(
                "[data-input]"
            );


        if (!input) {
            return;
        }


        updateSetHistory(input);

    });

}


/* =========================================================
   06. SAVE TRAINING INPUT
   ========================================================= */

function saveTrainingInput(input) {

    const key =
        getInputKey(input);


    workoutData[key] =
        input.value;


    saveStorageData(
        STORAGE_KEYS.workoutData,
        workoutData
    );


    markInputAsSaved(input);


    /*
     * Atualiza o histórico imediatamente
     * depois que o valor for salvo.
     */

    updateSetHistory(input);

}


/* =========================================================
   07. SAVE CARDIO INPUT
   ========================================================= */

function saveCardioInput(input) {

    const key =
        getCardioInputKey(input);


    workoutData[key] =
        input.value;


    saveStorageData(
        STORAGE_KEYS.workoutData,
        workoutData
    );


    markInputAsSaved(input);

}


/* =========================================================
   08. VISUAL SAVE FEEDBACK
   ========================================================= */

function markInputAsSaved(input) {

    input.classList.add(
        "is-saved"
    );


    clearTimeout(
        input._saveFeedbackTimeout
    );


    input._saveFeedbackTimeout =
        setTimeout(() => {

            input.classList.remove(
                "is-saved"
            );

        }, 500);

}


/* =========================================================
   09. LOAD TRAINING INPUTS
   ========================================================= */

function loadTrainingInputs() {

    const inputs =
        document.querySelectorAll(
            "[data-input]"
        );


    inputs.forEach(input => {

        const key =
            getInputKey(input);


        if (
            Object.prototype.hasOwnProperty.call(
                workoutData,
                key
            )
        ) {

            input.value =
                workoutData[key];

        }

    });

}


/* =========================================================
   10. LOAD CARDIO INPUTS
   ========================================================= */

function loadCardioInputs() {

    const inputs =
        document.querySelectorAll(
            "[data-cardio-input]"
        );


    inputs.forEach(input => {

        const key =
            getCardioInputKey(input);


        if (
            Object.prototype.hasOwnProperty.call(
                workoutData,
                key
            )
        ) {

            input.value =
                workoutData[key];

        }

    });

}


/* =========================================================
   11. DAY UI
   ========================================================= */

function updateDayUI(day, completed) {

    const card =
        document.querySelector(
            `[data-day="${day}"]`
        );


    const button =
        document.querySelector(
            `[data-day-toggle="${day}"]`
        );


    if (!card || !button) {
        return;
    }


    /*
     * Classe visual.
     */

    card.classList.toggle(
        "is-completed",
        completed
    );


    /*
     * Estado de acessibilidade.
     */

    button.setAttribute(
        "aria-pressed",
        String(completed)
    );


    /*
     * Atualiza o texto do aria-label.
     */

    if (completed) {

        button.setAttribute(
            "aria-label",
            `Desmarcar ${day} como concluído`
        );

    } else {

        button.setAttribute(
            "aria-label",
            `Marcar ${day} como concluído`
        );

    }

}


/* =========================================================
   12. TOGGLE DAY
   ========================================================= */

function toggleDay(day) {

    completedDays[day] =
        !Boolean(
            completedDays[day]
        );


    saveStorageData(
        STORAGE_KEYS.completedDays,
        completedDays
    );


    updateDayUI(
        day,
        completedDays[day]
    );

}


/* =========================================================
   13. LOAD COMPLETED DAYS
   ========================================================= */

function loadCompletedDays() {

    const buttons =
        document.querySelectorAll(
            "[data-day-toggle]"
        );


    buttons.forEach(button => {

        const day =
            button.dataset.dayToggle;


        const completed =
            Boolean(
                completedDays[day]
            );


        updateDayUI(
            day,
            completed
        );

    });

}


/* =========================================================
   14. DAY BUTTON EVENTS
   ========================================================= */

function initializeDayButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-day-toggle]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const day =
                    button.dataset.dayToggle;


                toggleDay(day);

            }
        );

    });

}


/* =========================================================
   15. TRAINING INPUT EVENTS
   ========================================================= */

function initializeTrainingInputs() {

    const inputs =
        document.querySelectorAll(
            "[data-input]"
        );


    inputs.forEach(input => {

        /*
         * Salvar ao sair do campo.
         */

        input.addEventListener(
            "blur",
            () => {

                saveTrainingInput(
                    input
                );

            }
        );


        /*
         * Salvar quando o valor mudar.
         */

        input.addEventListener(
            "change",
            () => {

                saveTrainingInput(
                    input
                );

            }
        );

    });

}


/* =========================================================
   16. CARDIO INPUT EVENTS
   ========================================================= */

function initializeCardioInputs() {

    const inputs =
        document.querySelectorAll(
            "[data-cardio-input]"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "blur",
            () => {

                saveCardioInput(
                    input
                );

            }
        );


        input.addEventListener(
            "change",
            () => {

                saveCardioInput(
                    input
                );

            }
        );

    });

}


/* =========================================================
   17. OPTIONAL INPUTS
   ========================================================= */

function initializeOptionalInputs() {

    const inputs =
        document.querySelectorAll(
            ".training-input--optional"
        );


    inputs.forEach(input => {

        input.setAttribute(
            "placeholder",
            "—"
        );


        input.setAttribute(
            "title",
            "Opcional: repetições parciais"
        );

    });

}


/* =========================================================
   18. INPUT VALIDATION
   ========================================================= */

function validateNumericInput(input) {

    if (input.value === "") {
        return;
    }


    const value =
        Number(input.value);


    if (Number.isNaN(value)) {

        input.value = "";

        return;
    }


    if (value < 0) {

        input.value = 0;

    }

}


/* =========================================================
   19. INPUT VALIDATION EVENTS
   ========================================================= */

function initializeInputValidation() {

    const inputs =
        document.querySelectorAll(
            'input[type="number"]'
        );


    inputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                validateNumericInput(
                    input
                );

            }
        );

    });

}


/* =========================================================
   20. CURRENT DAY
   ========================================================= */

function highlightCurrentDay() {

    const dayMap = {

        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday"

    };


    const today =
        dayMap[
            new Date().getDay()
        ];


    const currentCard =
        document.querySelector(
            `[data-day="${today}"]`
        );


    if (currentCard) {

        currentCard.classList.add(
            "is-today"
        );

    }

}


/* =========================================================
   21. MARK INPUTS WITH DATA
   ========================================================= */

function initializeStorageStatus() {

    const inputs =
        document.querySelectorAll(
            ".training-input"
        );


    inputs.forEach(input => {

        if (
            input.value !== ""
        ) {

            input.classList.add(
                "has-data"
            );

        }

    });

}


/* =========================================================
   22. PAGE INITIALIZATION
   ========================================================= */

function initializeApp() {

    /*
     * ==============================================
     * RESTORE DATA
     * ==============================================
     */

    loadTrainingInputs();

    loadCardioInputs();

    loadCompletedDays();


    /*
     * ==============================================
     * RESTORE HISTORY
     * ==============================================
     */

    loadAllSetHistories();


    /*
     * ==============================================
     * EVENTS
     * ==============================================
     */

    initializeDayButtons();

    initializeTrainingInputs();

    initializeCardioInputs();


    /*
     * ==============================================
     * EXTRA FEATURES
     * ==============================================
     */

    initializeOptionalInputs();

    initializeInputValidation();

    highlightCurrentDay();

    initializeStorageStatus();


    console.log(
        "Workout Tracker inicializado."
    );

}


/* =========================================================
   23. DOM READY
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();

}
