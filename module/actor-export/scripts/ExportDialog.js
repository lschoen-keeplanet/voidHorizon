/**
 * Classe ExportDialog pour voidHorizon
 * Gère l'interface utilisateur pour l'export des acteurs
 */
class ExportDialog extends Application {
    constructor(actor, providers, options = {}) {
        super(options);
        this.actor = actor;
        this.providers = providers;
        this.exportOptions = {
            format: 'pdf',
            includeImage: true,
            includeItems: true,
            includeTraits: true,
            includeBiography: false
        };
        this.isExporting = false;
    }

    /**
     * Configuration de l'application
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'voidHorizon-export-dialog',
            template: 'modules/voidHorizon-actor-export/templates/export-dialog.html',
            popOut: true,
            width: 650,
            height: 600,
            resizable: true,
            minimizable: false,
            title: 'Exporter un Acteur voidHorizon'
        });
    }

    /**
     * Données passées au template
     */
    getData() {
        return {
            actor: this.actor,
            options: this.exportOptions,
            providers: Array.from(this.providers.values()).map(provider => ({
                name: provider.name,
                description: provider.description,
                supportedFormats: provider.supportedFormats
            }))
        };
    }

    /**
     * Événements DOM
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Gestion du changement de format
        html.find('input[name="format"]').on('change', (event) => {
            this.exportOptions.format = event.target.value;
            this.updatePreview();
        });

        // Gestion des options d'export
        html.find('input[name="includeImage"]').on('change', (event) => {
            this.exportOptions.includeImage = event.target.checked;
            this.updatePreview();
        });

        html.find('input[name="includeItems"]').on('change', (event) => {
            this.exportOptions.includeItems = event.target.checked;
            this.updatePreview();
        });

        html.find('input[name="includeTraits"]').on('change', (event) => {
            this.exportOptions.includeTraits = event.target.checked;
            this.updatePreview();
        });

        html.find('input[name="includeBiography"]').on('change', (event) => {
            this.exportOptions.includeBiography = event.target.checked;
            this.updatePreview();
        });

        // Bouton d'export
        html.find('.export-btn').on('click', (event) => {
            event.preventDefault();
            this.executeExport();
        });

        // Bouton d'annulation
        html.find('.cancel-btn').on('click', (event) => {
            event.preventDefault();
            this.close();
        });

        // Mise à jour initiale de l'aperçu
        this.updatePreview();
    }

    /**
     * Met à jour l'aperçu de l'export
     */
    updatePreview() {
        const html = this.element;
        const format = this.exportOptions.format;
        const actorName = this.actor.name;
        
        // Mettre à jour le format affiché
        html.find('#preview-format').text(format.toUpperCase());
        
        // Mettre à jour le nom de fichier
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `voidHorizon_${actorName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${format}`;
        html.find('#preview-filename').text(fileName);
        
        // Mettre à jour les informations de l'acteur
        this.updateActorPreview();
        
        // Mettre à jour les options sélectionnées
        this.updateOptionsPreview();
    }

    /**
     * Met à jour l'aperçu des informations de l'acteur
     */
    updateActorPreview() {
        const html = this.element;
        const actor = this.actor;
        
        // Informations de base
        html.find('.preview-actor-name').text(actor.name);
        html.find('.preview-actor-type').text(actor.type === 'heros' ? 'Héros' : 'PNJ');
        
        // Statistiques
        const stats = actor.system.stats || {};
        html.find('.preview-agility').text(stats.agility || 0);
        html.find('.preview-constitution').text(stats.constitution || 0);
        html.find('.preview-intelligence').text(stats.intelligence || 0);
        html.find('.preview-perception').text(stats.perception || 0);
        html.find('.preview-strength').text(stats.strength || 0);
        html.find('.preview-willpower').text(stats.willpower || 0);
        
        // Santé et armure
        const health = actor.system.health || {};
        const armor = actor.system.armor || {};
        html.find('.preview-health').text(`${health.current || 0} / ${health.max || 0}`);
        html.find('.preview-armor').text(`${armor.value || 0} (${this.getArmorTypeName(armor.type || 'tissu')})`);
        
        // Mouvement
        const movement = this.calculateMovement(actor);
        html.find('.preview-movement').text(`${movement.final}m`);
        html.find('.preview-movement-formula').text(movement.formula);
    }

