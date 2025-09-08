// --- INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9yJzA2imAFsUjYGF7S7HzTA3kPNf6P7o",
  authDomain: "calculadora-ir-56a2c.firebaseapp.com",
  projectId: "calculadora-ir-56a2c",
  storageBucket: "calculadora-ir-56a2c.appspot.com",
  messagingSenderId: "613402077853",
  appId: "1:613402077853:web:244d838cc2a99452288274"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ELEMENTOS DO DOM ---
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const noAccessScreen = document.getElementById('no-access-screen');
const logoutFromNoAccessBtn = document.getElementById('logout-from-no-access');
const calculatorContent = document.getElementById('calculator-content');
const authContainer = document.getElementById('auth-container');
const userEmailDisplay = document.getElementById('user-email');
const signOutButton = document.getElementById('sign-out-button');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signInButton = document.getElementById('sign-in-button');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const loginMessage = document.getElementById('login-message');
const registerEmailInput = document.getElementById('register-email-input');
const registerPasswordInput = document.getElementById('register-password-input');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password-input');
const registerButton = document.getElementById('register-button');
const registerMessage = document.getElementById('register-message');
const goToRegisterLink = document.getElementById('go-to-register-link');
const goToLoginLink = document.getElementById('go-to-login-link');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');
const termsModal = document.getElementById('terms-modal-overlay');
const acceptTermsBtn = document.getElementById('accept-terms-btn');
const declineTermsBtn = document.getElementById('decline-terms-btn');

// --- LÓGICA DE VISIBILIDADE DA SENHA ---
const eyeIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`;
const eyeSlashIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29M7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>`;

function setupPasswordToggle(inputId, toggleId) {
    const passwordField = document.getElementById(inputId);
    const toggleButton = document.getElementById(toggleId);
    if (passwordField && toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleButton.innerHTML = eyeSlashIcon;
            } else {
                passwordField.type = 'password';
                toggleButton.innerHTML = eyeIcon;
            }
        });
    }
}
setupPasswordToggle('password-input', 'toggle-login-password');
setupPasswordToggle('register-password-input', 'toggle-register-password');
setupPasswordToggle('register-confirm-password-input', 'toggle-confirm-password');

// --- LÓGICA DE AUTENTICAÇÃO E VERIFICAÇÃO ---
async function checkUserPaymentStatus(user) {
    if (!user) return false;
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("buyerEmail", "==", user.email), where("status", "==", "paid"));
    try {
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Erro ao verificar o status do pagamento:", error);
        return false;
    }
}

function showMainApplication() {
    console.log('Iniciando showMainApplication...');

    if (loadingMessage) {
        loadingMessage.textContent = 'Carregando plataforma...';
    }

    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
    }

    setTimeout(() => {
        console.log('Fade out iniciando...');

        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';

            // Define um timeout alternativo caso transitionend não funcione
            const transitionTimeout = setTimeout(() => {
                console.log('Timeout de transição ativado');
                showMainContent();
            }, 800);

            // Escuta pelo fim da animação
            loadingOverlay.addEventListener('transitionend', () => {
                console.log('Transição finalizada');
                clearTimeout(transitionTimeout);
                showMainContent();
            }, { once: true });
        } else {
            // Se não há overlay, mostra o conteúdo diretamente
            showMainContent();
        }
    }, 1000);
}

function showMainContent() {
    console.log('Mostrando conteúdo principal...');

    // Esconde tela de carregamento
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }

    // Mostra conteúdo principal
    if (calculatorContent) {
        calculatorContent.style.display = 'block';
    }

    if (authContainer) {
        authContainer.style.display = 'flex';
    }

    document.body.style.overflow = 'auto';

    // Aguarda o DOM se estabilizar antes de continuar
    setTimeout(() => {
        // Atualiza o slider da aba
        if (typeof updateActiveTabSlider === 'function') {
            updateActiveTabSlider();
        }

        // Inicia o tour se necessário
        if (!localStorage.getItem('xtributationTutorialSeen') && typeof startTour === 'function') {
            setTimeout(startTour, 300);
        }

        console.log('Aplicação carregada com sucesso!');
    }, 100);
}

onAuthStateChanged(auth, async (user) => {
    console.log('Estado de autenticação mudou:', user ? user.email : 'sem usuário');

    if (user) {
        console.log('Usuário autenticado, iniciando verificações...');
        loginScreen.style.display = 'none';
        registerScreen.style.display = 'none';
        noAccessScreen.style.display = 'none';

        if (userEmailDisplay) {
            userEmailDisplay.textContent = user.email;
        }

        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }

        if (loadingMessage) {
            loadingMessage.textContent = 'Verificando seu acesso...';
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            console.log('Documento do usuário existe:', docSnap.exists());

            if (docSnap.exists() && docSnap.data().termsAccepted) {
                console.log('Termos aceitos, verificando pagamento...');
                const hasActivePayment = await checkUserPaymentStatus(user);
                console.log('Pagamento ativo:', hasActivePayment);

                if (hasActivePayment) { 
                    console.log('Iniciando aplicação principal...');
                    showMainApplication(); 
                } else { 
                    console.log('Sem pagamento ativo, mostrando tela de acesso negado');
                    if (loadingOverlay) loadingOverlay.style.display = 'none'; 
                    if (noAccessScreen) noAccessScreen.style.display = 'flex'; 
                }
            } else {
                console.log('Termos não aceitos, mostrando modal de termos');
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (termsModal) termsModal.style.display = 'flex';
            }
        } catch (error) {
            console.error("Erro no fluxo de verificação:", error);
            alert("Ocorreu um erro ao verificar suas permissões. Tente novamente.");
            signOut(auth);
        }
    } else {
        console.log('Usuário não autenticado, mostrando tela de login');
        if (loginScreen) loginScreen.style.display = 'flex';
        if (registerScreen) registerScreen.style.display = 'none';
        if (calculatorContent) calculatorContent.style.display = 'none';
        if (authContainer) authContainer.style.display = 'none';
        if (termsModal) termsModal.style.display = 'none';
        if (noAccessScreen) noAccessScreen.style.display = 'none';
        document.body.style.overflow = 'hidden';
        if (loadingOverlay) { loadingOverlay.style.display = 'none'; }
    }
});

// --- FUNÇÕES DE EVENTOS (Handlers) ---
function handleSignIn() {
    if (!emailInput || !passwordInput) {
        console.error('Campos de email ou senha não encontrados');
        return;
    }

    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).catch(error => {
        if (loginMessage) {
            loginMessage.textContent = `Erro: E-mail ou senha inválidos.`;
            loginMessage.className = 'message error';
            loginMessage.style.display = 'block';
        }
    });
}

function handleRegistration() {
    if (registerPasswordInput.value !== registerConfirmPasswordInput.value) {
        registerMessage.textContent = 'As senhas não coincidem.';
        registerMessage.className = 'message error';
        registerMessage.style.display = 'block';
        return;
    }
    createUserWithEmailAndPassword(auth, registerEmailInput.value, registerPasswordInput.value).catch(error => {
        let msg = 'Ocorreu um erro ao criar a conta.';
        if (error.code === 'auth/email-already-in-use') msg = 'Este e-mail já está cadastrado.';
        else if (error.code === 'auth/weak-password') msg = 'A senha deve ter pelo menos 6 caracteres.';
        else if (error.code === 'auth/invalid-email') msg = 'O formato do e-mail é inválido.';
        registerMessage.textContent = msg;
        registerMessage.className = 'message error';
        registerMessage.style.display = 'block';
    });
}

function handlePasswordReset(e) {
    e.preventDefault();
    if (!emailInput.value) {
        loginMessage.textContent = 'Por favor, insira seu e-mail para redefinir a senha.';
        loginMessage.className = 'message error';
        loginMessage.style.display = 'block';
        return;
    }
    sendPasswordResetEmail(auth, emailInput.value)
        .then(() => { loginMessage.textContent = 'E-mail de redefinição enviado!'; loginMessage.className = 'message success'; })
        .catch(error => { loginMessage.textContent = `Erro ao enviar e-mail.`; loginMessage.className = 'message error'; });
    loginMessage.style.display = 'block';
}

async function handleAcceptTerms() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    acceptTermsBtn.disabled = true;
    acceptTermsBtn.textContent = 'Salvando...';
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
        await setDoc(userDocRef, { email: currentUser.email, termsAccepted: { version: "1.0", timestamp: new Date() } }, { merge: true });
        termsModal.style.display = 'none';
        loadingOverlay.style.display = 'flex';
        loadingMessage.textContent = 'Verificando seu acesso...';
        const hasActivePayment = await checkUserPaymentStatus(currentUser);
        if (hasActivePayment) { showMainApplication(); } 
        else { loadingOverlay.style.display = 'none'; noAccessScreen.style.display = 'flex'; }
    } catch (error) {
        alert("Ocorreu um erro ao salvar sua confirmação. Tente novamente.");
    } finally {
        acceptTermsBtn.disabled = false;
        acceptTermsBtn.textContent = 'Li, entendi e aceito os termos';
    }
}

// SUBSTITUA TODO O SEU BLOCO DE CÓDIGO DO TUTORIAL POR ESTE:

// --- LÓGICA DO TOUR E GERAL ---
const tourOverlay = document.getElementById('tour-overlay');
const tourHighlight = document.querySelector('.tour-highlight');
const tourTooltip = document.querySelector('.tour-tooltip');
const tourTitle = document.getElementById('tour-title');
const tourText = document.getElementById('tour-text');
const tourStepCounter = document.getElementById('tour-step-counter');
const tourPrevBtn = document.getElementById('tour-prev-btn');
const tourNextBtn = document.getElementById('tour-next-btn');
const tourSkipBtn = document.getElementById('tour-skip-btn');
const openTutorialButton = document.getElementById('open-tutorial-button');

// Usando o seu array de steps, que está correto para o seu HTML
const tourSteps = [
    { element: '#tour-step-1', title: 'Navegação Principal', intro: 'Alterne entre os dashboards para suas análises.' },
    { element: '#tour-step-2', title: 'Adicionar Transações', intro: 'Preencha os dados de suas movimentações de capital (envios e retiradas).' },
    { element: '#tour-step-4', title: 'Processar Análise', intro: 'Clique aqui para executar os cálculos após preencher os dados acima.' },
    { element: '#main-tab-ir', title: 'Análise de IR', intro: 'Mude para este dashboard para analisar o imposto sobre suas operações de trade.' },
    { element: '#tour-step-5', title: 'Relatório de Operações', intro: 'Importe seu relatório da corretora para o cálculo do IR.' }
];
let currentStep = 0;

function startTour() { 
    currentStep = 0; 
    tourOverlay.style.display = 'block'; 
    // Pequeno delay para o display:block ser aplicado antes de iniciar a animação
    setTimeout(() => {
        showStep(currentStep)
        tourOverlay.classList.add('active'); 
    }, 50); 
    localStorage.setItem('xtributationTutorialSeen', 'true'); 
}

