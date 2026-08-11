const splitCards = document.querySelectorAll('.split-card');
const btnReset = document.querySelector('.btn-reset');

function verificarTodosMarcados() {
    const marcados = document.querySelectorAll('.split-card.mark').length;
    
    if (marcados === splitCards.length && splitCards.length > 0) {
        btnReset.style.display = 'inline-block';
    } else {
        btnReset.style.display = 'none';
    }
}

function carregarEstado() {
    splitCards.forEach((card, index) => {
        const estaMarcado = localStorage.getItem(`card_marcado_${index}`) === 'true';
        
        if (estaMarcado) {
            card.classList.add('mark');
            const btnCircle = card.querySelector('.btn-circle');
            if (btnCircle) {
                btnCircle.classList.add('active');
            }
        }
    });
    
    verificarTodosMarcados();
}

splitCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        card.classList.toggle('mark');
        
        const btnCircle = card.querySelector('.btn-circle');
        if (btnCircle) {
            btnCircle.classList.toggle('active');
        }
        
        const isMarked = card.classList.contains('mark');
        if (isMarked) {
            localStorage.setItem(`card_marcado_${index}`, 'true');
        } else {
            localStorage.removeItem(`card_marcado_${index}`);
        }
        
        verificarTodosMarcados();
    });
});

btnReset.addEventListener('click', () => {
    splitCards.forEach((card, index) => {
        card.classList.remove('mark');
        
        const btnCircle = card.querySelector('.btn-circle');
        if (btnCircle) {
            btnCircle.classList.remove('active');
        }
        
        localStorage.removeItem(`card_marcado_${index}`);
    });
    
    btnReset.style.display = 'none';
});

carregarEstado();