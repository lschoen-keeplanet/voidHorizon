import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";
import {registerSettings} from "./module/settings.js";
import "./scripts/heros-sheet.js";
import "./scripts/npc-sheet.js";

Hooks.once("init", function () {
    console.log("%c JS custom operationnel ", 'color:lime;');

    CONFIG.voidHorizon = voidHorizon;

    // Enregistrer les paramètres de configuration
    registerSettings();

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault: true});

    console.log($("body"));
})

// Initialisation du système
Hooks.once('init', async function() {
    console.log('Initialisation du système voidHorizon');
});

// Quand le jeu est prêt
Hooks.once('ready', async function() {
    console.log('Système voidHorizon prêt');
});