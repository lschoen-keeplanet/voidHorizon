import VHItemSheet from "./module/sheets/VHItemSheet.js";
import {voidHorizon} from "./module/config.js";
import {registerSettings} from "./module/settings.js";
import "./scripts/heros-sheet.js";
import "./scripts/npc-sheet.js";

// Nettoyer les hooks problématiques existants
Hooks.once('init', function() {
    console.log('🧹 Nettoyage des hooks problématiques...');
    
    // Supprimer seulement les hooks problématiques, pas tous
    if (Hooks.events.getHeaderControlsApplicationV2) {
        const hooksToRemove = [...Hooks.events.getHeaderControlsApplicationV2];
        hooksToRemove.forEach(hook => {
            // Vérifier si c'est un hook problématique avant de le supprimer
            if (hook.fn) {
                const fnStr = hook.fn.toString();
                
                // Supprimer seulement les hooks qui contiennent des références problématiques
                if (fnStr.includes('actorExport.ID') || 
                    fnStr.includes('Handlebars.registerHelper') ||
                    fnStr.includes('main.js')) {
                    
                    Hooks.off('getHeaderControlsApplicationV2', hook.fn);
                    console.log('🗑️ Hook problématique supprimé:', hook);
                } else {
                    console.log('✅ Hook sain conservé:', hook);
                }
            }
        });
        console.log('✅ Nettoyage sélectif terminé');
    }
});

// Diagnostic avancé des hooks problématiques
Hooks.on('getHeaderControlsApplicationV2', function(app, buttons) {
    console.log('🚨 === DIAGNOSTIC HOOK getHeaderControlsApplicationV2 ===');
    console.log('📱 Application:', app);
    console.log('🔘 Boutons:', buttons);
    
    // Analyser tous les hooks enregistrés pour ce hook
    if (Hooks.events.getHeaderControlsApplicationV2) {
        console.log('📋 Tous les hooks getHeaderControlsApplicationV2 enregistrés:');
        
        Hooks.events.getHeaderControlsApplicationV2.forEach((hook, index) => {
            console.log(`  🔍 Hook ${index}:`, hook);
            
            if (hook.fn) {
                const fnStr = hook.fn.toString();
                console.log(`  📝 Source (200 premiers caractères):`, fnStr.substring(0, 200) + '...');
                
                // Chercher des indices dans le code
                if (fnStr.includes('main.js')) {
                    console.log(`  🚨 ATTENTION: Contient 'main.js' - POTENTIELLEMENT PROBLÉMATIQUE`);
                }
                if (fnStr.includes('app.type')) {
                    console.log(`  🚨 ATTENTION: Accède à 'app.type' - CAUSE DE L'ERREUR`);
                }
                if (fnStr.includes('Cannot read properties')) {
                    console.log(`  🚨 ATTENTION: Contient le message d'erreur`);
                }
                if (fnStr.includes('voidHorizon')) {
                    console.log(`  ✅ Contient 'voidHorizon' - Notre code`);
                }
            }
        });
    }
    
    console.log('🚨 === FIN DU DIAGNOSTIC ===');
    
    // Retourner les boutons sans modification
    return buttons;
});

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