function endTour() { 
    tourOverlay.classList.remove('active'); 
    // Espera a animação de fade-out terminar para esconder o elemento
    setTimeout(() => {
        tourOverlay.style.display = 'none';
    }, 300); 
}

function showStep(index) {
    const step = tourSteps[index];
    const targetElement = document.querySelector(step.element);

    if (!targetElement) { 
        console.warn("Elemento do tour não encontrado:", step.element);
        endTour(); 
        return; 
    }

    // Garante que a aba correta está visível ANTES de medir a posição
    if (step.element.includes('ir') || step.element.includes('tour-step-5')) { 
        showMainTab('ir'); 
    } else { 
        showMainTab('cambial'); 
    }

    // Rola o elemento para a vista
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    // Espera a rolagem e a troca de aba terminarem antes de calcular a posição
    setTimeout(() => {
        const rect = targetElement.getBoundingClientRect();

        // Posiciona o destaque
        tourHighlight.style.width = `${rect.width + 12}px`;
        tourHighlight.style.height = `${rect.height + 12}px`;
        tourHighlight.style.top = `${rect.top - 6}px`;
        tourHighlight.style.left = `${rect.left - 6}px`;

        // Atualiza o texto do tooltip
        tourTitle.textContent = step.title;
        tourText.textContent = step.intro;
        tourStepCounter.textContent = `${index + 1} / ${tourSteps.length}`;

        // Lógica inteligente para posicionar o tooltip acima ou abaixo do elemento
        const tooltipHeight = tourTooltip.offsetHeight;
        const tooltipWidth = tourTooltip.offsetWidth;
        if ((rect.bottom + tooltipHeight + 20) > window.innerHeight) { 
            tourTooltip.style.top = `${rect.top - tooltipHeight - 15}px`; 
        } else { 
            tourTooltip.style.top = `${rect.bottom + 15}px`; 
        }

        // Centraliza o tooltip horizontalmente, mas o mantém dentro da tela
        let tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        if (tooltipLeft < 20) tooltipLeft = 20;
        if (tooltipLeft + tooltipWidth > window.innerWidth - 20) tooltipLeft = window.innerWidth - tooltipWidth - 20;
        tourTooltip.style.left = `${tooltipLeft}px`;

        // Atualiza os botões de navegação
        tourPrevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
        tourNextBtn.textContent = index === tourSteps.length - 1 ? 'Finalizar' : 'Próximo';

    }, 400); // 400ms é um bom tempo para a rolagem suave terminar
}

// Listeners para os botões do tour
if (tourNextBtn) {
    tourNextBtn.addEventListener('click', () => { 
        if (currentStep < tourSteps.length - 1) { 
            currentStep++; 
            showStep(currentStep); 
        } else { 
            endTour(); 
        } 
    });
}

if (tourPrevBtn) {
    tourPrevBtn.addEventListener('click', () => { 
        if (currentStep > 0) { 
            currentStep--; 
            showStep(currentStep); 
        } 
    });
}

if (tourSkipBtn) {
    tourSkipBtn.addEventListener('click', endTour);
}

if (tourOverlay) {
    tourOverlay.addEventListener('click', (e) => { 
        if (e.target === tourOverlay) {
            endTour(); 
        }
    });
}

// === INICIALIZAÇÃO DOS EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando event listeners...');

    // Event listeners para login
    if (signInButton) {
        signInButton.addEventListener('click', handleSignIn);
    }

    if (registerButton) {
        registerButton.addEventListener('click', handleRegistration);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handlePasswordReset);
    }

    if (goToRegisterLink) {
        goToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginScreen.style.display = 'none';
            registerScreen.style.display = 'flex';
        });
    }

    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
        });
    }

    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', handleAcceptTerms);
    }

    if (declineTermsBtn) {
        declineTermsBtn.addEventListener('click', () => {
            signOut(auth);
        });
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            signOut(auth);
        });
    }

    if (logoutFromNoAccessBtn) {
        logoutFromNoAccessBtn.addEventListener('click', () => {
            signOut(auth);
        });
    }

    // Event listeners para tabs principais
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.id.replace('main-tab-', '');
            showMainTab(tabName);
        });
    });

    // Event listeners para funcionalidades cambiais
    if (document.getElementById('add-trans-button')) {
        document.getElementById('add-trans-button').addEventListener('click', handleSaveTransaction);
    }

    if (document.getElementById('cancel-edit-button')) {
        document.getElementById('cancel-edit-button').addEventListener('click', cancelEdit);
    }

    if (document.getElementById('process-cambial-button')) {
        document.getElementById('process-cambial-button').addEventListener('click', handleProcessCambial);
    }

    // Event listeners para IR
    if (tradesFileInput_IR) {
        tradesFileInput_IR.addEventListener('change', handleFileSelect_IR);
    }

    if (processButton_IR) {
        processButton_IR.addEventListener('click', processFiles_IR);
    }

    console.log('Event listeners inicializados com sucesso!');
});

function updateActiveTabSlider() {
    const slider = document.getElementById('active-tab-slider');
    const activeButton = document.querySelector('.main-tab-button.active');

    if (slider && activeButton) {
        slider.style.width = `${activeButton.offsetWidth}px`;
        slider.style.left = `${activeButton.offsetLeft}px`;
    }
}

function showMainTab(tabName) {
    document.querySelectorAll('.main-content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.main-tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`main-content-${tabName}`).classList.remove('hidden');
    document.getElementById(`main-tab-${tabName}`).classList.add('active');
    updateActiveTabSlider();
}


function showLoader(containerId, message = "Processando...") {
     document.getElementById(containerId).innerHTML = `<div class="flex justify-center items-center p-10"><div class="loader"></div><span class="ml-4 text-text-secondary">${message}</span></div>`;
}
function showError(containerId, message) {
    document.getElementById(containerId).innerHTML = `<div class="message error" style="display:block;"><p class="font-bold">ERRO</p><p>${message}</p></div>`;
}
function formatCurrency(value, currency = 'BRL', digits = 2) {
    if (typeof value !== 'number' || isNaN(value)) return formatCurrency(0, currency, digits);
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency: currency, minimumFractionDigits: digits }).format(value);
}
function formatCurrencyWithColor(value) {
    const formattedValue = formatCurrency(value, 'BRL');
    if (value > 0) return `<span class="text-positive font-semibold">${formattedValue}</span>`;
    if (value < 0) return `<span class="text-negative font-semibold">${formattedValue}</span>`;
    return `<span>${formattedValue}</span>`;
}

// =======================================================================
// LÓGICA DE API - BANCO CENTRAL
// =======================================================================
let ratesMapVenda = new Map();
let ratesMapCompra = new Map();

