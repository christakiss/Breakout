/*jslint node: true, browser: true */
"use strict";
/*global GraphicsView*/
function GraphicsController() {
    var view = new GraphicsView();
    
    this.init = function () {
        view.init();
    };
}

var controller = new GraphicsController();
window.addEventListener("load", controller.init);

