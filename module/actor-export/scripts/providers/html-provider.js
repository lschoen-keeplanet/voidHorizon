/**
 * Provider d'export HTML pour voidHorizon
 * Exporte les fiches de personnages en pages web partageables
 */

class HTMLProvider {
    constructor() {
        this.name = 'HTML Provider';
        this.description = 'Export des fiches en pages web partageables';
        this.supportedFormats = ['html'];
    }

    /**
     * Exporte un acteur en format HTML
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} - Résultat de l'export
     */
    async export(actor, options = {}) {
        console.log('🌐 Export HTML pour', actor.name, 'avec options:', options);
        
        try {
            // Valider l'acteur
            if (!this.canExportActor(actor)) {
                throw new Error('Acteur non supporté pour l\'export HTML');
            }

            // Générer le contenu HTML
            const htmlContent = await this.generateHTML(actor, options);
            
            // Générer le nom de fichier
            const fileName = this.generateFileName(actor, 'html');
            
            // Télécharger le fichier
            this.downloadFile(htmlContent, fileName, 'text/html');
            
            return {
                success: true,
                fileName: fileName,
                dataSize: htmlContent.length,
                format: 'html',
                actor: actor.name
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export HTML:', error);
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
     * Génère le contenu HTML complet
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<string>} - Contenu HTML
     */
    async generateHTML(actor, options = {}) {
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fiche ${actor.name} - voidHorizon</title>
    <style>
        ${this.getCSS()}
    </style>
</head>
<body>
    <div class="voidHorizon-sheet">
        ${await this.generateHeader(actor, options)}
        ${await this.generateStats(actor, options)}
        ${options.includeItems ? await this.generateItems(actor) : ''}
        ${options.includeTraits ? await this.generateTraits(actor) : ''}
        ${options.includeBiography ? await this.generateBiography(actor) : ''}
        ${this.generateFooter()}
    </div>
</body>
</html>`;
        
        return html;
    }

    /**
     * Génère l'en-tête de la fiche
     * @param {Actor} actor - L'acteur
     * @param {Object} options - Options d'export
     * @returns {Promise<string>} - HTML de l'en-tête
     */
    async generateHeader(actor, options) {
        const imageHtml = options.includeImage && actor.img ? 
            `<img src="${actor.img}" alt="${actor.name}" class="actor-portrait">` : '';
        
        return `
        <header class="sheet-header">
            <div class="header-main">
                ${imageHtml}
                <div class="header-fields">
                    <h1 class="charname">${actor.name}</h1>
                    <div class="header-details">
                        <div class="header-row">
                            <div class="class-line">
                                <label>Classe:</label>
                                <span>${actor.system.class || 'Non définie'}</span>
                            </div>
                            <div class="faction-line">
                                <label>Faction:</label>
                                <span>${actor.system.faction || 'Non définie'}</span>
                            </div>
                        </div>
                        <div class="header-row">
                            <div class="rank-line">
                                <label>Rang:</label>
                                <span>${actor.system.rank || 'Non défini'}</span>
                            </div>
                            <div class="affinity-line">
                                <label>Affinité:</label>
                                <span>${actor.system.affinity || 'Non définie'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>`;
    }

    /**
     * Génère la section des statistiques
     * @param {Actor} actor - L'acteur
     * @param {Object} options - Options d'export
     * @returns {Promise<string>} - HTML des statistiques
     */
    async generateStats(actor, options) {
        const stats = actor.system.stats || {};
        const health = actor.system.health || {};
        const armor = actor.system.armor || {};
        
        // Calculer le mouvement
        const movement = this.calculateMovement(actor);
        
        return `
        <section class="main-content">
            <div class="stats-health-row">
                <div class="main-stats">
                    ${this.generateStatCard('Agilité', stats.agility || 0, 'agility')}
                    ${this.generateStatCard('Constitution', stats.constitution || 0, 'constitution')}
                    ${this.generateStatCard('Intelligence', stats.intelligence || 0, 'intelligence')}
                    ${this.generateStatCard('Perception', stats.perception || 0, 'perception')}
                    ${this.generateStatCard('Force', stats.strength || 0, 'strength')}
                    ${this.generateStatCard('Volonté', stats.willpower || 0, 'willpower')}
                </div>
                <div class="health-column">
                    <div class="health-status">
                        <div class="status-label">Santé</div>
                        <div class="status-value">${health.current || 0} / ${health.max || 0}</div>
                    </div>
                    <div class="armor-section">
                        <div class="resource">
                            <label>Armure</label>
                            <div class="resource-value">
                                <span>${armor.value || 0}</span>
                                <small>(${this.getArmorTypeName(armor.type || 'tissu')})</small>
                            </div>
                        </div>
                    </div>
                    <div class="movement-display">
                        <div class="movement-label">
                            <i class="fas fa-running"></i> Mouvement disponible
                        </div>
                        <div class="movement-value">${movement.final}m</div>
                        <div class="movement-formula">${movement.formula}</div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Génère une carte de statistique
     * @param {string} name - Nom de la statistique
     * @param {number} value - Valeur de la statistique
     * @param {string} type - Type de statistique
     * @returns {string} - HTML de la carte
     */
    generateStatCard(name, value, type) {
        return `
        <div class="stat">
            <div class="stat-header">
                <label class="rollable">${name}</label>
            </div>
            <div class="stat-controls">
                <span class="stat-value">${value}</span>
            </div>
        </div>`;
    }

    /**
     * Génère la section des objets
     * @param {Actor} actor - L'acteur
     * @returns {Promise<string>} - HTML des objets
     */
    async generateItems(actor) {
        const items = actor.items.filter(item => item.type !== 'trait') || [];
        
        if (items.length === 0) {
            return '<div class="no-items">Aucun objet</div>';
        }

        const itemsHtml = items.map(item => `
            <div class="item">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <span class="item-type">${item.type}</span>
                </div>
                ${item.system.description ? `<p class="item-description">${item.system.description}</p>` : ''}
            </div>`).join('');

        return `
        <section class="inventory-section">
            <h2>Équipement</h2>
            <div class="inventory-list">
                ${itemsHtml}
            </div>
        </section>`;
    }

    /**
     * Génère la section des traits
     * @param {Actor} actor - L'acteur
     * @returns {Promise<string>} - HTML des traits
     */
    async generateTraits(actor) {
        const traits = actor.items.filter(item => item.type === 'trait') || [];
        
        if (traits.length === 0) {
            return '<div class="no-traits">Aucun trait</div>';
        }

        const traitsHtml = traits.map(trait => `
            <div class="trait">
                <div class="trait-header">
                    <h4>${trait.name}</h4>
                    <span class="trait-bonus">+${trait.system.bonus || 0}</span>
                </div>
                ${trait.system.description ? `<p class="trait-description">${trait.system.description}</p>` : ''}
            </div>`).join('');

        return `
        <section class="traits-section">
            <h2>Traits et Compétences</h2>
            <div class="traits-list">
                ${traitsHtml}
            </div>
        </section>`;
    }

    /**
     * Génère la section biographie
     * @param {Actor} actor - L'acteur
     * @returns {Promise<string>} - HTML de la biographie
     */
    async generateBiography(actor) {
        const biography = actor.system.biography || 'Aucune biographie disponible.';
        
        return `
        <section class="biography-section">
            <h2>Biographie</h2>
            <div class="biography-content">
                <p>${biography}</p>
            </div>
        </section>`;
    }

    /**
     * Génère le pied de page
     * @returns {string} - HTML du pied de page
     */
    generateFooter() {
        return `
        <footer class="sheet-footer">
            <p>Fiche générée par voidHorizon Actor Export - ${new Date().toLocaleDateString('fr-FR')}</p>
        </footer>`;
    }

    /**
     * Calcule le mouvement disponible
     * @param {Actor} actor - L'acteur
     * @returns {Object} - Données de mouvement
     */
    calculateMovement(actor) {
        const agility = actor.system.stats.agility || 0;
        const armorType = actor.system.armor.type || 'tissu';
        
        let baseMovement = (agility * 1.5) + 1.5;
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
     * @param {string} armorType - Type d'armure
     * @returns {string} - Nom français
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
     * Retourne le CSS pour la fiche
     * @returns {string} - CSS
     */
    getCSS() {
        return `
        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .voidHorizon-sheet {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .sheet-header {
            background: linear-gradient(135deg, #800000, #600000);
            color: white;
            padding: 20px;
        }
        
        .header-main {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }
        
        .actor-portrait {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            border: 3px solid rgba(255,255,255,0.3);
        }
        
        .charname {
            font-size: 2.5em;
            margin: 0 0 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .header-row {
            display: flex;
            gap: 20px;
        }
        
        .header-row label {
            font-weight: bold;
            min-width: 80px;
        }
        
        .main-content {
            padding: 20px;
        }
        
        .stats-health-row {
            display: flex;
            gap: 30px;
        }
        
        .main-stats {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        
        .stat {
            background: #f8f9fa;
            border: 2px solid #800000;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .stat-header label {
            font-weight: bold;
            color: #800000;
            font-size: 1.1em;
            margin-bottom: 10px;
            display: block;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #800000;
        }
        
        .health-column {
            flex: 0 0 250px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .health-status, .armor-section, .movement-display {
            background: #f8f9fa;
            border: 2px solid #800000;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .status-label, .movement-label {
            font-weight: bold;
            color: #800000;
            margin-bottom: 10px;
        }
        
        .status-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #800000;
        }
        
        .movement-value {
            font-size: 2em;
            font-weight: bold;
            color: #f39c12;
        }
        
        .movement-formula {
            font-size: 0.9em;
            color: #666;
            font-style: italic;
        }
        
        section {
            margin: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        section h2 {
            color: #800000;
            margin: 0 0 20px 0;
            border-bottom: 2px solid #800000;
            padding-bottom: 10px;
        }
        
        .item, .trait {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .item-header, .trait-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .item-header h3, .trait-header h4 {
            margin: 0;
            color: #800000;
        }
        
        .item-type, .trait-bonus {
            background: #800000;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .sheet-footer {
            background: #f8f9fa;
            text-align: center;
            padding: 15px;
            color: #666;
            border-top: 1px solid #ddd;
        }
        
        .no-items, .no-traits {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }`;
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
window.HTMLProvider = HTMLProvider;
