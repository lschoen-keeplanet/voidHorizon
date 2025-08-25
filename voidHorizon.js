import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";
import {registerSettings} from "./module/settings.js";
import "./scripts/heros-sheet.js";
import "./scripts/npc-sheet.js";

// Initialisation unifiée du système voidHorizon
Hooks.once('init', async function() {
    console.log('🚀 Initialisation du système voidHorizon');
    
    try {
        // Configuration du système
        CONFIG.voidHorizon = voidHorizon;
        console.log('✅ Configuration système chargée');
        
        // Enregistrer les paramètres de configuration
        registerSettings();
        console.log('✅ Paramètres voidHorizon enregistrés avec succès');
        
        // Attendre que les fonctions d'enregistrement soient disponibles
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (window.registerHeroSheet && window.registerNpcSheet && window.registerItemSheet) {
                console.log('✅ Toutes les fonctions d\'enregistrement sont disponibles');
                break;
            }
            
            console.log(`⏳ Attente des fonctions d'enregistrement... (tentative ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('⚠️ Fonctions d\'enregistrement non disponibles, utilisation du fallback');
            
            // Fallback : enregistrement direct
            Items.unregisterSheet("core", ItemSheet);
            Items.registerSheet("voidHorizon", VHItemSheet, {makeDefault: true});
            console.log('✅ Feuilles d\'objets voidHorizon enregistrées (fallback)');
        } else {
            // Enregistrer les feuilles d'objets personnalisées
            if (window.registerItemSheet) {
                window.registerItemSheet();
            }
            console.log('✅ Feuilles d\'objets voidHorizon enregistrées');
            
            // Enregistrer les feuilles d'acteurs personnalisées
            if (window.registerHeroSheet) {
                window.registerHeroSheet();
            }
            if (window.registerNpcSheet) {
                window.registerNpcSheet();
            }
            console.log('✅ Feuilles d\'acteurs voidHorizon enregistrées');
        }
        
        console.log('🎯 JS custom operationnel');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
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