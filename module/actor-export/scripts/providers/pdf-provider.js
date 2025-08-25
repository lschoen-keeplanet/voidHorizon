/**
 * Provider d'export PDF pour voidHorizon
 * Exporte les fiches de personnages en documents PDF imprimables
 * Note: Ce provider utilise jsPDF pour la génération de PDF
 */

class PDFProvider {
    constructor() {
        this.name = 'PDF Provider';
        this.description = 'Export des fiches en documents PDF imprimables';
        this.supportedFormats = ['pdf'];
        this.jsPDF = null;
    }

    /**
     * Exporte un acteur en format PDF
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<Object>} - Résultat de l'export
     */
    async export(actor, options = {}) {
        console.log('📄 Export PDF pour', actor.name, 'avec options:', options);
        
        try {
            // Valider l'acteur
            if (!this.canExportActor(actor)) {
                throw new Error('Acteur non supporté pour l\'export PDF');
            }

            // Vérifier que jsPDF est disponible
            if (typeof jsPDF === 'undefined') {
                throw new Error('jsPDF n\'est pas disponible. Veuillez installer la bibliothèque jsPDF.');
            }

            // Créer le document PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Générer le contenu PDF
            await this.generatePDF(pdf, actor, options);
            
            // Générer le nom de fichier
            const fileName = this.generateFileName(actor, 'pdf');
            
            // Télécharger le fichier
            pdf.save(fileName);
            
            return {
                success: true,
                fileName: fileName,
                format: 'pdf',
                actor: actor.name
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'export PDF:', error);
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
     * Génère le contenu PDF
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur à exporter
     * @param {Object} options - Options d'export
     * @returns {Promise<void>}
     */
    async generatePDF(pdf, actor, options) {
        let yPosition = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        // En-tête
        yPosition = this.addHeader(pdf, actor, yPosition, margin, contentWidth);
        
        // Informations de base
        yPosition = this.addBasicInfo(pdf, actor, yPosition, margin, contentWidth);
        
        // Statistiques
        yPosition = this.addStats(pdf, actor, yPosition, margin, contentWidth);
        
        // Santé et armure
        yPosition = this.addHealthAndArmor(pdf, actor, yPosition, margin, contentWidth);
        
        // Mouvement
        yPosition = this.addMovement(pdf, actor, yPosition, margin, contentWidth);
        
        // Nouvelle page si nécessaire
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Objets (si demandé)
        if (options.includeItems) {
            yPosition = this.addItems(pdf, actor, yPosition, margin, contentWidth);
        }
        
        // Traits (si demandé)
        if (options.includeTraits) {
            yPosition = this.addTraits(pdf, actor, yPosition, margin, contentWidth);
        }
        
        // Biographie (si demandée)
        if (options.includeBiography) {
            yPosition = this.addBiography(pdf, actor, yPosition, margin, contentWidth);
        }
        
        // Pied de page
        this.addFooter(pdf, pageWidth);
    }

    /**
     * Ajoute l'en-tête du PDF
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addHeader(pdf, actor, y, margin, width) {
        // Titre principal
        pdf.setFontSize(24);
        pdf.setTextColor(128, 0, 0); // Couleur voidHorizon
        pdf.setFont('helvetica', 'bold');
        pdf.text(actor.name, margin, y);
        
        // Sous-titre
        y += 15;
        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'normal');
        
        const typeText = actor.type === 'heros' ? 'Héros' : 'PNJ';
        const classText = actor.system.class ? ` - ${actor.system.class}` : '';
        const factionText = actor.system.faction ? ` (${actor.system.faction})` : '';
        
        pdf.text(`${typeText}${classText}${factionText}`, margin, y);
        
        // Ligne de séparation
        y += 10;
        pdf.setDrawColor(128, 0, 0);
        pdf.line(margin, y, margin + width, y);
        
        return y + 15;
    }

    /**
     * Ajoute les informations de base
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addBasicInfo(pdf, actor, y, margin, width) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        
        const infoWidth = width / 2;
        let currentY = y;
        
        // Colonne gauche
        if (actor.system.rank) {
            pdf.text(`Rang: ${actor.system.rank}`, margin, currentY);
            currentY += 8;
        }
        
        if (actor.system.affinity) {
            pdf.text(`Affinité: ${actor.system.affinity}`, margin, currentY);
            currentY += 8;
        }
        
        // Colonne droite
        currentY = y;
        if (actor.system.role) {
            pdf.text(`Rôle: ${actor.system.role}`, margin + infoWidth, currentY);
            currentY += 8;
        }
        
        if (actor.system.difficulty) {
            pdf.text(`Difficulté: ${actor.system.difficulty}`, margin + infoWidth, currentY);
            currentY += 8;
        }
        
        return Math.max(y + 20, currentY + 10);
    }

    /**
     * Ajoute les statistiques
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addStats(pdf, actor, y, margin, width) {
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Statistiques', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        const stats = actor.system.stats || {};
        const statNames = {
            agility: 'Agilité',
            constitution: 'Constitution',
            intelligence: 'Intelligence',
            perception: 'Perception',
            strength: 'Force',
            willpower: 'Volonté'
        };
        
        const statWidth = width / 3;
        let currentY = y;
        let col = 0;
        
        for (const [key, name] of Object.entries(statNames)) {
            const value = stats[key] || 0;
            const x = margin + (col * statWidth);
            
            pdf.text(`${name}: ${value}`, x, currentY);
            
            col++;
            if (col >= 3) {
                col = 0;
                currentY += 8;
            }
        }
        
        return currentY + 15;
    }

    /**
     * Ajoute la santé et l'armure
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addHealthAndArmor(pdf, actor, y, margin, width) {
        const health = actor.system.health || {};
        const armor = actor.system.armor || {};
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Santé et Protection', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        const infoWidth = width / 2;
        
        // Santé
        pdf.text(`Santé: ${health.current || 0} / ${health.max || 0}`, margin, y);
        
        // Armure
        const armorType = this.getArmorTypeName(armor.type || 'tissu');
        pdf.text(`Armure: ${armor.value || 0} (${armorType})`, margin + infoWidth, y);
        
        return y + 20;
    }

    /**
     * Ajoute le mouvement
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addMovement(pdf, actor, y, margin, width) {
        const movement = this.calculateMovement(actor);
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Mouvement', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        pdf.text(`Mouvement disponible: ${movement.final}m`, margin, y);
        y += 8;
        pdf.text(`Formule: ${movement.formula}`, margin, y);
        
        return y + 20;
    }

    /**
     * Ajoute les objets
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addItems(pdf, actor, y, margin, width) {
        const items = actor.items.filter(item => item.type !== 'trait') || [];
        
        if (items.length === 0) {
            pdf.text('Aucun objet', margin, y);
            return y + 15;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Équipement', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        for (const item of items) {
            pdf.text(`• ${item.name} (${item.type})`, margin, y);
            y += 8;
            
            if (item.system.description) {
                const description = this.truncateText(item.system.description, width - 20);
                pdf.text(`  ${description}`, margin + 10, y);
                y += 8;
            }
            
            y += 5;
        }
        
        return y + 10;
    }

    /**
     * Ajoute les traits
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addTraits(pdf, actor, y, margin, width) {
        const traits = actor.items.filter(item => item.type === 'trait') || [];
        
        if (traits.length === 0) {
            pdf.text('Aucun trait', margin, y);
            return y + 15;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Traits et Compétences', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        for (const trait of traits) {
            const bonus = trait.system.bonus || 0;
            pdf.text(`• ${trait.name} (+${bonus})`, margin, y);
            y += 8;
            
            if (trait.system.description) {
                const description = this.truncateText(trait.system.description, width - 20);
                pdf.text(`  ${description}`, margin + 10, y);
                y += 8;
            }
            
            y += 5;
        }
        
        return y + 10;
    }

    /**
     * Ajoute la biographie
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {Actor} actor - L'acteur
     * @param {number} y - Position Y
     * @param {number} margin - Marge
     * @param {number} width - Largeur du contenu
     * @returns {number} - Nouvelle position Y
     */
    addBiography(pdf, actor, y, margin, width) {
        const biography = actor.system.biography || 'Aucune biographie disponible.';
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Biographie', margin, y);
        
        y += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        const lines = this.wrapText(biography, width - 20);
        for (const line of lines) {
            pdf.text(line, margin, y);
            y += 8;
        }
        
        return y + 15;
    }

    /**
     * Ajoute le pied de page
     * @param {jsPDF} pdf - Instance jsPDF
     * @param {number} pageWidth - Largeur de la page
     */
    addFooter(pdf, pageWidth) {
        const footerText = `Généré par voidHorizon Actor Export - ${new Date().toLocaleDateString('fr-FR')}`;
        
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'italic');
        pdf.text(footerText, pageWidth / 2, 280, { align: 'center' });
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
     * Tronque un texte à une largeur donnée
     * @param {string} text - Texte à tronquer
     * @param {number} maxWidth - Largeur maximale
     * @returns {string} - Texte tronqué
     */
    truncateText(text, maxWidth) {
        if (text.length <= maxWidth / 3) return text;
        return text.substring(0, Math.floor(maxWidth / 3)) + '...';
    }

    /**
     * Enveloppe un texte sur plusieurs lignes
     * @param {string} text - Texte à envelopper
     * @param {number} maxWidth - Largeur maximale
     * @returns {Array<string>} - Lignes de texte
     */
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (testLine.length * 3 <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        
        if (currentLine) lines.push(currentLine);
        return lines;
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
}

// Exposer la classe globalement
window.PDFProvider = PDFProvider;
