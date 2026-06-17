document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('calendario'); // ID do contêiner
  const restartBtn = document.getElementById('restart-btn');
  const STORAGE_KEY = 'miniCardsMarcados';

  // Função para gerar um identificador único do card baseado no texto interno
  function gerarIdCard(card) {
    // Pega o texto completo do card e remove espaços extras
    return card.textContent.trim().replace(/\s+/g, ' ');
  }

  // Recupera os IDs salvos
  function obterMarcados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  // Salva os IDs no localStorage
  function salvarMarcados(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  // Aplica as marcações salvas a todos os cards atuais
  function aplicarMarcacoesSalvas() {
    const marcados = obterMarcados();
    const cards = container.querySelectorAll('.miniCard');
    cards.forEach(card => {
      const id = gerarIdCard(card);
      card.classList.toggle('mark', marcados.includes(id));
    });
  }

  // Verifica se todos os cards estão marcados
  function verificarTodosMarcados() {
    const cards = container.querySelectorAll('.miniCard');
    const todosMarcados = Array.from(cards).every(card =>
      card.classList.contains('mark')
    );
    restartBtn.classList.toggle('hidden', !todosMarcados);
  }

  // Atualiza o localStorage com base nos cards marcados no momento
  function atualizarStorage() {
    const marcadosIds = Array.from(container.querySelectorAll('.miniCard.mark'))
      .map(card => gerarIdCard(card));
    salvarMarcados(marcadosIds);
  }

  // Delegação de evento: escuta cliques no contêiner
  container.addEventListener('click', (evento) => {
    const card = evento.target.closest('.miniCard'); // encontra o card clicado
    if (!card) return; // não é um card

    card.classList.toggle('mark');
    atualizarStorage();
    verificarTodosMarcados();
  });

  // Evento do botão "Recomeçar"
  restartBtn.addEventListener('click', () => {
    container.querySelectorAll('.miniCard.mark').forEach(card => {
      card.classList.remove('mark');
    });
    salvarMarcados([]);
    restartBtn.classList.add('hidden');
  });

  // Inicialização
  aplicarMarcacoesSalvas();
  verificarTodosMarcados();
});