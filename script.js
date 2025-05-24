
window.addEventListener("load", function () {
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
      const response = await fetch("https://api-barretoapps.onrender.com/login", {
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
  }


  function exibirAlerta(mensagem) {
    const alert = document.getElementById("alert");
    alert.innerText = mensagem;
    alert.style.display = "block";
  }

  function realizarLogin(userData) {
    sessionStorage.setItem("logon", "1");
    sessionStorage.setItem("currentUser", userData.user);


    let empresa = userData.empresa;
  
    if (empresa.startsWith('"') && empresa.endsWith('"')) {
        empresa = empresa.slice(1, -1);
    }

    sessionStorage.setItem("empresa", empresa);

    atualizarInterface(userData);
  }

  function atualizarInterface(userData) {
    const sidebar = document.getElementById("sidebar");

    sidebar.querySelectorAll("button").forEach(botao => botao.remove());

    let primeiroModuloLiberado = null;

    let logo = document.getElementById('logotipo').src = userData.logo;

    Object.keys(userData).forEach(modulo => {
      if (modulo !== "user" && modulo !== "password" && userData[modulo].toLowerCase() === "liberado") {
        let botao = document.createElement("button");
        botao.textContent = modulo;
        botao.onclick = function () {
          document.getElementById("iframe").src = `${modulo}.html`;
          toggleMenu();
        };

        sidebar.appendChild(botao);

        if (!primeiroModuloLiberado) {
          primeiroModuloLiberado = modulo;
        }
      }
    });

    if (primeiroModuloLiberado) {
      document.getElementById("iframe").src = `${primeiroModuloLiberado}.html`;
    }

    const button_exit = document.createElement("button");
    button_exit.className = "exit-btn";
    button_exit.textContent = "Sair";
    button_exit.onclick = Exit;
    sidebar.appendChild(button_exit);

    document.getElementById("container-login").classList.add("desapear");
    document.getElementById("logged-message").innerHTML = userData.nickname;
  }


});

function toggleMenu() {
  var sidebar = document.getElementById("sidebar");
  sidebar.style.left = (sidebar.style.left === "0px") ? "-250px" : "0px";
}

document.getElementById("menu-icon").addEventListener("click", toggleMenu);

function Exit() {
  sessionStorage.removeItem("logon");
  sessionStorage.removeItem("currentUser");

  document.getElementById("container-login").classList.remove("desapear");
  document.getElementById("iframe").src = "";
  document.getElementById("logged-message").innerHTML = "";
  window.location.reload();
}
