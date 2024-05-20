import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";

Hooks.once("init", function () {
    console.log("%c JS custom operationnel ", 'color:lime;');

    CONFIG.voidHorizon = voidHorizon;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault: true});

console.log($("body"))

})