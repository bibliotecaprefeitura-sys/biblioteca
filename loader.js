// loader.js - Carregador Automático via Google Sheets (Ajustado ao Design do Claude)
const SHEET_ID = '1DMFrXCLhj_OoFkSRFQXv2yPt2VOsgonZjiszIRFYK24';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const LIST_ICON_COLORS = ['ci-blue', 'ci-green', 'ci-teal', 'ci-gold', 'ci-coral', 'ci-purple'];
const LIST_ICONS = ['ti-player-play', 'ti-file-text', 'ti-search', 'ti-database', 'ti-chart-bar', 'ti-bookmark'];

function obterCategoriaAtual() {
    const path = window.location.pathname;
    const pagina = path.substring(path.lastIndexOf('/') + 1);
    return pagina.replace('.html', '').toLowerCase().trim();
}

async function carregarLinksDaPlanilha() {
    // Encontra a lista exata do Claude
    const listContainer = document.getElementById('items-list');
    if (!listContainer) return;

    let categoriaAtual = obterCategoriaAtual();
    if (categoriaAtual === 'index' || categoriaAtual === '') return;

    try {
        const resposta = await fetch(SHEET_URL);
        const texto = await resposta.text();
        
        // Trata o JSON do Google Planilhas
        const jsonDados = JSON.parse(texto.substr(47).slice(0, -3));
        const linhas = jsonDados.table.rows;

        let htmlFinal = '';
        let contadorItem = 0;

        linhas.forEach(linha => {
            const cols = telemetryCols = linha.c;
            if (!cols || cols.length < 5) return;

            const categoriaPlanilha = cols[0] ? cols[0].v.toLowerCase().trim() : '';
            const titulo = cols[1] ? cols[1].v : '';
            const autor = cols[2] ? cols[2].v : '';
            const descricao = cols[3] ? cols[3].v : '';
            const url = cols[4] ? cols[4].v : '';

            // Se bater com a página que o usuário está navegando
            if (categoriaPlanilha === categoriaAtual) {
                const corIcone = LIST_ICON_COLORS[contadorItem % LIST_ICON_COLORS.length];
                const classeIcone = LIST_ICONS[contadorItem % LIST_ICONS.length];
                const classeDestaque = contadorItem === 0 ? ' featured' : '';

                // Constrói o HTML exatamente igual ao modelo do Claude
                htmlFinal += `
                    <a href="${url}" class="link-card${classeDestaque}" target="_blank" rel="noopener">
                        <div class="card-icon ${corIcone}">
                            <i class="ti ${classeIcone}" aria-hidden="true"></i>
                        </div>
                        <div class="card-body">
                            <div class="card-title">${titulo}</div>
                            ${categoriaAtual === 'dicaleitura' && autor ? `<div class="card-desc" style="font-style: italic; color: var(--text-main); margin-bottom: 4px;">Autor(a): ${autor}</div>` : ''}
                            <div class="card-desc">${descricao}</div>
                        </div>
                        <i class="ti ti-arrow-right card-arrow" aria-hidden="true"></i>
                    </a>
                `;
                contadorItem++;
            }
        });

        // Se encontrou links na planilha, substitui os do sistema antigo completamente
        if (contadorItem > 0) {
            listContainer.innerHTML = htmlFinal;
        } else {
            listContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:14px;padding:2rem 0">Nenhum item disponível nesta seção no momento.</p>';
        }

    } catch (erro) {
        console.error("Erro ao carregar os dados do Google Sheets:", erro);
    }
}

// Executa logo após a renderização padrão para garantir que a planilha vença o localStorage
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(carregarLinksDaPlanilha, 100);
});
