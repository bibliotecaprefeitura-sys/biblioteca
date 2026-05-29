// loader.js - Carregador Automático via Google Sheets
const SHEET_ID = '1DMFrXCLhj_OoFkSRFQXv2yPt2VOsgonZjiszIRFYK24';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Detecta automaticamente qual é a página atual baseado no nome do arquivo HTML
function obterCategoriaAtual() {
    const path = window.location.pathname;
    const pagina = path.substring(path.lastIndexOf('/') + 1);
    return pagina.replace('.html', '').toLowerCase();
}

async function carregarLinks() {
    // Procura o container onde o Claude colocava os links. Geralmente é uma div com classe 'links-container' ou 'container'
    // Se o seu container tiver outro ID ou Classe, vamos ajustar depois.
    const container = document.getElementById('links-container') || document.querySelector('.container') || document.querySelector('main');
    
    if (!container) return;

    const categoriaAtual = obterCategoriaAtual();
    
    // Não executa na index principal
    if (categoriaAtual === 'index' || categoriaAtual === '') return;

    try {
        const resposta = await fetch(SHEET_URL);
        const texto = await resposta.text();
        // Limpa a resposta do Google para virar um JSON válido
        const jsonDados = JSON.parse(texto.substr(47).slice(0, -3));
        const linhas = jsonDados.table.rows;

        // Limpa o conteúdo estático antigo (mantendo apenas o cabeçalho se houver)
        // Vamos preservar botões de "Voltar" ou "Área Administrativa" se estiverem fora do bloco de links
        const blocosAntigos = container.querySelectorAll('.link-card, .card, a[target="_blank"]');
        blocosAntigos.forEach(el => el.remove());

        let temLinks = false;

        linhas.forEach(linha => {
            const cols = linha.c;
            if (!cols || cols.length < 5) return;

            const categoria = cols[0] ? cols[0].v.toLowerCase().trim() : '';
            const titulo = cols[1] ? cols[1].v : '';
            const autor = cols[2] ? cols[2].v : '';
            const descricao = cols[3] ? cols[3].v : '';
            const url = cols[4] ? cols[4].v : '';

            // Se a linha da planilha for da página que o usuário está visitando
            if (categoria === categoriaAtual) {
                temLinks = true;
                
                // Criar o bloco visual simulando a estrutura do Claude
                const card = document.createElement('a');
                card.href = url;
                card.target = '_blank';
                card.className = 'link-card'; // Altere para a classe real do seu CSS se necessário
                card.style.textDecoration = 'none';
                card.style.display = 'block';

                // Estrutura interna com base nos prints que você mandou
                let htmlInterno = `
                    <div style="display: flex; align-items: center; background: white; border: 1px solid #ced4da; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s;">
                        <div style="flex-grow: 1;">
                            <h3 style="margin: 0 0 5px 0; color: #004085; font-size: 1.1rem; font-weight: bold;">${titulo}</h3>
                `;

                // Se for dica de leitura e tiver autor, adiciona a linha do autor
                if (categoriaAtual === 'dicaleitura' && autor) {
                    htmlInterno += `<p style="margin: 0 0 5px 0; color: #495057; font-style: italic; font-size: 0.9rem;">Autor(a): ${autor}</p>`;
                }

                htmlInterno += `
                            <p style="margin: 0; color: #6c757d; font-size: 0.9rem; line-height: 1.4;">${descricao}</p>
                        </div>
                        <div style="color: #6c757d; margin-left: 15px;">➔</div>
                    </div>
                `;

                card.innerHTML = htmlInterno;
                
                // Insere o card na tela (antes do botão de Área Administrativa se ele existir)
                const areaAdmin = container.querySelector('.admin-btn, #area-administrativa');
                if (areaAdmin) {
                    container.insertBefore(card, areaAdmin);
                } else {
                    container.appendChild(card);
                }
            }
        });

        if (!temLinks) {
            container.innerHTML += `<p style="text-align:center; color:#6c757d; margin-top:20px;">Nenhum link disponível nesta seção no momento.</p>`;
        }

    } catch (erro) {
        console.error("Erro ao carregar dados da planilha:", erro);
    }
}

// Executa assim que a página carrega
document.addEventListener('DOMContentLoaded', carregarLinks);
