const form = document.getElementById('adicionarDespesa');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const dataInput = document.getElementById('data');
const filtroTipoSelect = document.getElementById('filtroTipo');
const filtroValorInput = document.getElementById('filtroValorInput');
const aplicarFiltroButton = document.getElementById('aplicarFiltro');
const tabelaDespesas = document.querySelector('#despesas tbody');
const dinheiroEntrouSpan = document.getElementById('dinheiroEntrou');
const dinheiroSaiuSpan = document.getElementById('dinheiroSaiu');
const saldoTotalSpan = document.getElementById('saldoTotal');

// Carregar dados do localStorage ao carregar a página
const dados = carregarDados();

// Fazer uma cópia das despesas originais para usar ao aplicar filtros
let despesasOriginais = dados.despesas.slice();

// Atualizar a tabela e o saldo com os dados carregados
atualizarTabela();
atualizarSaldo();

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const descricao = descricaoInput.value;
    const valor = parseFloat(valorInput.value);
    const data = dataInput.value;

    if (!descricao || isNaN(valor) || !data) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    if (valor > 0) {
        dados.dinheiroEntrou += valor;
    } else {
        dados.dinheiroSaiu += Math.abs(valor);
    }

    adicionarDespesa(descricao, valor, data);
    descricaoInput.value = '';
    valorInput.value = '';
    dataInput.value = '';
    atualizarSaldo();
    salvarDados(dados);
});

// aplicarFiltroButton.addEventListener('click', () => {
//     const tipoFiltro = filtroTipoSelect.value;
//     const valorFiltro = parseFloat(filtroValorInput.value);

//     if (isNaN(valorFiltro)) {
//         alert('Por favor, insira um valor válido para o filtro.');
//         return;
//     }

//     // Limpar a tabela antes de aplicar o filtro
//     while (tabelaDespesas.firstChild) {
//         tabelaDespesas.removeChild(tabelaDespesas.firstChild);
//     }

//     // Filtrar e exibir as despesas com base na escolha do usuário
//     const despesasFiltradas = dados.despesas.filter(despesa => {
//         if (tipoFiltro === 'maior') {
//             return despesa.valor > valorFiltro;
//         } else if (tipoFiltro === 'menor') {
//             return despesa.valor < valorFiltro;
//         }
//         return false;
//     });

//     dados.despesas = despesasFiltradas;
//     atualizarTabela();
// });

function adicionarDespesa(descricao, valor, data) {
    const categoriaSelect = document.getElementById('categoria'); // Obter o elemento select de categoria
    const categoria = categoriaSelect.value; // Obter o valor da categoria selecionada

    const categoriaLabel = categoriaSelect.options[categoriaSelect.selectedIndex].text; // Obter o rótulo da categoria selecionada


    if (!categoria) {
        alert('Por favor, preencha a categoria.')
        return;
    }

    const novaDespesa = {
        descricao: descricao,
        valor: valor,
        data: data,
        categoria: categoria,
        categoriaLabel: categoriaLabel
    };

    dados.despesas.push(novaDespesa);
    atualizarTabela();
    salvarDados(dados);

}


function atualizarTabela() {
    tabelaDespesas.innerHTML = ''; // Limpar a tabela antes de atualizar

    for (const despesa of dados.despesas) {
        const newRow = tabelaDespesas.insertRow();
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
 
        cell1.innerHTML = despesa.descricao;
        cell2.innerHTML = `R$ ${despesa.valor.toFixed(2)}`;
        cell3.innerHTML = despesa.data;
        cell4.innerHTML = despesa.categoria;

        // Adicionar botões "Editar" e "Excluir" para cada despesa
        const editarButton = document.createElement('button');
        editarButton.textContent = 'Editar';
        editarButton.addEventListener('click', () => editarDespesa(despesa));
        cell4.appendChild(editarButton);

        const excluirButton = document.createElement('button');
        excluirButton.textContent = 'Excluir';
        excluirButton.addEventListener('click', () => excluirDespesa(despesa));
        cell4.appendChild(excluirButton);
    }
}

function editarDespesa(despesa) {
    const index = dados.despesas.indexOf(despesa);

    if (index !== -1) {
        const novaDescricao = prompt('Editar descrição:', despesa.descricao);
        const novoValor = parseFloat(prompt('Editar valor:', despesa.valor));
        const novaData = prompt('Editar data:', despesa.data);
        const novaCategoria = prompt('Editar categoria:', despesa.categoria)

        if (!novaDescricao || isNaN(novoValor) || !novaData) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const valorAntigo = despesa.valor;
        dados.despesas[index] = {
            descricao: novaDescricao,
            valor: novoValor,
            data: novaData,
            categoria: novaCategoria
        };

        // Atualizar os valores de dinheiroEntrou e dinheiroSaiu com base na diferença entre o valor antigo e o novo valor
        if (valorAntigo > 0) {
            dados.dinheiroEntrou += (novoValor - valorAntigo);
        } else {
            dados.dinheiroSaiu += (Math.abs(novoValor) - Math.abs(valorAntigo));
        }

        atualizarTabela();
        atualizarSaldo();
        salvarDados(dados);
}
}



function excluirDespesa(despesa) {
    const index = dados.despesas.indexOf(despesa);

    if (index !== -1) {
        const valorExcluido = dados.despesas[index].valor;

        if (valorExcluido > 0) {
            dados.dinheiroEntrou -= valorExcluido;
        } else {
            dados.dinheiroSaiu -= Math.abs(valorExcluido);
        }

        dados.despesas.splice(index, 1);
        atualizarTabela();
        atualizarSaldo();
        salvarDados(dados);
    }
}


function atualizarSaldo() {
    dinheiroEntrouSpan.textContent = dados.dinheiroEntrou.toFixed(2);
    dinheiroSaiuSpan.textContent = dados.dinheiroSaiu.toFixed(2);
    saldoTotalSpan.textContent = (dados.dinheiroEntrou - dados.dinheiroSaiu).toFixed(2);
}

function carregarDados() {
    const dadosSalvos = localStorage.getItem('dados');
    return dadosSalvos ? JSON.parse(dadosSalvos) : {
        dinheiroEntrou: 0,
        dinheiroSaiu: 0,
        despesas: []
    };
}

function salvarDados(dados) {
    localStorage.setItem('dados', JSON.stringify(dados));
}


// Filtro
const filtroCategoriaSelect = document.getElementById('filtroCategoria');
const aplicarFiltroCategoriaButton = document.getElementById('aplicarFiltroCategoria');

aplicarFiltroCategoriaButton.addEventListener('click', () => {
    const categoriaFiltro = filtroCategoriaSelect.value;

    // Limpar a tabela antes de aplicar o filtro
    while (tabelaDespesas.firstChild) {
        tabelaDespesas.removeChild(tabelaDespesas.firstChild);
    }

    // Filtrar e exibir as despesas com base na categoria escolhida
    const despesasFiltradas = despesasOriginais.filter(despesa => {
        if (categoriaFiltro === '') {
            return true; // Todas as categorias
        } else {
            return despesa.categoria === categoriaFiltro;
        }
    });

    dados.despesas = despesasFiltradas;
    atualizarTabela();
});
