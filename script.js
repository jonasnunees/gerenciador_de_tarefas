/*
 * GERENCIADOR DE TAREFAS - LÓGICA JAVASCRIPT
 * 
 * Este arquivo contém todas as funções que fazem a aplicação funcionar:
 * - Adicionar tarefas
 * - Exibir tarefas na tela
 * - Filtrar por mês/ano
 * - Marcar como concluída
 * - Remover tarefas
 * - Salvar dados no navegador (LocalStorage)
 */

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

/*
 * Carrega as tarefas salvas no LocalStorage quando a página é aberta
 * 
 * LocalStorage é um "armário" no navegador que guarda informações
 * mesmo depois de fechar a página ou o navegador
 * 
 * JSON.parse() converte o texto salvo de volta para um array de objetos
 * O operador || [] significa: "se não houver nada salvo, use um array vazio"
 */
let tasks = JSON.parse(localStorage.getItem('tasksDB')) || [];

// Renderiza (desenha) as tarefas na tela assim que a página carrega
renderTasks();


// ============================================================================
// FUNÇÃO 1: ADICIONAR NOVA TAREFA
// ============================================================================

function addTask() {
    /*
     * Esta função é chamada quando o usuário clica no botão "Adicionar Tarefa"
     * Ela captura os valores dos campos do formulário e cria uma nova tarefa
     */
    
    // Captura os valores digitados nos campos do formulário pelo ID
    const name = document.getElementById('taskInput').value;
    const dueDate = document.getElementById('dateInput').value;
    const priority = parseInt(document.getElementById('priorityInput').value);
    const observation = document.getElementById('obsInput').value;

    // Validação: verifica se os campos obrigatórios foram preenchidos
    if (!name || !dueDate) {
        alert("Preencha o nome e a data de entrega.");
        return; // Interrompe a função se faltar informação
    }

    /*
     * Cria um objeto com todas as informações da tarefa
     * 
     * Um objeto é como uma ficha com várias informações sobre algo
     * Cada propriedade (id, name, etc) guarda um tipo de informação
     */
    const newTask = {
        id: Date.now(), // Gera um ID único usando o timestamp atual
        name: name, // Nome da tarefa
        createdDate: new Date().toISOString().split('T')[0], // Data de hoje (formato: YYYY-MM-DD)
        dueDate: dueDate, // Data de entrega escolhida
        priority: priority, // Prioridade (1=Baixa, 2=Média, 3=Alta)
        observation: observation, // Observações opcionais
        completed: false // Inicia como não concluída
    };

    // Adiciona a nova tarefa ao final do array de tarefas
    tasks.push(newTask);
    
    // Salva no LocalStorage e atualiza a tela
    saveAndRender();
    
    /*
     * Limpa os campos do formulário após adicionar
     * Isso deixa o formulário pronto para adicionar outra tarefa
     */
    document.getElementById('taskInput').value = '';
    document.getElementById('dateInput').value = '';
    document.getElementById('obsInput').value = '';
}


// ============================================================================
// FUNÇÃO 2: SALVAR E RENDERIZAR
// ============================================================================

function saveAndRender() {
    /*
     * Esta função faz duas coisas importantes:
     * 1. Salva o array de tarefas no LocalStorage (persistência de dados)
     * 2. Atualiza a tela mostrando as tarefas atualizadas
     * 
     * JSON.stringify() converte o array de objetos em texto para poder salvar
     */
    localStorage.setItem('tasksDB', JSON.stringify(tasks));
    renderTasks();
}


// ============================================================================
// FUNÇÃO 3: LIMPAR FILTRO
// ============================================================================

function clearFilter() {
    /*
     * Remove o filtro de mês/ano, voltando a mostrar todas as tarefas
     */
    const filterInput = document.getElementById('filterMonth');
    if (filterInput) {
        filterInput.value = ''; // Limpa o campo de filtro
    }
    renderTasks(); // Atualiza a tela
}


