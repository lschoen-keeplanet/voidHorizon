/**
 * Provider d'export JSON pour voidHorizon
 * Exporte les données brutes des acteurs en format JSON
 */

class JSONProvider {
    constructor() {
        this.name = 'JSON Provider';
        this.description = 'Export des données brutes en format JSON';
        this.supportedFormats = ['json'];
    }

    /**
     * Exporte un acteur en format JSON
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} - Résultat de l'export
     */
    async export(actor, options = {}) {
        console.log('📊 Export JSON pour', actor.name, 'avec options:', options);
        
        try {
            // Valider l'acteur
            if (!this.canExportActor(actor)) {
                throw new Error('Acteur non supporté pour l\'export JSON');
            }

            // Préparer les données d'export
            const exportData = await this.prepareExportData(actor, options);
            
            // Convertir en JSON
            const jsonContent = JSON.stringify(exportData, null, 2);
            
            // Générer le nom de fichier
            const fileName = this.generateFileName(actor, 'json');
            
            // Télécharger le fichier
            this.downloadFile(jsonContent, fileName, 'application/json');
            
            return {
                success: true,
                fileName: fileName,
                dataSize: jsonContent.length,
                format: 'json',
                actor: actor.name
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export JSON:', error);
            throw error;
        }
    }

    /**
     * Vérifie si l'acteur peut être exporté
     * @param {Actor} actor - L'acteur à vérifier
     * @returns {boolean} - True si l'acteur peut être exporté
     */
    canExportActor(actor) {
        return actor && (actor.type === 'heros' || actor.type === 'npc');
    }

    /**
     * Prépare les données d'export selon les options
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} - Données préparées
     */
    async prepareExportData(actor, options) {
        const exportData = {
            metadata: {
                system: 'voidHorizon',
                exportDate: new Date().toISOString(),
                exportVersion: '1.0.0',
                actorType: actor.type,
                actorName: actor.name
            },
            actor: {
                id: actor.id,
                name: actor.name,
                type: actor.type,
                img: options.includeImage ? actor.img : null,
                system: actor.system
            }
        };

        // Inclure les objets selon les options
        if (options.includeItems) {
            exportData.items = await this.getActorItems(actor);
        }

        // Inclure les traits selon les options
        if (options.includeTraits) {
            exportData.traits = await this.getActorTraits(actor);
        }

        // Inclure la biographie selon les options
        if (options.includeBiography) {
            exportData.biography = actor.system.biography || '';
        }

        // Données spécifiques au type d'acteur
        if (actor.type === 'heros') {
            exportData.heroData = await this.getHeroData(actor);
        } else if (actor.type === 'npc') {
            exportData.npcData = await this.getNpcData(actor);
        }

        return exportData;
    }

    /**
     * Récupère les objets de l'acteur
     * @param {Actor} actor - L'acteur
     * @returns {Promise<Array>} - Liste des objets
     */
    async getActorItems(actor) {
        const items = actor.items || [];
        return items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            img: item.img,
            system: item.system
        }));
    }

    /**
     * Récupère les traits de l'acteur
     * @param {Actor} actor - L'acteur
     * @returns {Promise<Array>} - Liste des traits
     */
    async getActorTraits(actor) {
        const traits = actor.items.filter(item => item.type === 'trait') || [];
        return traits.map(trait => ({
            id: trait.id,
            name: trait.name,
            description: trait.system.description || '',
            bonus: trait.system.bonus || 0
        }));
    }

    /**
     * Récupère les données spécifiques aux héros
     * @param {Actor} actor - L'acteur héros
     * @returns {Promise<Object>} - Données du héros
     */
    async getHeroData(actor) {
        return {
            class: actor.system.class || '',
            faction: actor.system.faction || '',
            rank: actor.system.rank || '',
            affinity: actor.system.affinity || '',
            stats: {
                agility: actor.system.stats.agility || 0,
                constitution: actor.system.stats.constitution || 0,
                intelligence: actor.system.stats.intelligence || 0,
                perception: actor.system.stats.perception || 0,
                strength: actor.system.stats.strength || 0,
                willpower: actor.system.stats.willpower || 0
            },
            health: {
                current: actor.system.health.current || 0,
                max: actor.system.health.max || 0
            },
            armor: {
                type: actor.system.armor.type || 'tissu',
                value: actor.system.armor.value || 0
            },
            movement: this.calculateMovement(actor)
        };
    }

    /**
     * Récupère les données spécifiques aux NPCs
     * @param {Actor} actor - L'acteur NPC
     * @returns {Promise<Object>} - Données du NPC
     */
    async getNpcData(actor) {
        return {
            role: actor.system.role || '',
            difficulty: actor.system.difficulty || 'normal',
            stats: {
                agility: actor.system.stats.agility || 0,
                constitution: actor.system.stats.constitution || 0,
                intelligence: actor.system.stats.intelligence || 0,
                perception: actor.system.stats.perception || 0,
                strength: actor.system.stats.strength || 0,
                willpower: actor.system.stats.willpower || 0
            },
            health: {
                current: actor.system.health.current || 0,
                max: actor.system.health.max || 0
            }
        };
    }

    /**
     * Calcule le mouvement disponible
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Données de mouvement
     */
    calculateMovement(actor) {
        const agility = actor.system.stats.agility || 0;
        const armorType = actor.system.armor.type || 'tissu';
        
        // Formule de base : Agilité * 1.5 + 1.5
        let baseMovement = (agility * 1.5) + 1.5;
        
        // Malus d'armure
        let armorPenalty = 0;
        switch (armorType) {
            case 'tissu':
                armorPenalty = 0;
                break;
            case 'legere':
                armorPenalty = 1.5;
                break;
            case 'lourde':
                armorPenalty = 3.0;
                break;
            case 'blindee':
                armorPenalty = 4.5;
                break;
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
     * Génère le nom de fichier
     * @param {Actor} actor - L'acteur
     * @param {string} format - Le format d'export
     * @returns {string} - Nom de fichier
     */
    generateFileName(actor, format) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const actorName = actor.name.replace(/[^a-zA-Z0-9]/g, '_');
        return `voidHorizon_${actorName}_${timestamp}.${format}`;
    }

    /**
     * Télécharge le fichier
     * @param {string} content - Contenu du fichier
     * @param {string} fileName - Nom du fichier
     * @param {string} mimeType - Type MIME
     */
    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

// Exposer la classe globalement
window.JSONProvider = JSONProvider;
