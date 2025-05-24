window.addEventListener('load', async () => {

    await aplicarTema();

    // -------------------------------------------------------------------------------
    // APLICAR TEMA

    async function aplicarTema() {
        const empresa = sessionStorage.getItem('empresa');
        if (!empresa) {
            console.warn('Empresa não definida.');
            document.body.style.visibility = 'visible';
            return;
        }
    
        try {
            const resposta = await fetch(`https://api-barretoapps.onrender.com/tema/${empresa}`);
            if (!resposta.ok) throw new Error('Erro ao buscar tema');
    
            const json = await resposta.json();
            const tema = json.data[0];
            const root = document.documentElement;
    

            root.style.setProperty('--cor-primaria', tema.cor_primaria);
            root.style.setProperty('--cor-secundaria', tema.cor_secundaria);
            root.style.setProperty('--cor-terciaria', tema.cor_terciaria);
            root.style.setProperty('--cor-texto', tema.cor_texto);

    
        } catch (erro) {
            console.error('Erro ao aplicar tema:', erro);
        } finally {

            document.body.style.visibility = 'visible';
        }
    }
    
    

    // -------------------------------------------------------------------------------


})