// ============================================================================
// FUNÇÃO 4: RENDERIZAR TAREFAS (PRINCIPAL)
// ============================================================================

function renderTasks() {
    /*
     * Esta é a função mais importante do sistema!
     * Ela é responsável por:
     * 1. Filtrar tarefas por mês (se filtro estiver ativo)
     * 2. Ordenar tarefas por data de entrega
     * 3. Calcular se estão vencidas, ativas ou concluídas
     * 4. Criar o HTML de cada tarefa
     * 5. Colocar cada tarefa no grupo correto (Ativas, Expiradas, Concluídas)
     */
    
    // --- PASSO 1: Buscar os elementos HTML onde as tarefas serão inseridas ---
    const listActive = document.getElementById('listActive');
    const listExpired = document.getElementById('listExpired');
    const listCompleted = document.getElementById('listCompleted');
    
    // Pega o valor do filtro de mês (formato: YYYY-MM, ex: 2025-01)
    const filterMonth = document.getElementById('filterMonth') ? 
                        document.getElementById('filterMonth').value : '';

    // --- PASSO 2: Limpar as listas antes de inserir novamente ---
    // Isso evita duplicação de tarefas na tela
    if (listActive) listActive.innerHTML = '';
    if (listExpired) listExpired.innerHTML = '';
    if (listCompleted) listCompleted.innerHTML = '';

    // Pega a data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // --- PASSO 3: FILTRAR TAREFAS POR MÊS/ANO (se filtro estiver ativo) ---
    let tasksToShow = tasks; // Por padrão, mostra todas
    
    if (filterMonth) {
        /*
         * Filtra apenas tarefas cuja data de entrega começa com o mês selecionado
         * Ex: se filterMonth = "2025-01", mostra apenas tarefas de janeiro/2025
         * 
         * .filter() cria um novo array apenas com elementos que atendem a condição
         * .startsWith() verifica se o texto começa com determinado valor
         */
        tasksToShow = tasks.filter(task => task.dueDate.startsWith(filterMonth));
    }

    // --- PASSO 4: ORDENAR TAREFAS POR DATA DE ENTREGA (mais próxima primeiro) ---
    /*
     * .sort() reorganiza o array
     * Subtrair datas converte em números, permitindo comparação
     * Se a - b for negativo, 'a' vem antes de 'b'
     */
    tasksToShow.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // --- PASSO 5: CRIAR O HTML DE CADA TAREFA E COLOCAR NO GRUPO CORRETO ---
    tasksToShow.forEach(task => {
        /*
         * Para cada tarefa, vamos:
         * 1. Criar um elemento <li> (item de lista)
         * 2. Definir a aparência conforme a prioridade
         * 3. Calcular quantos dias faltam para o prazo
         * 4. Montar o HTML interno
         * 5. Decidir em qual lista colocar (Ativas, Expiradas ou Concluídas)
         */
        
        // Cria um novo elemento <li> (item de lista)
        const li = document.createElement('li');
        
        // Define a classe CSS conforme a prioridade (afeta a cor da borda)
        let priorityClass = task.priority === 3 ? 'p-alta' : 
                           (task.priority === 2 ? 'p-media' : 'p-baixa');
        li.className = priorityClass;

        // --- CÁLCULO DO PRAZO: Quantos dias faltam para a data de entrega? ---
        
        // Diferença em milissegundos entre a data de entrega e hoje
        const diffInMs = new Date(task.dueDate) - new Date(today);
        
        // Converte milissegundos para dias (arredonda para cima com Math.ceil)
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        
        // Texto que será exibido sobre o prazo
        let expiryText = "";
        
        if (diffInDays > 0) {
            // Prazo ainda não venceu
            expiryText = `Essa tarefa expira em ${diffInDays} dias.`;
        } else if (diffInDays === 0) {
            // Vence hoje!
            expiryText = `Essa tarefa expira HOJE!`;
        } else {
            // Já venceu
            expiryText = `Essa tarefa expirou há ${Math.abs(diffInDays)} dias.`;
        }

        // Converte datas de YYYY-MM-DD para DD/MM/YYYY (padrão brasileiro)
        const dateCreatedBR = task.createdDate.split('-').reverse().join('/');
        const dateDueBR = task.dueDate.split('-').reverse().join('/');

        // --- MONTA O HTML INTERNO DO <li> ---
        /*
         * Template literal (usando ``) permite inserir variáveis com ${}
         * Constrói toda a estrutura HTML da tarefa
         */
        li.innerHTML = `
            <div class="task-header">
                <div class="task-info">
                    <!-- Datas de criação e entrega -->
                    <div class="task-dates">
                        📋 Criada: ${dateCreatedBR} | 📅 Entrega: ${dateDueBR}
                    </div>
                    
                    <!-- Nome da tarefa -->
                    <strong class="task-title">${task.name}</strong>
                    
                    <!-- Observação (só aparece se existir) -->
                    ${task.observation ? `<div class="task-obs">${task.observation}</div>` : ''}
                    
                    <!-- Aviso de prazo (só aparece se não estiver concluída) -->
                    ${!task.completed ? `<div class="expiry-warning">${expiryText}</div>` : ''}
                </div>
            </div>
            
            <!-- Botões de ação -->
            <div class="actions">
                <!-- Botão de concluir/desmarcar -->
                <button class="btn-done" onclick="toggleTask(${task.id})">
                    ${task.completed ? 'Desmarcar' : 'Concluir'}
                </button>
                
                <!-- Botão de remover -->
                <button class="btn-del" onclick="removeTask(${task.id})">
                    Remover
                </button>
            </div>
        `;

        // --- DECIDIR EM QUAL LISTA COLOCAR A TAREFA ---
        
        if (task.completed) {
            // Se está concluída, vai para a lista de concluídas
            li.classList.add('completed-task'); // Adiciona estilo visual
            if (listCompleted) listCompleted.appendChild(li);
            
        } else if (diffInDays < 0) {
            // Se o prazo já passou, vai para lista de expiradas
            if (listExpired) listExpired.appendChild(li);
            
        } else {
            // Caso contrário, é uma tarefa ativa
            if (listActive) listActive.appendChild(li);
        }
    });

    // --- MENSAGEM CASO O FILTRO NÃO RETORNE NENHUMA TAREFA ---
    if (filterMonth && tasksToShow.length === 0 && listActive) {
        listActive.innerHTML = `
            <p style="color:#7f8c8d; font-style:italic; text-align:center;">
                Nenhuma tarefa encontrada para este mês.
            </p>
        `;
    }
}


// ============================================================================
// FUNÇÃO 5: ALTERNAR STATUS DE CONCLUÍDO
// ============================================================================

function toggleTask(id) {
    /*
     * Marca ou desmarca uma tarefa como concluída
     * 
     * Parâmetro 'id': identificador único da tarefa
     * 
     * .map() percorre todas as tarefas e cria um novo array
     * Se o ID bater, inverte o valor de 'completed' (true vira false, false vira true)
     * Operador spread {...t} copia todas as propriedades da tarefa
     */
    tasks = tasks.map(t => 
        t.id === id ? {...t, completed: !t.completed} : t
    );
    
    // Salva e atualiza a tela
    saveAndRender();
}


// ============================================================================
// FUNÇÃO 6: REMOVER TAREFA
// ============================================================================

function removeTask(id) {
    /*
     * Remove permanentemente uma tarefa
     * 
     * Parâmetro 'id': identificador único da tarefa a ser removida
     * 
     * confirm() abre uma janela de confirmação (segurança contra cliques acidentais)
     * .filter() cria um novo array SEM a tarefa que tem o ID especificado
     */
    if (confirm("Excluir tarefa permanentemente?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
}


// ============================================================================
// FIM DO CÓDIGO
// ============================================================================