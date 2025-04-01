
window.addEventListener("load", function () {

    sessionStorage.clear();

    configurarFormularioLogin();

    function configurarFormularioLogin() {
        
        const loginForm = document.getElementById("loginForm");

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const username = document.getElementById("input-user").value.trim();

            const password = document.getElementById("password").value.trim();
            

            if (!username || !password) {

                exibirAlerta("Usuário e senha são obrigatórios!");
                return;
            }

            await validarCredenciais(username, password);
        });
    }

    async function obterDadosPlanilha() {

        try {
            const response = await fetch("./js/keys.json");

            if (!response.ok) throw new Error("Erro ao carregar arquivo keys.json");

            const data = await response.json();

            if (!data.length || !data[0].base) throw new Error("Formato inválido do JSON.");

            const planilhaURL = data[0].base;

            const planilhaResponse = await fetch(planilhaURL);

            if (!planilhaResponse.ok) throw new Error("Erro ao carregar a planilha.");

            const csvText = await planilhaResponse.text();

            return processarCSV(csvText);

        } catch (error) {

            console.error("Erro:", error);

            exibirAlerta("Erro ao carregar dados.");

            return [];
        }
    }

    async function validarCredenciais(username, password) {

        const usuarios = await obterDadosPlanilha();

        const user = usuarios.find(u => u.user === username && u.password === password);

        if (user) {

            sessionStorage.setItem("user_name", user.user);

            window.dispatchEvent(new Event("storage")); 

            document.getElementById("container-login").style.display = "none";


        } else {
            exibirAlerta("Usuário ou senha incorretos!");
        }
    }

    function processarCSV(csvText) {
        const linhas = csvText.split("\n").map(l => l.trim()).filter(l => l);
        const [cabecalho, ...dados] = linhas;
        const colunas = cabecalho.split(",");
    
        return dados.map(linha => {
            const valores = linha.split(",");
            return colunas.reduce((obj, col, index) => {
                obj[col.trim()] = valores[index]?.trim() || "";
                return obj;
            }, {});
        });
    }
    

    function exibirAlerta(mensagem) {
        const alert = document.getElementById("alert");
        alert.innerText = mensagem;
        alert.style.display = "block";
    }

});



function Exit() {
    sessionStorage.removeItem("logon");
    sessionStorage.removeItem("currentUser");
    document.getElementById("container-login").classList.remove("desapear");
    document.getElementById("iframe").src = "";
    document.getElementById("logged-message").innerHTML = "";
    window.location.reload();
}
