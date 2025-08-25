import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";
import {registerSettings} from "./module/settings.js";
import "./scripts/heros-sheet.js";
import "./scripts/npc-sheet.js";

// Initialisation du système
Hooks.once('init', async function() {
    console.log('🚀 Initialisation du système voidHorizon');
    
    // Configuration du système
    CONFIG.voidHorizon = voidHorizon;
    
    // Enregistrer les paramètres de configuration
    try {
        registerSettings();
        console.log('✅ Paramètres voidHorizon enregistrés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des paramètres:', error);
    }
    
    // Enregistrer les feuilles d'objets personnalisées
    try {
        Items.unregisterSheet("core", ItemSheet);
        Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault: true});
        console.log('✅ Feuilles d\'objets voidHorizon enregistrées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des feuilles:', error);
    }
    
    console.log('🎯 JS custom operationnel');
});

// Quand le jeu est prêt
Hooks.once('ready', async function() {
    console.log('🎮 Système voidHorizon prêt et opérationnel');
    
    // Vérifier que les paramètres sont bien enregistrés
    if (game.settings) {
        console.log('🔧 Paramètres Foundry VTT disponibles:', Object.keys(game.settings.settings));
        console.log('🎛️ Paramètres voidHorizon disponibles:', Object.keys(game.settings.settings).filter(key => key.startsWith('voidHorizon')));
    } else {
        console.error('❌ game.settings n\'est pas disponible');
    }
});