async function fetchBcbRateForDate(isoDate) {
    if (ratesMapCompra.has(isoDate)) {
        return; // Já temos a cotação, não faz nada
    }

    let searchDate = new Date(`${isoDate}T12:00:00Z`); // Usar meio-dia para evitar problemas de fuso

    for (let i = 0; i < 7; i++) { // Tenta buscar por até 7 dias para trás
        const currentIsoDate = searchDate.toISOString().split('T')[0];
        const [year, month, day] = currentIsoDate.split('-');
        const apiDate = `${month}-${day}-${year}`;
        const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${apiDate}'&$format=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Se a API falhar para um dia (ex: 404 para fds), continua o loop
                if(response.status === 404) {
                    searchDate.setUTCDate(searchDate.getUTCDate() - 1);
                    continue;
                }
                throw new Error(`Erro na API do BCB. Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.value && data.value.length > 0) {
                const item = data.value[0];
                ratesMapCompra.set(isoDate, item.cotacaoCompra);
                ratesMapVenda.set(isoDate, item.cotacaoVenda);
                return; // Sucesso, encontrou a cotação
            } else {
                // Dia sem cotação (feriado/fds), tenta o dia anterior
                searchDate.setUTCDate(searchDate.getUTCDate() - 1);
            }
        } catch (error) {
             console.error(`Falha ao buscar cotações do BCB para ${apiDate}:`, error);
             // Se houver um erro de rede, por exemplo, para a busca para essa data
             throw error;
        }
    }
    // Se sair do loop sem encontrar, a cotação não foi encontrada nos últimos 7 dias
    console.warn(`Nenhuma cotação encontrada no BCB para a data ${isoDate} ou nos 6 dias anteriores.`);
}

// =======================================================================
// DASHBOARD CAMBIAL (ABA 1) - LÓGICA
// =======================================================================
let manualTransactions = [];
let currentlyEditingIndex = null;
let cambialExportData = [];
let cambialKpiData = {};

function getRateForDate(date, transType) {
    const isoDate = date.toISOString().split('T')[0];
    const ratesMap = transType === 'Envio' ? ratesMapVenda : ratesMapCompra;
    return ratesMap.get(isoDate) || null;
}

function toggleNaoRetiradaOption() {
    const dateInput = document.getElementById('trans-date');
    const naoRetiradaOption = document.getElementById('nao-retirada-option');
    const typeSelect = document.getElementById('trans-type');
    const dateValue = dateInput.value;
    if (dateValue && dateValue.substring(5) === '12-31') {
        naoRetiradaOption.disabled = false;
    } else {
        naoRetiradaOption.disabled = true;
        if (typeSelect.value === 'Não Retirada') typeSelect.value = 'Envio';
    }
}
document.getElementById('trans-date').addEventListener('change', toggleNaoRetiradaOption);

// CORRIGIDO: handleSaveTransaction
async function handleSaveTransaction() {
    const dateInput = document.getElementById('trans-date');
    const typeInput = document.getElementById('trans-type');
    const valueInput = document.getElementById('trans-value');
    const dateValue = dateInput.value; 

    if (!dateValue) {
        alert('Por favor, preencha a data.');
        return;
    }

    const validationDate = new Date(`${dateValue}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (validationDate > today) {
        alert('A data não pode ser futura.');
        return;
    }

    const sanitizedValue = valueInput.value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(sanitizedValue);

    if (isNaN(numericValue) || numericValue <= 0) {
        alert('Por favor, preencha um valor positivo válido no formato 1.000,00.');
        return;
    }

    // Validação da primeira transação
    if (manualTransactions.length === 0 && (typeInput.value === 'Retirada' || typeInput.value === 'Não Retirada')) {
        alert('O primeiro lançamento deve ser obrigatoriamente um ENVIO.'); 
        return;
    }

    const transactionData = { date: validationDate, type: typeInput.value, value: numericValue };

    if (currentlyEditingIndex !== null) {
        manualTransactions[currentlyEditingIndex] = transactionData;
    } else {
        manualTransactions.push(transactionData);
    }

    manualTransactions.sort((a, b) => a.date - b.date);

    try {
        await fetchBcbRateForDate(validationDate.toISOString().split('T')[0]);
        renderTransactionsTable();
        cancelEdit();
    } catch (error) {
        alert(`Não foi possível buscar a cotação do dólar. Verifique sua conexão. Erro: ${error.message}`);
    }
}


function editTransaction(index) {
    currentlyEditingIndex = index;
    const trans = manualTransactions[index];
    document.getElementById('trans-date').value = trans.date.toISOString().split('T')[0];
    document.getElementById('trans-type').value = trans.type;
    document.getElementById('trans-value').value = new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(trans.value);
    document.getElementById('add-trans-button').textContent = 'Salvar Alterações';
    document.getElementById('cancel-edit-button').classList.remove('hidden');
    toggleNaoRetiradaOption();
}

function cancelEdit() {
    currentlyEditingIndex = null;
    document.getElementById('trans-date').value = '';
    document.getElementById('trans-type').value = 'Envio';
    document.getElementById('trans-value').value = '';
    document.getElementById('add-trans-button').textContent = 'Adicionar +';
    document.getElementById('cancel-edit-button').classList.add('hidden');
    toggleNaoRetiradaOption();
}

function removeTransaction(index) {
    if (confirm('Tem certeza que deseja remover este registro?')) {
        manualTransactions.splice(index, 1);
        renderTransactionsTable();
    }
}

function renderTransactionsTable() {
    const container = document.getElementById('transactions-list');
    if (manualTransactions.length === 0) { container.innerHTML = ''; return; }
    const headers = ['Data', 'Tipo', 'Valor (USD)', 'Cotação (BRL)', 'Total (R$)', 'Ações'];
    const data = manualTransactions.map((t, index) => {
        const cotacaoDia = getRateForDate(t.date, t.type);
        const cotacaoDisplay = cotacaoDia ? formatCurrency(cotacaoDia, 'BRL') : `<span class="text-xs text-text-secondary">Automático</span>`;
        const totalBRL = cotacaoDia ? t.value * cotacaoDia : null;
        const totalBRLDisplay = totalBRL !== null ? formatCurrency(totalBRL, 'BRL') : `<span class="text-xs text-text-secondary">---</span>`;
        const actions = `<div class="flex gap-3 justify-center">
            <button onclick="editTransaction(${index})" class="table-icon-button" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button onclick="removeTransaction(${index})" class="table-icon-button" title="Remover">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>`;
        return [t.date.toLocaleDateString('pt-BR', {timeZone: 'UTC'}), t.type, formatCurrency(t.value, 'USD'), cotacaoDisplay, totalBRLDisplay, actions];
    });
    let tableHTML = `<h4 class="text-md font-semibold mb-2 mt-4 border-t border-border-color pt-4">Registros a Processar:</h4>
                    <div class="overflow-x-auto bg-bg-primary rounded-md border border-border-color">
                        <table class="min-w-full text-sm">
                            <thead><tr>${headers.map(h => `<th class="text-center py-2 px-3 font-medium text-text-secondary uppercase tracking-wider">${h}</th>`).join('')}</tr></thead>
                            <tbody class="divide-y divide-border-color">${data.map(row => `<tr>${row.map(cell => `<td class="py-2 px-3 whitespace-nowrap text-center">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
                        </table>
                    </div>`;
    container.innerHTML = tableHTML;
}

async function handleProcessCambial() {
    showLoader('results-area-cambial', 'Analisando transações...');
    if (manualTransactions.length === 0) {
        showError('results-area-cambial', 'Nenhum registro foi adicionado.');
        return;
    }

    try {
        // Garantir que todas as cotações foram buscadas
        const allDates = [...new Set(manualTransactions.map(t => t.date.toISOString().split('T')[0]))];
        await Promise.all(allDates.map(date => fetchBcbRateForDate(date)));

        processAndRenderCambial(manualTransactions);
    } catch (error) {
        showError('results-area-cambial', `Ocorreu um erro: ${error.message}`);
        console.error(error);
    }
}

// CORRIGIDO: processAndRenderCambial
function processAndRenderCambial(transactions) {
    try {
        let saldoUSD = 0, custoSaldoBRL = 0, totalEnviosUSD = 0, totalRetiradoUSD = 0, lucroPrejuizoTotal = 0;
        let totalEnviosBRL = 0, totalRetiradoBRL = 0;
        let lucroTributavel = 0;
        let valorNaoRetiradaBRL = null;
        let mostrarAlocarCard = false;

        const detailedData = [];
        const detailedDataForExport = [];
        const exportHeaders = ['Data', 'Tipo', 'Valor (USD)', 'Cotação (BRL)', 'Valor (BRL)', 'Lucro/Prejuízo Cambial (BRL)', 'Saldo Final (USD)'];

        for (const trans of transactions) {
            const cotacaoDia = getRateForDate(trans.date, trans.type);
            if (cotacaoDia === null) throw new Error(`Cotação não encontrada para a data ${trans.date.toLocaleDateString('pt-BR', {timeZone:'UTC'})}. Verifique sua conexão e tente novamente.`);

            const valorDeMercadoBRL = trans.value * cotacaoDia;
            const precoMedioAnterior = saldoUSD > 1e-6 ? custoSaldoBRL / saldoUSD : 0;
            let custoOperacaoBRL = 0, lucroPrejuizoRow = 0;

            if (trans.type === 'Envio') {
                saldoUSD += trans.value;
                custoSaldoBRL += valorDeMercadoBRL;
                totalEnviosUSD += trans.value;
                totalEnviosBRL += valorDeMercadoBRL;
            } else { 
                if (trans.value > saldoUSD) throw new Error(`Saque (${formatCurrency(trans.value, 'USD')}) maior que o saldo na data.`);
                custoOperacaoBRL = trans.value * precoMedioAnterior;
                lucroPrejuizoRow = valorDeMercadoBRL - custoOperacaoBRL;
                lucroPrejuizoTotal += lucroPrejuizoRow;
                if (trans.type === 'Retirada' && lucroPrejuizoRow > 0) {
                    lucroTributavel += lucroPrejuizoRow;
                }
                if (trans.type === 'Não Retirada') {
                    custoSaldoBRL += (2 * lucroPrejuizoRow);
                    valorNaoRetiradaBRL = valorDeMercadoBRL;
                    if (trans.date.getUTCMonth() === 11 && trans.date.getUTCDate() === 31) {
                        mostrarAlocarCard = true;
                    }
                } else { 
                    totalRetiradoUSD += trans.value;
                    totalRetiradoBRL += valorDeMercadoBRL;
                    saldoUSD -= trans.value;
                    custoSaldoBRL -= custoOperacaoBRL;
                }
            }
            const dateLabel = trans.date.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
            detailedData.push([dateLabel, trans.type, formatCurrency(trans.value, 'USD'), formatCurrency(cotacaoDia, 'BRL'), formatCurrency(valorDeMercadoBRL, 'BRL'), formatCurrencyWithColor(lucroPrejuizoRow), formatCurrency(saldoUSD, 'USD')]);
            detailedDataForExport.push({ 'Data': dateLabel, 'Tipo': trans.type, 'Valor (USD)': trans.value, 'Cotação (BRL)': cotacaoDia, 'Valor (BRL)': valorDeMercadoBRL, 'Lucro/Prejuízo Cambial (BRL)': lucroPrejuizoRow, 'Saldo Final (USD)': saldoUSD });
        }

        cambialExportData = { headers: exportHeaders, data: detailedDataForExport };
        const impostoDevido = lucroTributavel * 0.15;
        const saldoBRLCalculado = custoSaldoBRL + lucroPrejuizoTotal;
        let saldoFinalParaExibir = (valorNaoRetiradaBRL !== null) ? valorNaoRetiradaBRL : (saldoUSD < 1e-6 ? 0 : saldoBRLCalculado);

        cambialKpiData = { saldoUSD, custoSaldoBRL: saldoFinalParaExibir, totalEnviosUSD, totalRetiradoUSD, totalEnviosBRL, totalRetiradoBRL, lucroPrejuizoTotal, lucroTributavel, impostoDevido };
        const resultsContainer = document.getElementById('results-area-cambial');

        const kpiCards = [];
        if (mostrarAlocarCard) {
            kpiCards.push({ title: 'Alocar para Próximo Ano', value: formatCurrency(saldoFinalParaExibir), color: 'text-accent-primary', span: 'full' });
        }
        const corNaoIsenta = lucroTributavel >= 0 ? 'text-positive' : 'text-negative';

        kpiCards.push({ title: 'Variação Cambial Total', value: formatCurrency(lucroPrejuizoTotal), color: lucroPrejuizoTotal >= 0 ? 'text-positive' : 'text-negative' });
        kpiCards.push({ title: 'Variação Cambial Não Isenta', value: formatCurrency(lucroTributavel), color: corNaoIsenta });
        kpiCards.push({ title: 'Imposto a Pagar (15%)', value: formatCurrency(impostoDevido), color: 'text-negative' });
        kpiCards.push({ title: 'Total Enviado (USD)', value: formatCurrency(totalEnviosUSD, 'USD'), color: 'text-text-primary'});
        kpiCards.push({ title: 'Total Retirado (USD)', value: formatCurrency(totalRetiradoUSD, 'USD'), color: 'text-text-primary'});
        kpiCards.push({ title: 'Saldo Atual (USD)', value: formatCurrency(saldoUSD, 'USD'), color: 'text-text-primary'});
        kpiCards.push({ title: 'Total Enviado (BRL)', value: formatCurrency(totalEnviosBRL), color: 'text-text-primary'});
        kpiCards.push({ title: 'Total Retirado (BRL)', value: formatCurrency(totalRetiradoBRL), color: 'text-text-primary'});
        kpiCards.push({ title: 'Saldo Atual (BRL)', value: formatCurrency(saldoFinalParaExibir), color: 'text-accent-primary' });

        const kpiGridClass = 'grid grid-cols-1 md:grid-cols-3 gap-4';
        const kpiCardsHtml = kpiCards.map(kpi => {
            const cardClass = kpi.span === 'full' ? 'kpi-card md:col-span-3' : 'kpi-card';
            return `<div class="${cardClass}"><p class="kpi-card-title">${kpi.title}</p><p class="kpi-card-value ${kpi.color}">${kpi.value}</p></div>`
        }).join('');

        resultsContainer.innerHTML = `
            <div id="pdf-export-cambial" class="space-y-6">
                <h3 class="text-xl font-bold text-text-primary text-left">Resumo da Movimentação Cambial</h3>
                <div class="${kpiGridClass}">${kpiCardsHtml}</div>
                <div class="card">
                    <h3 class="text-xl font-bold mb-2 text-left">Extrato Detalhado</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="border-b border-border-color">
                                <tr>${exportHeaders.map(h => `<th class="text-left py-3 px-4 font-semibold text-sm text-text-secondary uppercase tracking-wider">${h}</th>`).join('')}</tr>
                            </thead>
                            <tbody class="divide-y divide-border-color">
                                ${detailedData.map(row => `<tr>${row.map(cell => `<td class="py-4 px-4 whitespace-nowrap">${cell}</td>`).join('')}</tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-8 no-print">
                <button id="open-export-modal-cambial-btn" class="btn btn-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Exportar Relatório</span>
                </button>
            </div>`;
        document.getElementById('open-export-modal-cambial-btn').addEventListener('click', () => openExportModal('cambial'));

    } catch (e) { 
        showError('results-area-cambial', `Ocorreu um erro crítico no processamento: ${e.message}`); 
        console.error(e); 
    }
}

// =======================================================================
// Apuração Anual de Resultados (ABA 2) - LÓGICA
// =======================================================================
let tradesData_IR = null; let finalReportData_IR = null; let allProcessedTrades_IR = []; let irKpiData = {};
const tradesFileInput_IR = document.getElementById('trades-file');
const processButton_IR = document.getElementById('process-button');
const resultsSection_IR = document.getElementById('results');
const alertBox_IR = document.getElementById('alert-box');
const loader_IR = document.getElementById('loader');
const buttonText_IR = document.getElementById('button-text');
const modal_IR = document.getElementById('trades-modal');
const closeModalButton_IR = document.getElementById('close-modal-button');
const openExportModalIrBtn = document.getElementById('open-export-modal-ir-btn');

function closeTradesModal_IR() {
    if (modal_IR) {
        modal_IR.classList.remove('active');
    }
}

function handleFileSelect_IR(event) {
    const file = event.target.files[0]; if (!file) return;
    const nameEl = document.getElementById('trades-file-name');
    nameEl.textContent = file.name;
    nameEl.classList.add('text-accent-primary');

    Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
            let dataRows = results.data;
            if (dataRows.length > 1 && dataRows[0][0] && dataRows[0][0].toLowerCase().includes('posi')) dataRows.shift();
            const headers = dataRows[0].map(h => h.trim());
            const records = dataRows.slice(1);
            tradesData_IR = records.map(row => {
                const obj = {};
                headers.forEach((header, i) => { if (header) obj[header] = row[i]; });
                return obj;
            }).filter(row => Object.values(row).some(val => val !== null && val.toString().trim() !== ''));
        },
        error: (error) => showError('results', `Erro ao ler o arquivo ${file.name}: ${error.message}`)
    });
}

async function processFiles_IR() {
    if (!tradesData_IR) {
        showError('results', 'Por favor, carregue o arquivo de operações para continuar.');
        return;
    }
    loader_IR.classList.remove('hidden');
    buttonText_IR.textContent = 'Processando...';
    processButton_IR.disabled = true;

    try {
        const uniqueDates = [...new Set(tradesData_IR.map(t => {
            const dateStr = (t['Horário'] || t['Datade  Fechamento'] || t['Time'] || t['Close Time'] || ' ').split(' ')[0];
            if (!dateStr) return null;
            if (dateStr.includes('/')) {
                const [day, month, year] = dateStr.split('/');
                return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            }
            if (dateStr.includes('.')) {
                const [year, month, day] = dateStr.split('.');
                return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            }
            return new Date(dateStr + 'T00:00:00Z').toISOString().split('T')[0];
        }))].filter(d => d && !isNaN(new Date(d).getTime()));

        if (uniqueDates.length === 0) throw new Error("Não foram encontradas datas válidas no arquivo de operações.");

        await Promise.all(uniqueDates.map(date => fetchBcbRateForDate(date)));

        const { apuracaoMensal, plataforma, processedTrades, impostoAnual } = apurarImposto_IR(tradesData_IR, ratesMapCompra);
        finalReportData_IR = apuracaoMensal;
        allProcessedTrades_IR = processedTrades;
        displayResults_IR(apuracaoMensal, plataforma, impostoAnual);

    } catch (error) {
        showError('results', `Ocorreu um erro no cálculo: ${error.message}.`);
        console.error(error);
    } finally {
        loader_IR.classList.add('hidden');
        buttonText_IR.textContent = 'Processar Dados';
        processButton_IR.disabled = false;
    }
}

function identifyPlatform_IR(data) {
    if (!data || data.length === 0) throw new Error("O arquivo de operações está vazio.");
    const columns = new Set(Object.keys(data[0]).map(c => c.toLowerCase().trim().replace(/\s+/g, ' ')));
    if (columns.has('position') && columns.has('ativo') && columns.has('horário') && columns.has('lucro')) return { name: 'Metatrader 5 (Posições)', map: { data_fechamento: 'Horário', resultado: 'Lucro', comissao: 'Comissão', swap: 'Swap', ativo: 'Ativo' } };
    if (columns.has('n. do trade') && columns.has('datade fechamento')) return { name: 'Metatrader 5 (Negócios)', map: { data_fechamento: 'Datade  Fechamento', resultado: 'Resultado', comissao: 'Comissão', swap: 'Swap', ativo: 'Ativo' } };
    if (columns.has('position') && columns.has('type') && columns.has('deal')) return { name: 'Metatrader 5 (Inglês)', map: { data_fechamento: 'Time', resultado: 'Profit', comissao: 'Commission', swap: 'Swap', ativo: 'Symbol' } };
    if (columns.has('ticket') && columns.has('open time') && columns.has('close time')) return { name: 'Metatrader 4', map: { data_fechamento: 'Close Time', resultado: 'Profit', comissao: 'Commission', swap: 'Swap', ativo: 'Item' } };
    if (columns.has('tradeid') && columns.has('direction') && columns.has('close time')) return { name: 'CTrader', map: { data_fechamento: 'Close Time', resultado: 'Net Profit', comissao: 'Commissions', swap: 'Swap', ativo: 'Symbol' } };
    return null;
}

function apurarImposto_IR(trades, quotesMap) {
    const platformInfo = identifyPlatform_IR(trades); if (!platformInfo) throw new Error("Plataforma de trading não identificada.");
    const normalize = (obj, map) => { const newObj = {}; for (const key in obj) { const nKey = key.toLowerCase().trim().replace(/\s+/g, ' '); const sKey = Object.keys(map).find(k => map[k].toLowerCase().trim().replace(/\s+/g, ' ') === nKey); if (sKey) newObj[sKey] = obj[key]; else newObj[key.toLowerCase().trim().replace(/\s+/g, '_')] = obj[key]; } return newObj; };
    let processedTrades = trades.map(t => normalize(t, platformInfo.map));

    if (quotesMap.size === 0) throw new Error("O mapa de cotações está vazio.");

    processedTrades = processedTrades.map(trade => { const parseCurrency = (v) => parseFloat(String(v||'0').replace(/\s/g, '').replace(',', '.'))||0; const resultado_liquido_usd = parseCurrency(trade.resultado); let date; const dateStr = (trade.data_fechamento||'').split(' ')[0]; if (dateStr.includes('/')) { const p = dateStr.split('/'); date = new Date(Date.UTC(p[2], p[1]-1, p[0])); } else { date = new Date(dateStr.replace(/\./g, '-') + 'T00:00:00Z'); } if (isNaN(date.getTime())) throw new Error(`Data inválida: ${trade.data_fechamento}`); const isoDate = date.toISOString().split('T')[0]; const quote = quotesMap.get(isoDate); const resultado_liquido_brl = quote ? resultado_liquido_usd * quote : 0; return { ...trade, data_iso: isoDate, mes_ano: isoDate ? isoDate.substring(0, 7) : null, resultado_liquido_usd, resultado_liquido_brl }; }).filter(t => t.mes_ano);
    const monthlyGroups = processedTrades.reduce((acc, trade) => { const month = trade.mes_ano; if (!acc[month]) acc[month] = { r_brl: 0, r_usd: 0 }; acc[month].r_brl += trade.resultado_liquido_brl; acc[month].r_usd += trade.resultado_liquido_usd; return acc; }, {});
    const apuracaoMensal = Object.keys(monthlyGroups).sort().map(month => ({ mes: month, resultado_liquido_brl: monthlyGroups[month].r_brl, resultado_liquido_usd: monthlyGroups[month].r_usd }));
    const lucro_total_anual_brl = processedTrades.reduce((sum, trade) => sum + trade.resultado_liquido_brl, 0);
    const impostoAnual = lucro_total_anual_brl > 0 ? lucro_total_anual_brl * 0.15 : 0;
    return { apuracaoMensal, plataforma: platformInfo.name, processedTrades, impostoAnual };
}


function displayResults_IR(data, plataforma, impostoAnual) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;

    const totalUSD = data.reduce((s, r) => s + r.resultado_liquido_usd, 0);
    const totalBRL = data.reduce((s, r) => s + r.resultado_liquido_brl, 0);
    const resultadoAposDarf = totalBRL - impostoAnual;
    irKpiData = { totalUSD, totalBRL, impostoAnual, resultadoAposDarf };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    resultsContainer.innerHTML = `
        <div class="card">
            <div id="printable-report-area">
                <div id="success-box" class="p-4 mb-4 text-sm rounded-lg message success" style="display: block;">
                    <strong>Cálculo atualizado conforme Lei 14.754/2023.</strong>
                </div>
                <h2 class="text-2xl font-bold mb-6 text-text-primary">Resultados da Apuração</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="kpi-card">
                        <p class="kpi-card-title">Resultado Bruto (BRL)</p>
                        <p class="kpi-card-value ${totalBRL >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(totalBRL)}</p>
                    </div>
                    <div class="kpi-card">
                        <p class="kpi-card-title">Resultado Bruto (USD)</p>
                        <p class="kpi-card-value ${totalUSD >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(totalUSD, 'USD')}</p>
                    </div>
                    <div class="kpi-card">
                        <p class="kpi-card-title">Imposto Devido (15%)</p>
                        <p class="kpi-card-value">${formatCurrency(impostoAnual)}</p>
                    </div>
                    <div class="kpi-card">
                        <p class="kpi-card-title">Resultado Líquido</p>
                        <p class="kpi-card-value ${resultadoAposDarf >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(resultadoAposDarf)}</p>
                    </div>
                </div>

                <div class="card mb-8 no-print">
                    <div class="h-80">
                        <canvas id="monthly-performance-chart"></canvas>
                    </div>
                </div>

                <div class="card">
                    <h3 class="text-lg font-semibold mb-4 text-text-primary">Calendário Anual de Resultados</h3>
                    <p class="text-sm mb-6 no-print text-text-secondary">Clique em um mês para ver suas operações detalhadas.</p>
                    <div id="calendar-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
                </div>
            </div>
            <div class="flex justify-center mt-8 no-print">
                <button id="open-export-modal-ir-btn" class="btn btn-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Exportar Relatório</span>
                </button>
            </div>
        </div>
    `;

    const calendarContainer = document.getElementById('calendar-container');
    data.forEach(row => {
        const [year, monthNum] = row.mes.split('-');
        const monthName = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        const card = document.createElement('div');
        card.className = `month-card ${row.resultado_liquido_brl >= 0 ? 'profit' : 'loss'}`;
        card.dataset.month = row.mes;
        const usdResultClass = row.resultado_liquido_usd >= 0 ? '#0aff39' : '#ff0a0a';
        const brlResultClass = row.resultado_liquido_brl >= 0 ? '#0aff39' : '#ff0a0a';
        card.innerHTML = `<div class="month-name">${monthName}</div><div class="month-result ${usdResultClass}">${formatCurrency(row.resultado_liquido_usd, 'USD')}</div><div class="month-result text-sm ${brlResultClass}">${formatCurrency(row.resultado_liquido_brl, 'BRL')}</div>`;
        card.addEventListener('click', () => openTradesModal_IR(row.mes, monthName));
        calendarContainer.appendChild(card);
    });

    const chartCanvas = document.getElementById('monthly-performance-chart');
    if (window.myPerformanceChart) window.myPerformanceChart.destroy();

    window.myPerformanceChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: data.map(r => `${monthNames[parseInt(r.mes.split('-')[1])-1].substring(0,3)}/${r.mes.split('-')[0].substring(2,4)}`),
            datasets: [{
                label: 'Resultado (BRL)',
                data: data.map(r => r.resultado_liquido_brl),
                backgroundColor: data.map(r => r.resultado_liquido_brl >= 0 ? '#0aff39' : '#ff0a0a'),
                borderColor: data.map(r => r.resultado_liquido_brl >= 0 ? '#0aff39' : '#ff0a0a'),
                borderWidth: 1
            }]
        },
        options: { maintainAspectRatio: false, responsive: true, plugins: { title: { display: true, text: 'Desempenho Mensal (BRL)', color: '#e0e0e0', font: { size: 18, family: "Sora", weight: '600' }, align: 'start', padding: { bottom: 24 } }, legend: { display: false }, tooltip: { callbacks: { label: (c) => `Resultado: ${formatCurrency(c.parsed.y)}` } } }, scales: { y: { ticks: { color: '#e0e0e0', callback: (v) => 'R$ ' + v.toLocaleString('pt-BR') }, grid: { color: 'rgba(212, 175, 55, 0.2)' } }, x: { ticks: { color: '#e0e0e0' }, grid: { display: false } } } }
    });

    document.getElementById('open-export-modal-ir-btn').addEventListener('click', () => openExportModal('ir'));

    resultsSection_IR.classList.remove('hidden');

    // Gerar o resumo anual (wrapped)
    generateAndDisplayWrapped(allProcessedTrades_IR);
}



// =======================================================================
// RESUMO ANUAL (WRAPPED) - LÓGICA E RENDERIZAÇÃO
// =======================================================================

function formatMonthYear(mesAno) {
    if (!mesAno) return 'N/A';
    const [year, month] = mesAno.split('-');
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${monthNames[parseInt(month) - 1]}/${year}`;
}

function generateAndDisplayWrapped(tradesData) {
    if (!tradesData || tradesData.length === 0) {
        document.getElementById('main-tab-wrapped').style.display = 'none';
        return;
    }
    document.getElementById('main-tab-wrapped').style.display = 'inline-flex';

    // --- Cálculos dos dados ---
    const totalTrades = tradesData.length;
    const winningTrades = tradesData.filter(t => t.resultado_liquido_brl > 0);
    const losingTrades = tradesData.filter(t => t.resultado_liquido_brl < 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

    const netResult = tradesData.reduce((sum, t) => sum + t.resultado_liquido_brl, 0);
    const netResultUSD = tradesData.reduce((sum, t) => sum + t.resultado_liquido_usd, 0);
    const biggestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.resultado_liquido_brl)) : 0;
    const biggestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.resultado_liquido_brl)) : 0;

    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.resultado_liquido_brl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.resultado_liquido_brl, 0) / losingTrades.length : 0;
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;

    // Análise por ativo
    const assetStats = tradesData.reduce((acc, t) => {
        if (!acc[t.ativo]) {
            acc[t.ativo] = { profit: 0, trades: 0, wins: 0 };
        }
        acc[t.ativo].profit += t.resultado_liquido_brl;
        acc[t.ativo].trades++;
        if (t.resultado_liquido_brl > 0) acc[t.ativo].wins++;
        return acc;
    }, {});

    const topAssets = Object.entries(assetStats)
        .sort(([,a], [,b]) => b.profit - a.profit)
        .slice(0, 5)
        .map(([symbol, stats]) => ({
            symbol,
            profit: stats.profit,
            trades: stats.trades
        }));

    // Análise mensal
    const monthlyResults = tradesData.reduce((acc, trade) => {
        if (!acc[trade.mes_ano]) {
            acc[trade.mes_ano] = { profit: 0, trades: 0, wins: 0 };
        }
        acc[trade.mes_ano].profit += trade.resultado_liquido_brl;
        acc[trade.mes_ano].trades++;
        if (trade.resultado_liquido_brl > 0) acc[trade.mes_ano].wins++;
        return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyResults).sort();
    const bestMonth = sortedMonths.reduce((a, b) => monthlyResults[a].profit > monthlyResults[b].profit ? a : b, sortedMonths[0]);
    const worstMonth = sortedMonths.reduce((a, b) => monthlyResults[a].profit < monthlyResults[b].profit ? a : b, sortedMonths[0]);

    // Renderizar o Wrapped completo com Swiper
    const wrappedContainer = document.getElementById('main-content-wrapped');
    wrappedContainer.innerHTML = `
        <div class="wrapped-container">
            <h1 class="wrapped-title-main">Seu Resumo Anual 2024</h1>
            <p class="wrapped-subtitle-main">Análise completa dos seus resultados no mercado americano</p>

            <!-- Swiper Container -->
            <div class="mySwiper">
                <div class="swiper-wrapper">

                     <!-- === SLIDE 1 CORRIGIDO === -->
                        <div class="swiper-slide wrapped-slide-intro-v2">
                            <div class="intro-v2-content">
                                <div class="intro-v2-header">XTRADERS</div>
                                <div class="intro-v2-logo">
                                    <svg width="489" height="382" viewBox="0 0 489 382" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_101_36" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="489" height="382">
<path d="M458.815 0H30.1852C13.5144 0 0 13.5452 0 30.254V350.946C0 367.655 13.5144 381.2 30.1852 381.2H458.815C475.486 381.2 489 367.655 489 350.946V30.254C489 13.5452 475.486 0 458.815 0Z" fill="white"/>
</mask>
<g mask="url(#mask0_101_36)">
<path d="M0.000112058 -4.11719V34.8499C-0.0456441 32.0222 0.771835 29.2481 2.34276 26.9003C3.91369 24.5524 6.16283 22.7432 8.78814 21.7156C11.4134 20.688 14.2892 20.4913 17.0291 21.1518C19.7691 21.8123 22.2421 23.2985 24.1159 25.4107L112.44 119.743H206.07C209.288 119.713 212.443 120.634 215.143 122.392C217.843 124.149 219.968 126.665 221.253 129.626C222.539 132.587 222.928 135.861 222.372 139.043C221.816 142.224 220.34 145.17 218.128 147.516L24.1159 354.997C22.2454 357.105 19.778 358.59 17.0439 359.252C14.3099 359.914 11.4395 359.722 8.81694 358.702C6.1944 357.682 3.94478 355.883 2.36912 353.545C0.793457 351.207 -0.0330791 348.441 0.000112058 345.619V383.981H489.732V-4.11719H0.000112058ZM148.915 14.8218C147.628 13.4498 146.77 11.7285 146.449 9.87159C146.128 8.01472 146.357 6.10407 147.109 4.37686C147.86 2.64964 149.1 1.18193 150.675 0.155951C152.251 -0.870033 154.091 -1.4091 155.969 -1.39433H333.16C335.026 -1.38207 336.848 -0.826893 338.406 0.203911C339.964 1.23471 341.191 2.69689 341.937 4.41324C342.684 6.12959 342.918 8.02643 342.613 9.87388C342.307 11.7213 341.473 13.4401 340.214 14.8218L265.274 95.9024C262.68 98.6776 259.547 100.89 256.068 102.402C252.589 103.914 248.838 104.694 245.047 104.694C241.256 104.694 237.505 103.914 234.026 102.402C230.547 100.89 227.413 98.6776 224.82 95.9024L148.915 14.8218ZM333.039 381.863H155.909C154.038 381.878 152.203 381.344 150.631 380.326C149.059 379.307 147.818 377.849 147.062 376.131C146.305 374.414 146.066 372.512 146.374 370.659C146.682 368.807 147.524 367.085 148.795 365.707L223.976 284.385C226.569 281.609 229.702 279.398 233.182 277.885C236.661 276.373 240.411 275.593 244.203 275.593C247.994 275.593 251.745 276.373 255.224 277.885C258.703 279.398 261.836 281.609 264.43 284.385L340.093 365.707C341.389 367.072 342.254 368.79 342.58 370.646C342.906 372.503 342.677 374.415 341.923 376.141C341.169 377.868 339.924 379.332 338.343 380.35C336.763 381.368 334.917 381.894 333.039 381.863ZM489.008 345.558C489.054 348.386 488.237 351.16 486.666 353.508C485.095 355.856 482.846 357.665 480.22 358.692C477.595 359.72 474.719 359.917 471.979 359.256C469.239 358.596 466.766 357.11 464.892 354.997L376.629 260.787H282.999C279.793 260.789 276.656 259.851 273.974 258.088C271.292 256.326 269.181 253.816 267.9 250.866C266.619 247.917 266.225 244.656 266.765 241.484C267.306 238.313 268.757 235.369 270.941 233.013L465.134 25.4712C467.008 23.359 469.48 21.8729 472.22 21.2123C474.96 20.5518 477.836 20.7486 480.461 21.7761C483.087 22.8037 485.336 24.6129 486.907 26.9608C488.478 29.3086 489.295 32.0827 489.249 34.9104L489.008 345.558Z" fill="url(#paint0_linear_101_36)"/>
</g>
<defs>
<linearGradient id="paint0_linear_101_36" x1="-0.00170898" y1="189.932" x2="489.732" y2="189.932" gradientUnits="userSpaceOnUse">
<stop stop-color="#D4AF37"/>
<stop offset="0.475962" stop-color="#FFEE99"/>
<stop offset="1" stop-color="#D4AF37"/>
</linearGradient>
</defs>
</svg>

                                </div>
                                <div class="intro-v2-footer">WRAPPED</div>
                            </div>
                        </div>

                    <!-- Slide 2: Visão Geral + Performance -->
                    <div class="swiper-slide wrapped-slide">
                        <div class="slide-content">
                            <div class="slide-title">VISÃO GERAL</div>

                            <div class="main-result-card">
                                <div class="result-label">RESULTADO LÍQUIDO ANUAL</div>
                                <div class="result-value">${formatCurrency(netResult)}</div>
                            </div>

                            <div class="metrics-grid">
                                <div class="metric-card">
                                    <div class="metric-label">TOTAL DE TRADES</div>
                                    <div class="metric-value">${totalTrades}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">MESES ATIVOS</div>
                                    <div class="metric-value">${sortedMonths.length}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">TAXA DE ACERTO</div>
                                    <div class="metric-value">${winRate.toFixed(1)}%</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">FATOR LUCRO</div>
                                    <div class="metric-value">${profitFactor.toFixed(2)}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">MÉDIA DE GANHO</div>
                                    <div class="metric-value">${formatCurrency(avgWin)}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">MAIOR GANHO</div>
                                    <div class="metric-value">${formatCurrency(biggestWin)}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">MÉDIA DE PERDA</div>
                                    <div class="metric-value">${formatCurrency(avgLoss)}</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-label">MAIOR PERDA</div>
                                    <div class="metric-value">${formatCurrency(biggestLoss)}</div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <!-- Slide 4: Top Ativos -->
                    <div class="swiper-slide wrapped-slide">
                        <div class="slide-content">
                            <h3 class="slide-title">TOP 5 ATIVOS</h3>
                            <div class="assets-ranking">
                                ${topAssets.map((asset, index) => `
                                    <div class="asset-card asset-rank-${index + 1}">
                                        <div class="asset-rank-info">
                                            <span class="asset-rank">#${index + 1}</span>
                                            <span class="asset-name">${asset.symbol}</span>
                                        </div>
                                        <span class="asset-profit">${formatCurrency(asset.profit)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Slide 5: Análise Mensal -->
                    <div class="swiper-slide wrapped-slide">
                        <div class="slide-content">
                            <h3 class="slide-title">ANÁLISE MENSAL</h3>
                            <div class="chart-container">
                                <canvas id="wrapped-monthly-chart"></canvas>
                            </div>
                            <div class="month-summary">
                                <div class="month-card">
                                    <p class="month-label">MELHOR MÊS</p>
                                    <p class="month-value">${formatMonthYear(bestMonth)}<br>${formatCurrency(monthlyResults[bestMonth]?.profit || 0)}</p>
                                </div>
                                <div class="month-card">
                                    <p class="month-label">PIOR MÊS</p>
                                    <p class="month-value">${formatMonthYear(worstMonth)}<br>${formatCurrency(monthlyResults[worstMonth]?.profit || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Slide 6: Mês a Mês -->
                    <div class="swiper-slide wrapped-slide">
                        <div class="slide-content">
                            <h3 class="slide-title">MÊS A MÊS</h3>
                            <div class="monthly-assets-grid">
                                ${sortedMonths.map(month => {
                                    const monthlyTrades = tradesData.filter(t => t.mes_ano === month);
                                    const bestAsset = monthlyTrades.reduce((best, current) => 
                                        current.resultado_liquido_brl > (best?.resultado_liquido_brl || -Infinity) ? current : best
                                    , null);
                                    
                                    const [year, monthNum] = month.split('-');
                                    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                                    const monthLabel = `${monthNames[parseInt(monthNum) - 1]}`;
                                    
                                    return `
                                        <div class="monthly-asset-card">
                                            <div class="month-label">${monthLabel}</div>
                                            <div class="best-asset">${bestAsset?.ativo || 'N/A'}</div>
                                            <div class="asset-profit">${formatCurrency(bestAsset?.resultado_liquido_brl || 0)}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div></old_str>

                    <!-- Slide 7: Card Final de Resumo -->
                    <div class="swiper-slide wrapped-slide">
                        <div class="slide-content">
                            <div class="final-summary-card" id="export-summary-card">

                                <div class="final-card-main-metric">
                                    <div class="main-metric-label">RESULTADO LÍQUIDO ANUAL</div>
                                    <div class="main-metric-value">${formatCurrency(netResult)}</div>
                                </div>

                                <div class="final-card-secondary-grid">
                                    <div class="secondary-metric-card positive">
                                        <div class="secondary-metric-label">Total de Trades</div>
                                        <div class="secondary-metric-value">${totalTrades}</div>
                                    </div>
                                    <div class="secondary-metric-card positive">
                                        <div class="secondary-metric-label">Taxa de Acerto</div>
                                        <div class="secondary-metric-value">${winRate.toFixed(1)}%</div>
                                    </div>
                                    <div class="secondary-metric-card">
                                        <div class="secondary-metric-label">Maior Ganho</div>
                                        <div class="secondary-metric-value">${formatCurrency(biggestWin)}</div>
                                    </div>
                                    <div class="secondary-metric-card">
                                        <div class="secondary-metric-label">Meses Ativos</div>
                                        <div class="secondary-metric-value">${sortedMonths.length}</div>
                                    </div>
                                </div>

                                <!-- HTML CORRIGIDO PARA O ATIVO #1 -->
                                <div class="final-card-top-asset">
                                    <!-- Novo container para agrupar rank e nome -->
                                    <div class="top-asset-info">
                                        <div class="top-asset-rank">#1</div>
                                        <div class="top-asset-name">${topAssets[0]?.symbol || 'N/A'}</div>
                                    </div>
                                    <!-- O valor fica sozinho -->
                                    <div class="top-asset-profit-value">${formatCurrency(topAssets[0]?.profit || 0)}</div>
                                </div>  

                                <div class="final-card-chart-container">
                                    <canvas id="wrapped-final-chart"></canvas>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                <!-- Navigation -->
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>

            <!-- Botões de ação -->
            <div class="action-buttons">
                <button id="export-wrapped-btn" class="btn btn-primary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Exportar como Imagem
                </button>
                <button id="share-wrapped-btn" class="btn btn-secondary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                    Compartilhar
                </button>
            </div>
        </div>
    `;

    // Inicializar Swiper
    setTimeout(() => {
        const swiper = new Swiper('.mySwiper', {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 30,
            grabCursor: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                }
            }
        });

        // Renderizar gráficos
        const originalCanvas = document.getElementById('wrapped-monthly-chart');
        renderMonthlyChart();
        renderFinalChart();
        const chartData = { sortedMonths, monthlyResults };
        
        document.getElementById('export-wrapped-btn').addEventListener('click', () => {
            exportWrappedAsImage(chartData); // Passa os dados para a função
        });

        document.getElementById('share-wrapped-btn').addEventListener('click', () => {
            shareWrapped(chartData); // Passa os dados para a função
        });
    }, 300);

    function renderMonthlyChart() {
        const chartCanvas = document.getElementById('wrapped-monthly-chart');
        if (!chartCanvas) return;

        if (window.wrappedMonthlyChart) window.wrappedMonthlyChart.destroy();

        window.wrappedMonthlyChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                    return `${monthNames[parseInt(monthNum) - 1]}`;
                }),
                datasets: [{
                    data: sortedMonths.map(month => monthlyResults[month].profit),
                    backgroundColor: sortedMonths.map(month => 
                        monthlyResults[month].profit >= 0 ? '#0aff39' : '#ff0a0a'
                    ),
                    borderRadius: 4,
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: { 
                    legend: { display: false }
                },
                scales: { 
                    y: { 
                        ticks: { 
                            color: '#FFFFFF', 
                            font: { size: 10 },
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        border: { color: 'rgba(255, 255, 255, 0.2)' } 
                    }, 
                    x: { 
                        ticks: { 
                            color: '#FFFFFF', 
                            font: { size: 10 }
                        }, 
                        grid: { display: false }, 
                        border: { color: 'rgba(255, 255, 255, 0.2)' } 
                    } 
                }
            }
        });
    }

    function renderFinalChart() {
        const chartCanvas = document.getElementById('wrapped-final-chart');
        if (!chartCanvas) return;

        if (window.wrappedFinalChart) window.wrappedFinalChart.destroy();

        window.wrappedFinalChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                    return `${monthNames[parseInt(monthNum) - 1]}`;
                }),
                datasets: [{
                    data: sortedMonths.map(month => monthlyResults[month].profit),
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: '#D4AF37',
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                devicePixelRatio:2,
                maintainAspectRatio: false,
                responsive: true,
                plugins: { 
                    legend: { display: false }
                },
                scales: { 
                    y: { 
                        ticks: { 
                            color: '#FFFFFF', 
                            font: { size: 8 },
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        border: { color: 'rgba(255, 255, 255, 0.2)' } 
                    }, 
                    x: { 
                        ticks: { 
                            color: '#FFFFFF', 
                            font: { size: 8 }
                        }, 
                        grid: { display: false }, 
                        border: { color: 'rgba(255, 255, 255, 0.2)' } 
                    } 
                }
            }
        });
    }

    // Configurar event listeners
    document.getElementById('export-wrapped-btn').addEventListener('click', exportWrappedAsImage);
    document.getElementById('share-wrapped-btn').addEventListener('click', shareWrapped);
}

// =======================================================================
// LÓGICA DE EXPORTAÇÃO E COMPARTILHAMENTO (OTIMIZADA)
// =======================================================================

/**
 * Função auxiliar para atualizar o estado de um botão (texto, ícone e estado desabilitado).
 * @param {HTMLElement} button - O elemento do botão a ser atualizado.
 * @param {string} text - O novo texto para o botão.
 * @param {boolean} disabled - Se o botão deve ser desabilitado.
 */
function updateButtonState(button, text, disabled) {
    button.disabled = disabled;
    // Tenta encontrar o texto dentro do botão para não apagar o ícone SVG
    const textElement = button.querySelector('span') || button; 
    textElement.textContent = text;
}


/**
/**
 * Função central para gerar a imagem de um elemento DOM com máxima fidelidade.
 * VERSÃO FINAL: Clona o elemento, copia todos os estilos computados para o clone,
 * redesenha o gráfico e aguarda o ciclo de renderização antes da captura.
 *
/**
 * Função central para gerar a imagem de um elemento DOM com máxima fidelidade.
 * VERSÃO DEFINITIVA: Usa a técnica do "clone invisível no viewport" para forçar a renderização
 * completa pelo navegador antes da captura pela html2canvas.
 *
 * @param {string} elementId - O ID do elemento a ser capturado.
 * @param {object} chartData - Dados para redesenhar o gráfico.
 * @returns {Promise<Blob>} Uma Promise que resolve com o Blob da imagem PNG.
 */
async function generateImageBlobFromElement(elementId, chartData) {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado.`);
    }

    // 1. Clonar o nó do DOM
    const clone = originalElement.cloneNode(true);
    
    // 2. Copiar os estilos computados para garantir a aparência exata
    const computedStyle = window.getComputedStyle(originalElement);
    for (const style of computedStyle) {
        clone.style.setProperty(style, computedStyle.getPropertyValue(style));
    }
    
    // --- A CORREÇÃO CRÍTICA ESTÁ AQUI ---
    // 3. Estilizar o clone para que fique no viewport, mas totalmente invisível
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.zIndex = '-1'; // Coloca atrás de todo o conteúdo
    clone.style.opacity = '0'; // Torna 100% transparente
    clone.style.pointerEvents = 'none'; // Impede qualquer interação do mouse
    // ------------------------------------
    
    // 4. Adicionar o clone ao corpo do documento
    document.body.appendChild(clone);

    try {
        // 5. Redesenhar o gráfico no canvas do clone
        const clonedCanvas = clone.querySelector('canvas');
        if (clonedCanvas && chartData) {
            renderFinalChart(clonedCanvas, chartData.sortedMonths, chartData.monthlyResults);
        }

        // 6. Esperar que as fontes estejam 100% prontas
        await document.fonts.ready;

        // 7. Esperar o próximo ciclo de renderização para garantir que o layout está estável
        const canvas = await new Promise((resolve) => {
            requestAnimationFrame(() => {
                // A captura agora é feita em um elemento que o navegador renderizou completamente
                html2canvas(clone, {
                    backgroundColor: 'transparent', // Usa o fundo do próprio elemento
                    useCORS: true,
                    scale: 3,
                }).then(resolve);
            });
        });

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/png');
        });

    } finally {
        // 8. Limpeza: remover o clone do documento, não importa o que aconteça
        document.body.removeChild(clone);
    }

}
async function exportWrappedAsImage() {
    const button = document.getElementById('export-wrapped-btn');
    if (button.disabled) return;

    // Adiciona um <span> para podermos alterar o texto sem remover o SVG
    if (!button.querySelector('span')) {
        button.innerHTML += '<span>Exportar como Imagem</span>';
    }

    updateButtonState(button, 'Gerando...', true);

    try {
        const imageBlob = await generateImageBlobFromElement('export-summary-card');
        
        const link = document.createElement('a');
        link.download = `meu_resumo_anual_xtraders.png`;
        link.href = URL.createObjectURL(imageBlob);
        link.click();

        // Limpa o objeto URL da memória após o download
        URL.revokeObjectURL(link.href);

    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        alert("Ocorreu um erro ao gerar a imagem.");
    } finally {
        updateButtonState(button, 'Exportar como Imagem', false);
    }
}


/**
 * OTIMIZADO: Compartilha o card de resumo (imagem ou link).
 */
async function shareWrapped() {
    const button = document.getElementById('share-wrapped-btn');
    if (button.disabled) return;
    
    // Adiciona um <span> se não existir
    if (!button.querySelector('span')) {
        button.innerHTML += '<span>Compartilhar</span>';
    }

    updateButtonState(button, 'Preparando...', true);

    try {
        const imageBlob = await generateImageBlobFromElement('export-summary-card');
        const imageFile = new File([imageBlob], 'resumo_anual_xtraders.png', { type: 'image/png' });

        // Verifica se o navegador suporta compartilhar ARQUIVOS
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
                files: [imageFile],
                title: 'Meu Resumo Anual 2024 - XTributation',
                text: 'Confira meu desempenho no mercado americano em 2024!',
            });
        } 
        // Se não suportar arquivos, tenta compartilhar o LINK (fallback)
        else if (navigator.share) {
             await navigator.share({
                title: 'Meu Resumo Anual 2024 - XTributation',
                text: 'Confira meu desempenho no mercado americano em 2024!',
                url: window.location.href,
            });
        }
        // Se não suportar a API de Share, copia o link para a área de transferência
        else {
            await navigator.clipboard.writeText(window.location.href);
            updateButtonState(button, 'Link Copiado!', false);
            // Retorna ao texto original após 2 segundos
            setTimeout(() => updateButtonState(button, 'Compartilhar', false), 2000);
            return; // Sai da função para não executar o `finally` imediatamente
        }
    } catch (err) {
        console.log('Erro ao compartilhar ou processo cancelado pelo usuário:', err);
    } finally {
        // Apenas reabilita o botão se não for o caso do clipboard (que tem seu próprio timer)
        if (button.textContent !== 'Link Copiado!') {
             updateButtonState(button, 'Compartilhar', false);
        }
    }
}

function openTradesModal_IR(month, monthName) {
    const modalTitle = document.getElementById('modal-title'); const modalTableBody = document.getElementById('modal-table-body');
    modalTitle.textContent = `Operações de ${monthName}`; modalTableBody.innerHTML = '';
    const tradesForMonth = allProcessedTrades_IR.filter(trade => trade.mes_ano === month);
    tradesForMonth.forEach(trade => { const tr = document.createElement('tr'); const resultClass = trade.resultado_liquido_usd >= 0 ? 'text-positive' : 'text-negative'; tr.innerHTML = `<td class="px-4 py-3 text-sm text-text-secondary">${new Date(trade.data_iso + 'T00:00:00Z').toLocaleDateString('pt-BR',{timeZone:'UTC'})}</td><td class="px-4 py-3 text-sm text-text-primary">${trade.ativo}</td><td class="px-4 py-3 text-sm text-right font-semibold ${resultClass}">${formatCurrency(trade.resultado_liquido_usd,'USD')}</td><td class="px-4 py-3 text-sm text-right font-semibold ${resultClass}">${formatCurrency(trade.resultado_liquido_brl,'BRL')}</td>`; modalTableBody.appendChild(tr); });
    modal_IR.classList.add('active');
}

    // =======================================================================
    // LÓGICA DE EXPORTAÇÃO
    // =======================================================================
    const { jsPDF } = window.jspdf;
    const exportModal = document.getElementById('export-modal'); const exportModalTitle = document.getElementById('export-modal-title'); const closeExportModalBtn = document.getElementById('close-export-modal-btn'); const exportOptionsContainer = document.getElementById('export-options-container'); const generateExportBtn = document.getElementById('generate-export-btn'); let currentExportType = null;

    function openExportModal(type) {
        currentExportType = type; 
        exportOptionsContainer.innerHTML = ''; 
        let optionsHtml = '';
        if (type === 'ir') { 
            exportModalTitle.textContent = "Exportar Relatório de IR"; 
            optionsHtml = `<label class="custom-checkbox-label"><input type="checkbox" id="include-ir-summary" class="custom-checkbox" checked> Incluir Resumo Anual</label><label class="custom-checkbox-label"><input type="checkbox" id="include-ir-monthly" class="custom-checkbox" checked> Incluir Resumo Mensal</label><label class="custom-checkbox-label"><input type="checkbox" id="include-ir-details" class="custom-checkbox"> Incluir Todas as Operações</label>`; 
        } else if (type === 'cambial') { 
            exportModalTitle.textContent = "Exportar Relatório Cambial"; 
            optionsHtml = `<label class="custom-checkbox-label"><input type="checkbox" id="include-cambial-summary" class="custom-checkbox" checked> Incluir Resumo Geral</label>`; 
        }
        exportOptionsContainer.innerHTML = optionsHtml; 
        exportModal.classList.add('active');
    }

    function closeExportModal() { exportModal.classList.remove('active'); }
    closeExportModalBtn.addEventListener('click', closeExportModal);
    exportModal.addEventListener('click', (e) => { if (e.target === exportModal) closeExportModal(); });

    generateExportBtn.addEventListener('click', () => {
        const btnText = document.getElementById('export-btn-text'); 
        const loader = document.getElementById('export-loader');
        btnText.textContent = 'Gerando...'; 
        loader.classList.remove('hidden'); 
        generateExportBtn.disabled = true;

        setTimeout(() => { 
            if (currentExportType === 'ir') { 
                generateProfessionalPDF_IR(); 
            } else if (currentExportType === 'cambial') { 
                generateProfessionalPDF_Cambial(); 
            } 
            btnText.textContent = 'Gerar e Baixar PDF'; 
            loader.classList.add('hidden'); 
            generateExportBtn.disabled = false; 
            closeExportModal(); 
        }, 500);
    });

    // =======================================================================
// LÓGICA DE EXPORTAÇÃO (VERSÃO FINAL COM CORREÇÃO DE SVG)
// =======================================================================

/**
 * Função auxiliar para converter um SVG em uma imagem PNG usando um canvas.
 * @param {string} svgString O código SVG como string.
 * @param {number} width A largura desejada para a imagem no PDF.
 * @param {number} height A altura desejada para a imagem no PDF.
 * @returns {Promise<string>} Uma Promise que resolve com o Data URI da imagem PNG.
 */
function convertSvgToPngDataUri(svgString, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // O SVG precisa ser convertido para Base64 para ser usado como source da imagem.
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-t' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Usamos uma escala para melhor qualidade (retina-ready)
            const scale = 3; 
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            
            // Desenha a imagem SVG no canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Converte o conteúdo do canvas para um PNG Data URI
            const pngDataUri = canvas.toDataURL('image/png');
            
            // Limpa a URL do Blob para liberar memória
            URL.revokeObjectURL(url);
            
            resolve(pngDataUri);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}

    function addPdfHeaderFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100); // Cor cinza para o texto do rodapé
        doc.setFont('helvetica', 'normal');

        // Rodapé corrigido
        doc.text('XTributation - Relatório de Apuração', 15, pageHeight - 10);
        doc.text(` ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 10);
    }
}

