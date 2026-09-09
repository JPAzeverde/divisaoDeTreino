(function () {
  "use strict";

  /* =========================================================
     CONFIGURAÇÕES
  ========================================================= */

  const CLUSTER_STORAGE_KEY = "workout_cluster_structure";


  /* =========================================================
     GERA CHAVE ÚNICA PARA O LOCALSTORAGE
  ========================================================= */

  function getStorageKey(cardTitle, exerciseName, serieIndex, field) {

    const clean = (str) =>
      str
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");

    return `workout_${clean(cardTitle)}_${clean(exerciseName)}_serie${serieIndex}_${field}`;
  }


  /* =========================================================
     SALVA O VALOR DIGITADO
  ========================================================= */

  function saveInputData(input) {

    const serieTable =
      input.closest(".exercise-item__table");

    if (!serieTable) return;


    const exerciseItem =
      serieTable.closest(".exercise-item");

    if (!exerciseItem) return;


    const card =
      exerciseItem.closest(".workout-card");

    if (!card) return;


    const cardTitle =
      card
        .querySelector(".workout-card__title")
        ?.textContent
        ?.trim() || "Unknown";


    const exerciseName =
      exerciseItem
        .querySelector(".exercise-item__name")
        ?.textContent
        ?.trim() || "Unknown";


    /* ---------------------------------------------------------
       Descobre qual é a série
    --------------------------------------------------------- */

    const allTables =
      exerciseItem.querySelectorAll(
        ".exercise-item__table"
      );

    let serieIndex = -1;

    allTables.forEach((table, idx) => {

      if (table === serieTable) {
        serieIndex = idx;
      }

    });

    if (serieIndex === -1) return;


    /* ---------------------------------------------------------
       Descobre qual campo foi alterado
    --------------------------------------------------------- */

    let field = "";

    if (
      input.classList.contains("serie-weight")
    ) {

      field = "weight";

    } else if (
      input.classList.contains("serie-reps")
    ) {

      field = "reps";

    } else if (
      input.classList.contains("serie-rpi")
    ) {

      field = "rpi";

    } else {

      return;
    }


    /* ---------------------------------------------------------
       Salva no localStorage
    --------------------------------------------------------- */

    const value =
      input.value.trim();

    const key =
      getStorageKey(
        cardTitle,
        exerciseName,
        serieIndex,
        field
      );


    if (value === "") {

      localStorage.removeItem(key);

    } else {

      localStorage.setItem(key, value);
    }


    /* ---------------------------------------------------------
       Atualiza histórico imediatamente
    --------------------------------------------------------- */

    updateHistoryForSerie(
      serieTable,
      cardTitle,
      exerciseName,
      serieIndex
    );


    /* ---------------------------------------------------------
       Se for Cluster, verifica se precisa criar
       uma nova linha
    --------------------------------------------------------- */

    if (isClusterExercise(exerciseItem)) {

    /*
     * Primeiro verifica se a linha
     * deve ser removida por estar com 0.
     */

    checkZeroClusterRow(input);


    /*
     * Depois verifica se deve criar
     * uma nova linha.
     */

    /*
     * Só verifica criação se a linha
     * ainda existir.
     */

    if (document.body.contains(serieTable)) {

        if (
            input.classList.contains("serie-reps")
        ) {

            checkClusterRow(input);
        }
    }
}
  }


  /* =========================================================
     ATUALIZA O HISTÓRICO DA SÉRIE
  ========================================================= */

  function updateHistoryForSerie(
    serieTable,
    cardTitle,
    exerciseName,
    serieIndex
  ) {

    const historyContainer =
      serieTable.querySelector(
        ".exercise-item__history"
      );

    if (!historyContainer) return;


    const weightEl =
      historyContainer.querySelector(
        ".serie-weight"
      );

    const repsEl =
      historyContainer.querySelector(
        ".serie-reps"
      );

    const rpiEl =
      historyContainer.querySelector(
        ".serie-rpi"
      );


    const weightKey =
      getStorageKey(
        cardTitle,
        exerciseName,
        serieIndex,
        "weight"
      );

    const repsKey =
      getStorageKey(
        cardTitle,
        exerciseName,
        serieIndex,
        "reps"
      );

    const rpiKey =
      getStorageKey(
        cardTitle,
        exerciseName,
        serieIndex,
        "rpi"
      );


    const weight =
      localStorage.getItem(weightKey);

    const reps =
      localStorage.getItem(repsKey);

    const rpi =
      localStorage.getItem(rpiKey);


    /* ---------------------------------------------------------
       Peso
    --------------------------------------------------------- */

    if (weightEl) {

      weightEl.textContent =
        weight
          ? `${weight} Kg`
          : "___Kg";
    }


    /* ---------------------------------------------------------
       Repetições
    --------------------------------------------------------- */

    if (repsEl) {

      repsEl.textContent =
        reps || "__";
    }


    /* ---------------------------------------------------------
       RPI
    --------------------------------------------------------- */

    if (rpiEl) {

      rpiEl.textContent =
        rpi || "_";
    }
  }


  /* =========================================================
     IDENTIFICA EXERCÍCIO CLUSTER
  ========================================================= */

  function isClusterExercise(exercise) {

    const type =
      exercise.querySelector(
        ".exercise-item__type"
      );

    if (!type) return false;

    return (
      type.textContent
        .trim()
        .toLowerCase() === "cluster set"
    );
  }


  /* =========================================================
     PEGA A REPETIÇÃO ESPERADA
     
     Exemplo:
     "∞ x 8" → 8
  ========================================================= */

  function getExpectedClusterReps(exercise) {

    const range =
      exercise.querySelector(
        ".exercise-item__range-reps"
      );

    if (!range) return null;


    const text =
      range.textContent.trim();


    const matches =
      text.match(/\d+/g);


    if (
      !matches ||
      matches.length === 0
    ) {

      return null;
    }


    return Number(
      matches[matches.length - 1]
    );
  }


  /* =========================================================
     CRIA NOVA LINHA CLUSTER
  ========================================================= */

  function createClusterRow(exercise) {

    const table =
      document.createElement("div");


    table.className =
      "exercise-item__table";


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

        <p class="serie-weight">___Kg</p>

        <p class="serie-reps">__</p>

        <p class="serie-rpi">_</p>

      </div>
    `;


    exercise.appendChild(table);


    return table;
  }


  /* =========================================================
     NUMERA AS LINHAS DO CLUSTER
  ========================================================= */

  function updateClusterNumbers(exercise) {

    const rows =
      exercise.querySelectorAll(
        ".exercise-item__table"
      );


    rows.forEach((row, index) => {

      const type =
        row.querySelector(
          ".exercise-item__inputs .serie-type"
        );


      if (type) {

        type.textContent =
          `C${toSuperscript(index + 1)}`;
      }

    });
  }


  /* =========================================================
     CONVERTE NÚMERO PARA SOBRESCRITO
  ========================================================= */

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
      .map(
        number =>
          superscript[number] || number
      )
      .join("");
  }


  /* =========================================================
     VERIFICA SE PRECISA CRIAR NOVA LINHA
  ========================================================= */

  function checkClusterRow(input) {

    const exercise =
      input.closest(".exercise-item");

    if (!exercise) return;


    if (!isClusterExercise(exercise)) {
      return;
    }


    const expectedReps =
      getExpectedClusterReps(exercise);

    if (!expectedReps) return;


    const reps =
      Number(input.value);


    if (!reps) return;


    /*
     * Só cria quando atingir exatamente
     * o número esperado.
     */

    if (reps !== expectedReps) {
      return;
    }


    const rows =
      exercise.querySelectorAll(
        ".exercise-item__table"
      );


    const lastRow =
      rows[rows.length - 1];


    /*
     * Só cria se a linha preenchida
     * for a última.
     */

    if (
      lastRow &&
      lastRow.contains(input)
    ) {

      createClusterRow(exercise);


      updateClusterNumbers(exercise);


      /*
       * Salva imediatamente a nova estrutura.
       */

      saveClusterStructure();
    }
  }


  /* =========================================================
     SALVA ESTRUTURA DOS CLUSTERS
  ========================================================= */

  function saveClusterStructure() {

    const structure = {};


    const exercises =
      document.querySelectorAll(
        ".exercise-item"
      );


    exercises.forEach(
      (exercise, index) => {

        if (
          !isClusterExercise(exercise)
        ) {

          return;
        }


        const rows =
          exercise.querySelectorAll(
            ".exercise-item__table"
          );


        structure[index] =
          rows.length;
      }
    );


    localStorage.setItem(
      CLUSTER_STORAGE_KEY,
      JSON.stringify(structure)
    );
  }


  /* =========================================================
     RESTAURA ESTRUTURA DOS CLUSTERS
  ========================================================= */

  function loadClusterStructure() {

    const saved =
      localStorage.getItem(
        CLUSTER_STORAGE_KEY
      );


    if (!saved) return;


    let structure;


    try {

      structure =
        JSON.parse(saved);

    } catch (error) {

      console.error(
        "Erro ao carregar estrutura Cluster:",
        error
      );

      return;
    }


    const exercises =
      document.querySelectorAll(
        ".exercise-item"
      );


    exercises.forEach(
      (exercise, index) => {

        if (
          !isClusterExercise(exercise)
        ) {

          return;
        }


        const savedRows =
          Number(structure[index]);


        if (
          !savedRows ||
          savedRows <= 1
        ) {

          return;
        }


        let currentRows =
          exercise.querySelectorAll(
            ".exercise-item__table"
          ).length;


        while (
          currentRows < savedRows
        ) {

          createClusterRow(
            exercise
          );

          currentRows++;
        }


        updateClusterNumbers(
          exercise
        );
      }
    );
  }


  /* =========================================================
     CARREGA TODO O HISTÓRICO
  ========================================================= */

  function loadAllHistory() {

    const cards =
      document.querySelectorAll(
        ".workout-card"
      );


    cards.forEach(card => {

      const cardTitle =
        card
          .querySelector(
            ".workout-card__title"
          )
          ?.textContent
          ?.trim() || "Unknown";


      const exerciseItems =
        card.querySelectorAll(
          ".exercise-item"
        );


      exerciseItems.forEach(
        exerciseItem => {

          const exerciseName =
            exerciseItem
              .querySelector(
                ".exercise-item__name"
              )
              ?.textContent
              ?.trim() || "Unknown";


          const tables =
            exerciseItem.querySelectorAll(
              ".exercise-item__table"
            );


          tables.forEach(
            (table, idx) => {

              updateHistoryForSerie(
                table,
                cardTitle,
                exerciseName,
                idx
              );

            }
          );

        }
      );

    });
  }


  /* =========================================================
     CONFIGURA OS LISTENERS
  ========================================================= */

  function setupListeners() {

    document.addEventListener(
      "input",
      function (e) {

        const target =
          e.target;


        if (
          target.matches(
            ".serie-weight, .serie-reps, .serie-rpi"
          )
        ) {

          saveInputData(target);
        }

      }
    );
  }


  /* =========================================================
     INICIALIZAÇÃO
  ========================================================= */

  function init() {

    /*
     * Primeiro restaura as linhas extras.
     */

    loadClusterStructure();


    /*
     * Depois carrega o histórico,
     * inclusive das linhas recém-criadas.
     */

    loadAllHistory();


    /*
     * Por último ativa os listeners.
     */

    setupListeners();
  }


  /* =========================================================
     INICIA
  ========================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();

