import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";
import "./scripts/hero-sheet.js";

Hooks.once("init", function () {
    console.log("%c JS custom operationnel ", 'color:lime;');

    CONFIG.voidHorizon = voidHorizon;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault: true});

console.log($("body"))

})

// Initialisation du système
Hooks.once('init', async function() {
    console.log('Initialisation du système voidHorizon');
});

// Quand le jeu est prêt
Hooks.once('ready', async function() {
    console.log('Système voidHorizon prêt');
});