/**
 * Desenha os 4 cards de KPI (Indicadores Chave de Desempenho) no PDF.
 * ESTA É A VERSÃO CORRIGIDA COM MELHOR ESPAÇAMENTO E TAMANHO.
 */
function drawKpiBoxes(doc, startY) {
    const kpi = irKpiData;
    
    // --- VALORES AJUSTADOS ---
    const boxWidth = 95;      // Aumentado de 42 para 95
    const boxHeight = 35;     // Aumentado de 25 para 35 para mais espaço vertical
    const gap = 10;           // Aumentado de 5 para 10
    const numBoxes = 4;
    // --- FIM DOS AJUSTES ---

    const totalWidth = (numBoxes * boxWidth) + ((numBoxes - 1) * gap);
    const pageWidth = doc.internal.pageSize.getWidth();
    let startX = (pageWidth - totalWidth) / 2; // O cálculo de centralização continua o mesmo

    const kpiData = [
        { title: 'RESULTADO BRUTO (BRL)', value: formatCurrency(kpi.totalBRL) },
        { title: 'RESULTADO BRUTO (USD)', value: formatCurrency(kpi.totalUSD, 'USD') },
        { title: 'IMPOSTO DEVIDO (15%)', value: formatCurrency(kpi.impostoAnual) },
        { title: 'RESULTADO LÍQUIDO', value: formatCurrency(kpi.resultadoAposDarf) }
    ];

    kpiData.forEach(item => {
        // Desenha a borda do card
        doc.setDrawColor(220, 220, 220); // Cinza claro
        doc.roundedRect(startX, startY, boxWidth, boxHeight, 5, 5, 'S'); // Borda arredondada

        // Adiciona o título (label)
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100); // Cinza
        // Posição Y ajustada para a nova altura
        doc.text(item.title, startX + boxWidth / 2, startY + 12, { align: 'center' });

        // Adiciona o valor
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0); // Preto
        // Posição Y ajustada para a nova altura
        doc.text(item.value, startX + boxWidth / 2, startY + 28, { align: 'center' });
        
        // Move o X para a posição do próximo card
        startX += boxWidth + gap;
    });
    
    // Retorna a posição Y final para o próximo elemento
    return startY + boxHeight;
}

