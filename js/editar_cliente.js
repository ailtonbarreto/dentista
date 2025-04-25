window.addEventListener('load', ()=>{

    const modal_edit = document.getElementById('modal_edit');
    const btn_abrir_modal_edit = document.getElementById('abrir_modal_edit');
    const btn_fechar_modal_edit = document.getElementById('fechar_modal_edit')

    // ------------------------------------------------------------------------------------

    btn_abrir_modal_edit.addEventListener('click', ()=>{

        modal_edit.style.display = 'flex';

    });


    // ------------------------------------------------------------------------------------

    btn_fechar_modal_edit.addEventListener('click', ()=>{

        modal_edit.style.display = 'none';

    });


})