window.onload = function () {
    
    window.onscroll = function () {
        var offset = window.pageYOffset;

        if (offset > 160) {
            //AFFIX MODE
            document.body.className = "header-fixed";
        }
        else {
            //NORMAL MODE
            document.body.className = "";
        }
    }

}