    /**
     * Met à jour l'aperçu des options sélectionnées
     */
    updateOptionsPreview() {
        const html = this.element;
        const options = this.exportOptions;
        
        // Mettre à jour les indicateurs d'options
        html.find('.option-indicator.image').toggleClass('active', options.includeImage);
        html.find('.option-indicator.items').toggleClass('active', options.includeItems);
        html.find('.option-indicator.traits').toggleClass('active', options.includeTraits);
        html.find('.option-indicator.biography').toggleClass('active', options.includeBiography);
        
        // Mettre à jour le résumé des options
        const activeOptions = [];
        if (options.includeImage) activeOptions.push('Image');
        if (options.includeItems) activeOptions.push('Équipement');
        if (options.includeTraits) activeOptions.push('Traits');
        if (options.includeBiography) activeOptions.push('Biographie');
        
        html.find('.preview-options-summary').text(activeOptions.join(', ') || 'Aucune option');
    }

    /**
     * Exécute l'export
     */
    async executeExport() {
        if (this.isExporting) return;
        
        this.isExporting = true;
        this.updateExportButton(true);
        
        try {
            // Valider les options
            this.validateExportOptions();
            
            // Obtenir le provider approprié
            const provider = this.getProviderForFormat(this.exportOptions.format);
            if (!provider) {
                throw new Error(`Format ${this.exportOptions.format} non supporté`);
            }
            
            // Afficher la notification de début
            this.showNotification('Export en cours...', 'info');
            
            // Exécuter l'export
            const result = await provider.export(this.actor, this.exportOptions);
            
            // Afficher la notification de succès
            this.showNotification(`Export réussi ! Fichier : ${result.fileName}`, 'success');
            
            // Log du résultat
            console.log('✅ Export terminé avec succès:', result);
            
            // Fermer la boîte de dialogue après un délai
            setTimeout(() => {
                this.close();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export:', error);
            this.showNotification(`Erreur lors de l'export : ${error.message}`, 'error');
        } finally {
            this.isExporting = false;
            this.updateExportButton(false);
        }
    }

    /**
     * Valide les options d'export
     */
    validateExportOptions() {
        const options = this.exportOptions;
        
        // Vérifier qu'au moins une option est sélectionnée
        if (!options.includeImage && !options.includeItems && !options.includeTraits && !options.includeBiography) {
            throw new Error('Veuillez sélectionner au moins une option d\'export');
        }
        
        // Vérifier que le format est valide
        const validFormats = ['pdf', 'json', 'html'];
        if (!validFormats.includes(options.format)) {
            throw new Error(`Format invalide : ${options.format}`);
        }
    }

    /**
     * Obtient le provider pour un format donné
     */
    getProviderForFormat(format) {
        for (const [key, provider] of this.providers) {
            if (provider.supportedFormats.includes(format)) {
                return provider;
            }
        }
        return null;
    }

    /**
     * Met à jour l'état du bouton d'export
     */
    updateExportButton(isExporting) {
        const html = this.element;
        const exportBtn = html.find('.export-btn');
        
        if (isExporting) {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="fas fa-spinner fa-spin"></i> Export en cours...');
        } else {
            exportBtn.prop('disabled', false);
            exportBtn.html('<i class="fas fa-download"></i> Exporter');
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
            // Fallback si ui.notifications n'est pas disponible
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Calcule le mouvement disponible
     */
    calculateMovement(actor) {
        const agility = actor.system.stats?.agility || 0;
        const armorType = actor.system.armor?.type || 'tissu';
        
        // Formule de base : Agilité * 1.5 + 1.5
        let baseMovement = (agility * 1.5) + 1.5;
        
        // Malus d'armure selon le type
        let armorPenalty = 0;
        switch (armorType) {
            case 'tissu': armorPenalty = 0; break;
            case 'legere': armorPenalty = 1.5; break;
            case 'lourde': armorPenalty = 3.0; break;
            case 'blindee': armorPenalty = 4.5; break;
        }
        
        const finalMovement = Math.max(0, baseMovement - armorPenalty);
        
        return {
            base: baseMovement,
            armorPenalty: armorPenalty,
            final: finalMovement,
            formula: `(${agility} × 1.5) + 1.5 - ${armorPenalty} = ${finalMovement}m`
        };
    }

    /**
     * Obtient le nom français du type d'armure
     */
    getArmorTypeName(armorType) {
        const names = {
            'tissu': 'Tissu',
            'legere': 'Légère',
            'lourde': 'Lourde',
            'blindee': 'Blindée'
        };
        return names[armorType] || armorType;
    }

    /**
     * Gestion de la fermeture
     */
    async close(options = {}) {
        // Nettoyer les écouteurs d'événements
        if (this.element) {
            this.element.off();
        }
        
        // Appeler la méthode parent
        return super.close(options);
    }
}

// Exposer la classe globalement
window.ExportDialog = ExportDialog;
