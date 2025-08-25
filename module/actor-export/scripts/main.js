/**
 * Module d'Export d'Acteurs voidHorizon
 * Gère l'export des fiches de personnages en différents formats
 */

class VoidHorizonActorExport {
    constructor() {
        this.providers = new Map();
        this.exportUtils = null;
        this.initialized = false;
    }

    /**
     * Initialise le module
     */
    async initialize() {
        console.log('🚀 Initialisation du module voidHorizon Actor Export...');
        
        try {
            // Initialiser les utilitaires d'export
            this.exportUtils = new ExportUtils();
            
            // Enregistrer les providers
            this.registerProviders();
            
            // Ajouter le bouton d'export aux fiches d'acteurs
            this.addExportButtonToSheets();
            
            // Ajouter les hooks
            this.addHooks();
            
            this.initialized = true;
            console.log('✅ Module voidHorizon Actor Export initialisé avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du module voidHorizon Actor Export:', error);
        }
    }

    /**
     * Enregistre les providers d'export
     */
    registerProviders() {
        console.log('📦 Enregistrement des providers d\'export...');
        
        // Provider JSON
        if (window.JSONProvider) {
            this.providers.set('json', new window.JSONProvider());
            console.log('✅ Provider JSON enregistré');
        } else {
            console.warn('⚠️ Provider JSON non disponible');
        }
        
        // Provider HTML
        if (window.HTMLProvider) {
            this.providers.set('html', new window.HTMLProvider());
            console.log('✅ Provider HTML enregistré');
        } else {
            console.warn('⚠️ Provider HTML non disponible');
        }
        
        // Provider PDF
        if (window.PDFProvider) {
            this.providers.set('pdf', new window.PDFProvider());
            console.log('✅ Provider PDF enregistré');
        } else {
            console.warn('⚠️ Provider PDF non disponible');
        }
        
        console.log(`📊 Total des providers enregistrés : ${this.providers.size}`);
    }

    /**
     * Ajoute le bouton d'export aux fiches d'acteurs
     */
    addExportButtonToSheets() {
        console.log('🔘 Ajout du bouton d\'export aux fiches...');
        
        // Hook générique pour toutes les fiches d'acteurs
        Hooks.on('renderActorSheet', (app, html, data) => {
            console.log('🎭 Hook renderActorSheet déclenché pour:', app.constructor.name);
            this.addExportButtonToSheet(app, html, data);
        });
        
        // Hook pour les fiches voidHorizon spécifiques
        Hooks.on('renderHeroSheet', (app, html, data) => {
            console.log('🦸 Hook renderHeroSheet déclenché');
            this.addExportButtonToSheet(app, html, data);
        });
        
        Hooks.on('renderNpcSheet', (app, html, data) => {
            console.log('👹 Hook renderNpcSheet déclenché');
            this.addExportButtonToSheet(app, html, data);
        });
        
        // Hook pour capturer toutes les fiches voidHorizon
        Hooks.on('renderSheet', (app, html, data) => {
            if (app.actor && this.canExportActor(app.actor)) {
                console.log('📋 Hook renderSheet générique pour voidHorizon:', app.constructor.name);
                this.addExportButtonToSheet(app, html, data);
            }
        });
        
        // Hook pour les fiches existantes déjà ouvertes
        Hooks.once('ready', () => {
            console.log('🎯 Hook ready - ajout du bouton aux fiches déjà ouvertes');
            this.addExportButtonToExistingSheets();
        });
    }

    /**
     * Ajoute le bouton d'export aux fiches déjà ouvertes
     */
    addExportButtonToExistingSheets() {
        try {
            // Parcourir toutes les applications ouvertes
            for (const [id, app] of Object.entries(ui.windows)) {
                if (app.actor && this.canExportActor(app.actor)) {
                    console.log(`🔘 Ajout du bouton à la fiche existante: ${app.actor.name}`);
                    // Forcer le re-render pour déclencher les hooks
                    app.render(true);
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout aux fiches existantes:', error);
        }
    }

    /**
     * Ajoute le bouton d'export à une fiche spécifique
     */
    addExportButtonToSheet(app, html, data) {
        try {
            const actor = app.actor;
            if (!actor || !this.canExportActor(actor)) {
                console.log('❌ Acteur non exportable:', actor?.name || 'undefined');
                return;
            }
            
            console.log(`🔍 Recherche de zone d'insertion pour ${actor.name} (${app.constructor.name})`);
            
            // Vérifier si le bouton existe déjà
            if (html.find('.export-actor-btn').length > 0) {
                console.log('✅ Bouton d\'export déjà présent');
                return;
            }
            
            // Chercher la zone des boutons d'action - plusieurs stratégies
            let buttonContainer = null;
            const selectors = [
                '.sheet-header .header-expanded .header-details-fade',
                '.sheet-header .header-details',
                '.sheet-header .header-actions',
                '.sheet-header .header-buttons',
                '.sheet-header .character-header',
                '.sheet-header',
                '.character-header',
                '.header-section'
            ];
            
            for (const selector of selectors) {
                buttonContainer = html.find(selector);
                if (buttonContainer.length > 0) {
                    console.log(`✅ Zone trouvée avec le sélecteur: ${selector}`);
                    break;
                }
            }
            
            if (!buttonContainer || buttonContainer.length === 0) {
                console.log('⚠️ Aucune zone d\'insertion trouvée, fallback sur .sheet-header');
                buttonContainer = html.find('.sheet-header');
            }
            
            // Créer le bouton d'export
            const exportButton = $(`
                <button type="button" class="export-actor-btn" title="Exporter ${actor.name}">
                    <i class="fas fa-download"></i>
                    Exporter
                </button>
            `);
            
            // Ajouter le bouton au conteneur
            if (buttonContainer && buttonContainer.length > 0) {
                buttonContainer.append(exportButton);
                console.log(`✅ Bouton d'export ajouté à ${actor.name} dans ${buttonContainer[0].className || 'zone inconnue'}`);
            } else {
                // Fallback : ajouter à la fin du header
                html.find('.sheet-header').append(exportButton);
                console.log(`⚠️ Fallback: bouton ajouté à .sheet-header pour ${actor.name}`);
            }
            
            // Ajouter l'événement de clic
            exportButton.on('click', (event) => {
                event.preventDefault();
                console.log(`🖱️ Clic sur bouton d'export pour ${actor.name}`);
                this.openExportDialog(actor);
            });
            
            console.log(`✅ Bouton d'export configuré pour ${actor.name}`);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout du bouton d\'export:', error);
        }
    }

    /**
     * Vérifie si un acteur peut être exporté
     */
    canExportActor(actor) {
        if (!actor || !actor.system) {
            return false;
        }
        
        // Vérifier que c'est un acteur voidHorizon
        if (actor.system.type !== 'heros' && actor.system.type !== 'npc') {
            return false;
        }
        
        return true;
    }

    /**
     * Ouvre la boîte de dialogue d'export
     */
    openExportDialog(actor) {
        try {
            console.log(`📤 Ouverture de la boîte de dialogue d'export pour ${actor.name}`);
            
            // Vérifier que ExportDialog est disponible
            if (typeof window.ExportDialog === 'undefined') {
                console.error('❌ ExportDialog non disponible');
                ui.notifications.error('Erreur : Module d\'export non initialisé correctement');
                return;
            }
            
            // Créer et afficher la boîte de dialogue
            const exportDialog = new window.ExportDialog(actor, this.providers);
            exportDialog.render(true);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'ouverture de la boîte de dialogue d\'export:', error);
            ui.notifications.error(`Erreur lors de l'ouverture de la boîte de dialogue : ${error.message}`);
        }
    }