async function generateProfessionalPDF_IR() { // A função agora é ASYNC
    if (!finalReportData_IR) {
        alert('Dados não processados. Por favor, gere o relatório primeiro.');
        return;
    }

    try {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4'
        });

        const user = auth.currentUser;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // --- 1. CABEÇALHO COM LOGO ---
        const svgString = `<svg viewBox="0 0 59.3 45.9" xmlns="http://www.w3.org/2000/svg"><path d="M4.76369 -0.719727C2.13278 -0.719727 0 1.41305 0 4.04396V4.04396C0.00217239 3.70526 0.105853 3.37498 0.297665 3.09573C0.489477 2.81649 0.760619 2.60109 1.07611 2.47733C1.3916 2.35357 1.73695 2.32713 2.06762 2.40142C2.39829 2.47571 2.6991 2.64732 2.93124 2.89411L12.335 12.8644C13.2797 13.866 14.5956 14.4337 15.9724 14.4337H25.321C25.7157 14.4314 26.1025 14.5448 26.4334 14.7599C26.7644 14.975 27.0249 15.2823 27.1829 15.6438C27.3409 16.0054 27.3894 16.4053 27.3224 16.794C27.2553 17.1828 27.0757 17.5434 26.8058 17.8313L2.93398 43.2184C2.70202 43.4662 2.40099 43.6387 2.06985 43.7135C1.7387 43.7884 1.3927 43.7622 1.07662 43.6383C0.760551 43.5144 0.488961 43.2986 0.297012 43.0187C0.105064 42.7389 0.00159475 42.4079 0 42.0686V42.0686C0 44.6587 2.09968 46.7584 4.68977 46.7584H55.1698C57.9313 46.7584 60.1698 44.5198 60.1698 41.7584V4.28028C60.1698 1.51886 57.9313 -0.719727 55.1698 -0.719727H4.76369ZM18.297 1.59641C18.1396 1.42755 18.0354 1.2162 17.9972 0.988633C17.9591 0.761063 17.9887 0.527307 18.0824 0.316417C18.1761 0.105528 18.3297 -0.073197 18.5242 -0.197543C18.7187 -0.321889 18.9455 -0.386374 19.1763 -0.382983H40.9415C41.1711 -0.38424 41.3961 -0.318396 41.5888 -0.193551C41.7814 -0.0687055 41.9334 0.109697 42.026 0.319715C42.1185 0.529733 42.1476 0.762208 42.1097 0.988546C42.0718 1.21488 41.9686 1.42522 41.8126 1.59367L32.5669 11.5153C32.2486 11.8553 31.8638 12.1264 31.4364 12.3117C31.009 12.497 30.5481 12.5926 30.0822 12.5926C29.6163 12.5926 29.1553 12.497 28.7279 12.3117C28.3005 12.1264 27.9158 11.8553 27.5975 11.5153L18.297 1.59641ZM40.9196 46.501C40.9196 46.498 40.9171 46.4955 40.914 46.4955H19.1544C18.9243 46.4973 18.6986 46.4316 18.5054 46.3066C18.3122 46.1817 18.1598 46.0029 18.0671 45.7923C17.9745 45.5817 17.9455 45.3487 17.984 45.1219C18.0224 44.8951 18.1264 44.6845 18.2833 44.5161L27.5208 34.5973C27.8391 34.2572 28.2238 33.9862 28.6512 33.8008C29.0786 33.6155 29.5396 33.5199 30.0055 33.5199C30.4714 33.5199 30.9323 33.6155 31.3597 33.8008C31.7871 33.9862 32.1719 34.2572 32.4902 34.5973L41.788 44.5216C41.9465 44.6896 42.052 44.9004 42.0916 45.1279C42.1311 45.3553 42.1028 45.5894 42.0103 45.8009C41.9177 46.0125 41.765 46.1921 41.5711 46.3176C41.3786 46.442 41.1541 46.5077 40.925 46.5065C40.922 46.5065 40.9196 46.5041 40.9196 46.501V46.501ZM60.0959 42.0686C60.0937 42.4073 59.99 42.7376 59.7982 43.0168C59.6064 43.2961 59.3353 43.5115 59.0198 43.6352C58.7043 43.759 58.3589 43.7854 58.0283 43.7111C57.6976 43.6368 57.3968 43.4652 57.1646 43.2184L47.7636 33.2486C46.8189 32.2467 45.5029 31.6788 44.1259 31.6788H34.7776C34.3827 31.6809 33.9957 31.5673 33.6646 31.3521C33.3335 31.1369 33.0727 30.8294 32.9145 30.4678C32.7563 30.1061 32.7075 29.706 32.7743 29.3169C32.841 28.9279 33.0204 28.5669 33.2901 28.2785L57.1537 2.90506C57.3851 2.65704 57.6857 2.48423 58.0166 2.40904C58.3475 2.33386 58.6933 2.35977 59.0093 2.48342C59.3252 2.60707 59.5967 2.82274 59.7885 3.10247C59.9803 3.3822 60.0836 3.71307 60.0849 4.05217L60.0959 42.0686Z" fill="#000000"/></svg>`;

        // **AWAIT** a conversão do SVG para PNG
        const pngDataUri = await convertSvgToPngDataUri(svgString, 30, 25);

        // Adiciona a imagem PNG convertida
        doc.addImage(pngDataUri, 'PNG', (pageWidth / 2) - 15, 40, 30, 25);

        // O resto do código continua igual...
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text('Relatório de Apuração Anual de Resultados', pageWidth / 2, 95, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(`Contribuinte: ${user.email}`, pageWidth / 2, 110, { align: 'center' });
        doc.setDrawColor(220, 220, 220);
        doc.line(30, 125, pageWidth - 30, 125);
        let finalY = 140;

        if (document.getElementById('include-ir-summary').checked) {
            finalY = drawKpiBoxes(doc, finalY) + 20;
        }
        
        
        // --- 3. TABELA MENSAL ---
    if (document.getElementById('include-ir-monthly').checked) {
        const head = [['Mês', 'Resultado (USD)', 'Resultado (BRL)']];
        const body = finalReportData_IR.map(row => [
            `${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(row.mes.split('-')[1])-1]}/${row.mes.split('-')[0]}`,
            formatCurrency(row.resultado_liquido_usd, 'USD'),
            formatCurrency(row.resultado_liquido_brl)
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: finalY,
            theme: 'plain', // Tema limpo, sem muitas linhas
            styles: {
                font: 'helvetica',
                lineWidth: 0,
                cellPadding: { top: 6, right: 10, bottom: 6, left: 10 }
            },
            headStyles: {
                fillColor: [240, 240, 240], // Fundo cinza claro para o cabeçalho
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                textColor: [50, 50, 50],
                halign: 'left'
            },
            // Remove as linhas alternadas
            alternateRowStyles: undefined,
            didParseCell: function(data) {
                // Centraliza apenas o conteúdo do cabeçalho
                if (data.row.section === 'head') {
                    data.cell.styles.halign = 'center';
                } else {
                     // Alinha a primeira coluna à esquerda e as outras à direita
                    if (data.column.index > 0) {
                        data.cell.styles.halign = 'right';
                    }
                }
            }
        });
        finalY = doc.autoTable.previous.finalY + 20;
    }

    // --- 4. TABELA DE DETALHES (Opcional) ---
    if (document.getElementById('include-ir-details').checked) {
        if (finalY > 400) doc.addPage(); // Adiciona nova página se não houver espaço
        
        const head = [['Data', 'Ativo', 'Resultado (USD)', 'Resultado (BRL)']];
        const body = allProcessedTrades_IR.map(t => [
            new Date(t.data_iso + 'T00:00:00Z').toLocaleDateString('pt-BR'),
            t.ativo,
            formatCurrency(t.resultado_liquido_usd, 'USD'),
            formatCurrency(t.resultado_liquido_brl)
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: finalY > 400 ? 40 : finalY,
            // (Reutilize os estilos da tabela anterior para consistência)
             theme: 'plain',
             headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' },
             bodyStyles: { textColor: [50, 50, 50] }
        });
    }

  addPdfHeaderFooter(doc);
        doc.save(`Relatorio_IR_${user.email.split('@')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
        alert("Ocorreu um erro ao gerar a imagem do logo para o PDF. Tente novamente.");
    }
}

    function generateProfessionalPDF_Cambial() { 
        if (Object.keys(cambialKpiData).length === 0) { alert('Dados não processados.'); return; } 
        const doc = new jsPDF(); 
        const user = auth.currentUser; 
        let finalY = 45; 
        doc.setFontSize(18).text('Relatório de Envios e Retiradas', 14, 30); 
        doc.setFontSize(11).text(`Contribuinte: ${user.email}`, 14, 38); 
        if (document.getElementById('include-cambial-summary').checked) { 
            const kpi = cambialKpiData; 
            const summaryText = `Variação Cambial Total: ${formatCurrency(kpi.lucroPrejuizoTotal)}\nImposto Devido sobre Retiradas: ${formatCurrency(kpi.impostoDevido)}\nSaldo Atual (USD): ${formatCurrency(kpi.saldoUSD, 'USD')}\nSaldo Atual (BRL): ${formatCurrency(kpi.custoSaldoBRL)}`; 
            doc.setFontSize(12).setTextColor('#000000').text('Resumo Geral', 14, finalY); 
            finalY += 7; 
            doc.setFontSize(10).setTextColor('#000000').text(summaryText, 14, finalY); 
            finalY += 30; 
        } 
        const head = [cambialExportData.headers]; 
        const body = cambialExportData.data.map(row => Object.values(row).map(val => typeof val === 'number' ? val.toFixed(2) : val)); 
        doc.autoTable({ head, body, startY: finalY, headStyles: {fillColor: '#1E1E26'} }); 
        addPdfHeaderFooter(doc); 
        doc.save(`Relatorio_Cambial_${user.email.split('@')[0]}.pdf`); 
    }

// --- Bloco final para adicionar event listeners ---
document.addEventListener('DOMContentLoaded', () => {
    signInButton?.addEventListener('click', handleSignIn);
    registerButton?.addEventListener('click', handleRegistration);
    signOutButton?.addEventListener('click', () => signOut(auth));
    logoutFromNoAccessBtn?.addEventListener('click', () => signOut(auth));
    forgotPasswordLink?.addEventListener('click', handlePasswordReset);
    goToRegisterLink?.addEventListener('click', (e) => { e.preventDefault(); loginScreen.style.display = 'none'; registerScreen.style.display = 'flex'; });
    goToLoginLink?.addEventListener('click', (e) => { e.preventDefault(); registerScreen.style.display = 'none'; loginScreen.style.display = 'flex'; });
    acceptTermsBtn?.addEventListener('click', handleAcceptTerms);
    declineTermsBtn?.addEventListener('click', () => signOut(auth));
    document.getElementById('main-tab-cambial')?.addEventListener('click', () => showMainTab('cambial'));
    document.getElementById('main-tab-ir')?.addEventListener('click', () => showMainTab('ir'));
    document.getElementById('main-tab-wrapped')?.addEventListener('click', () => showMainTab('wrapped'));
    document.getElementById('add-trans-button')?.addEventListener('click', handleSaveTransaction);
    document.getElementById('cancel-edit-button')?.addEventListener('click', cancelEdit);
    document.getElementById('process-cambial-button')?.addEventListener('click', handleProcessCambial);
    tradesFileInput_IR?.addEventListener('change', handleFileSelect_IR);
    processButton_IR?.addEventListener('click', processFiles_IR);
    closeModalButton_IR?.addEventListener('click', closeTradesModal_IR);
    modal_IR?.addEventListener('click', (e) => { if (e.target === modal_IR) closeTradesModal_IR(); });
    closeExportModalBtn?.addEventListener('click', closeExportModal);
    exportModal?.addEventListener('click', (e) => { if (e.target === exportModal) closeExportModal(); });
    openTutorialButton?.addEventListener('click', startTour);
});

// Funções que precisam ser globais para botões dinâmicos
window.editTransaction = editTransaction;
window.removeTransaction = removeTransaction;
