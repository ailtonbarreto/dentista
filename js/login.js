
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

    async function validarCredenciais(username, password) {
        try {
          const response = await fetch("https://barretoapps.com.br/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: username, senha: password })
          });
      
          const result = await response.json();
      
          if (response.ok && result.success) {
            realizarLogin(result.user);
          } else {
            exibirAlerta(result.message || "Usuário ou senha incorretos!");
          }
        } catch (err) {
          console.error(err);
          exibirAlerta("Erro ao tentar logar.");
        }
    };

    function realizarLogin(user) {
        sessionStorage.setItem("logon", true);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
    
        window.location.href = "./page/home.html";
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