    /**
     * Ajoute les hooks Foundry VTT
     */
    addHooks() {
        console.log('🔗 Ajout des hooks Foundry VTT...');
        
        // Hook pour l'initialisation
        Hooks.once('init', () => {
            console.log('🎯 Hook init déclenché pour voidHorizon Actor Export');
        });
        
        // Hook pour le chargement des modules
        Hooks.once('ready', () => {
            console.log('🎯 Hook ready déclenché pour voidHorizon Actor Export');
        });
        
        // Hook pour la création d'acteurs
        Hooks.on('createActor', (actor) => {
            if (this.canExportActor(actor)) {
                console.log(`🎭 Nouvel acteur créé : ${actor.name}`);
            }
        });
        
        // Hook pour la suppression d'acteurs
        Hooks.on('deleteActor', (actor) => {
            if (this.canExportActor(actor)) {
                console.log(`🗑️ Acteur supprimé : ${actor.name}`);
            }
        });
        
        console.log('✅ Hooks ajoutés avec succès');
    }

    /**
     * Obtient un provider par format
     */
    getProvider(format) {
        return this.providers.get(format);
    }

    /**
     * Obtient tous les providers disponibles
     */
    getProviders() {
        return this.providers;
    }

    /**
     * Vérifie si un format est supporté
     */
    isFormatSupported(format) {
        for (const [key, provider] of this.providers) {
            if (provider.supportedFormats.includes(format)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtient la liste des formats supportés
     */
    getSupportedFormats() {
        const formats = new Set();
        for (const [key, provider] of this.providers) {
            provider.supportedFormats.forEach(format => formats.add(format));
        }
        return Array.from(formats);
    }

    /**
     * Exécute un export direct (sans interface)
     */
    async exportActor(actor, format, options = {}) {
        try {
            if (!this.initialized) {
                throw new Error('Module non initialisé');
            }
            
            if (!this.canExportActor(actor)) {
                throw new Error('Acteur non exportable');
            }
            
            const provider = this.getProvider(format);
            if (!provider) {
                throw new Error(`Format ${format} non supporté`);
            }
            
            console.log(`📤 Export direct de ${actor.name} en ${format}`);
            const result = await provider.export(actor, options);
            
            console.log('✅ Export direct réussi:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export direct:', error);
            throw error;
        }
    }

    /**
     * Affiche une notification
     */
    showNotification(message, type = 'info') {
        if (ui && ui.notifications) {
            switch (type) {
                case 'success':
                    ui.notifications.info(message);
                    break;
                case 'error':
                    ui.notifications.error(message);
                    break;
                case 'warning':
                    ui.notifications.warn(message);
                    break;
                default:
                    ui.notifications.info(message);
            }
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Obtient les informations de debug
     */
    getDebugInfo() {
        return {
            initialized: this.initialized,
            providersCount: this.providers.size,
            providers: Array.from(this.providers.keys()),
            supportedFormats: this.getSupportedFormats(),
            exportUtils: this.exportUtils ? 'Disponible' : 'Non disponible',
            ExportDialog: typeof window.ExportDialog !== 'undefined' ? 'Disponible' : 'Non disponible'
        };
    }
}

// Instancier et initialiser le module
Hooks.once('init', async () => {
    console.log('🚀 Initialisation du module voidHorizon Actor Export...');
    
    // Attendre que tous les composants soient chargés
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.voidHorizonActorExport = new VoidHorizonActorExport();
    await window.voidHorizonActorExport.initialize();
    
    console.log('✅ Module voidHorizon Actor Export prêt !');
});

// Exposer le module globalement pour le debug
window.VoidHorizonActorExport = VoidHorizonActorExport;
