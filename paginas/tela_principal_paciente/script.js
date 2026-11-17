// funcao para o modal 
function configurarPreparo(){
    const modal = document.getElementById("modalPreparo");

    function fechar(){
        modal.classList.remove("visivel")
    }

    document.getElementById("btnVerPreparo").addEventListener("click", function(e){
        e.preventDefault();
        modal.classList.add("visivel");
    });

    document.getElementById("btnFecharPreparo").addEventListener("click", fechar);
    document.getElementById("btnEntendiPreparo").addEventListener("click", fechar);

    modal.addEventListener("click", function (e){
        if(e.target === modal) fechar();
    });
}

document.addEventListener("DOMContentLoaded", function(){
    configurarPreparo();
})
