class HeroSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["voidHorizon", "sheet", "actor", "heros"],
            template: "systems/voidHorizon/templates/sheets/heros-sheet.html",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @override */
    async getData() {
        const data = await super.getData();
        console.log('Actor data:', this.actor);
        console.log('System data:', this.actor.system);
        data.dtypes = ["String", "Number", "Boolean"];

        // Préparation des données pour le template
        this._prepareItems(data);
        
        // S'assurer que la structure des ressources existe
        if (!data.actor.system.resources) {
            data.actor.system.resources = {};
        }
        if (!data.actor.system.resources.blessure) {
            data.actor.system.resources.blessure = { value: 0 };
        }
        if (!data.actor.system.resources.armor) {
            data.actor.system.resources.armor = { value: 0 };
        }
        if (!data.actor.system.resources.armorDamage) {
            data.actor.system.resources.armorDamage = { value: 0 };
        }
        
        // S'assurer que le mana existe et est initialisé avec la valeur maximale
        if (!data.actor.system.mana) {
            data.actor.system.mana = { value: 0, max: 0 };
        }
        // Initialiser le mana avec la valeur maximale basée sur l'Arcane si c'est la première fois
        if (data.actor.system.mana.value === 0 && data.actor.system.mana.max === 0) {
            const arcaneValue = data.actor.system.arcane?.value || "1d4";
            const manaPerLevel = {
                "1d4": 2,   // Insensible
                "2d4": 4,   // Eveillé
                "3d4": 6,   // Novice
                "4d4": 8,   // Initié
                "5d4": 10,  // Maître
                "6d4": 12   // Archimage
            };
            const maxMana = manaPerLevel[arcaneValue] || 2;
            data.actor.system.mana.value = maxMana;
            data.actor.system.mana.max = maxMana;
        }
        
        // Préparation des statistiques principales
        data.system = {
            ...data.system,
            acuite: {
                value: data.actor.system.acuite?.value || "1d4",
                label: "acuité"
            },
            pimpance: {
                value: data.actor.system.pimpance?.value || "1d4",
                label: "Pimpance"
            },
            martialite: {
                value: data.actor.system.martialite?.value || "1d4",
                label: "Martialité"
            },
            arcane: {
                value: data.actor.system.arcane?.value || "1d4",
                label: "Arcane"
            },
            constitution: {
                value: data.actor.system.constitution?.value || 4,
                label: "Constitution"
            },
            class: {
                value: data.actor.system.class?.value || "",
                label: "Classe"
            },
            faction: {
                value: data.actor.system.faction?.value || "caradoc",
                label: "Faction"
            },
            rank: {
                value: data.actor.system.rank?.value || "",
                label: "Rang"
            },
            affinity: {
                value: data.actor.system.affinity?.value || "aucune",
                label: "Affinité"
            }
        };
        
        // S'assurer que les données sont aussi disponibles directement dans data.actor.system
        if (!data.actor.system.acuite) data.actor.system.acuite = { value: "1d4" };
        if (!data.actor.system.pimpance) data.actor.system.pimpance = { value: "1d4" };
        if (!data.actor.system.martialite) data.actor.system.martialite = { value: "1d4" };
        if (!data.actor.system.arcane) data.actor.system.arcane = { value: "1d4" };
        if (!data.actor.system.constitution) data.actor.system.constitution = { value: 4 };
        if (!data.actor.system.class) data.actor.system.class = { value: "" };
        if (!data.actor.system.faction) data.actor.system.faction = { value: "caradoc" };
        if (!data.actor.system.rank) data.actor.system.rank = { value: "" };
        if (!data.actor.system.affinity) data.actor.system.affinity = { value: "aucune" };
        
        // Initialiser les données d'armes si elles n'existent pas
        if (!data.actor.system.weapons) {
            data.actor.system.weapons = {
                primary: { name: "", type: "strength", rank: "0", bonus: 0, description: "" },
                secondary: { name: "", type: "strength", rank: "0", bonus: 0, description: "" }
            };
        }
        if (!data.actor.system.weapons.primary) {
            data.actor.system.weapons.primary = { name: "", type: "strength", rank: "0", bonus: 0, description: "" };
        }
        if (!data.actor.system.weapons.secondary) {
            data.actor.system.weapons.secondary = { name: "", type: "strength", rank: "0", bonus: 0, description: "" };
        }
        
        // Initialiser les données d'armure si elles n'existent pas
        if (!data.actor.system.armor) {
            data.actor.system.armor = { name: "", bonus: 0, description: "" };
        }
        
        // Ajouter les helpers pour le template
        data.helpers = {
            getSelectedText: (value, type) => {
                console.log(`Helper getSelectedText appelé avec value: ${value}, type: ${type}`);
                const mappings = {
                    martialite: {
                        "1d4": "Incompétent",
                        "2d4": "Combatif",
                        "3d4": "Soldat",
                        "4d4": "Expérimenté",
                        "5d4": "Vétéran",
                        "6d4": "Légende"
                    },
                    pimpance: {
                        "1d4": "Tâche",
                        "2d4": "Pas top",
                        "3d4": "Honnête",
                        "4d4": "Beau",
                        "5d4": "Splendide",
                        "6d4": "Ramirez"
                    },
                    acuite: {
                        "1d4": "Aveugle",
                        "2d4": "Distrait",
                        "3d4": "Alerte",
                        "4d4": "Vif",
                        "5d4": "Clairvoyant",
                        "6d4": "Fulgurant"
                    },
                    arcane: {
                        "1d4": "Insensible",
                        "2d4": "Eveillé",
                        "3d4": "Novice",
                        "4d4": "Initié",
                        "5d4": "Maître",
                        "6d4": "Archimage"
                    }
                };
                const result = mappings[type]?.[value] || value;
                console.log(`Helper getSelectedText retourne: ${result}`);
                return result;
            },
            // Helper pour obtenir la formule de dé en mode unsafe
            getUnsafeFormula: (safeValue) => {
                const safeToUnsafe = {
                    "1d4": "1d4",   // Degré 1
                    "2d4": "1d8",   // Degré 2
                    "3d4": "1d12",  // Degré 3
                    "4d4": "1d16",  // Degré 4
                    "5d4": "1d20",  // Degré 5
                    "6d4": "1d24"   // Degré 6
                };
                return safeToUnsafe[safeValue] || safeValue;
            }
        };
        
        data.isReadOnly = true; // Ajout d'un flag pour indiquer que nous sommes en mode lecture
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Gestion du mode édition/lecture
        html.find('.toggle-edit-mode').click(this._onToggleEditMode.bind(this));

        // Gestion des événements pour les items
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
        html.find('.create-item').click(this._onCreateItem.bind(this));

        // Gestion des changements de valeurs (sans sauvegarde automatique)
        html.find('select[name^="system."]').change(this._onSelectChange.bind(this));
        html.find('input[type="text"]').change(this._onTextChange.bind(this));
        html.find('input[type="number"]').change(this._onResourceChange.bind(this));

        // Gestion des lancers de dés
        html.find('.rollable').click(this._onRollStat.bind(this));
        
        // Gestion des boutons de lancement de dés
        html.find('.roll-dice-btn').click(this._onRollDice.bind(this));
        
        // Gestion des boutons de lancement d'armes
        html.find('.roll-weapon-btn').click(this._onRollWeapon.bind(this));

        // Gestion des cœurs de vie
        html.find('.heart-button').click(this._onHeartClick.bind(this));

        // Gestion des boucliers d'armure
        html.find('.armor-container .shield-button').click(this._onShieldClick.bind(this));

        // Gestion des points de mana
        html.find('.mana-button').click(this._onManaClick.bind(this));

        // Gestion des changements de rang
        html.find('input[name="system.rank.value"]').change(this._onRankChange.bind(this));
        
        // Gestion des changements d'affinité
        html.find('select[name="system.affinity.value"]').change(this._onSelectChange.bind(this));
        
                 // Gestion des changements de type d'équipement (pour les boucliers)
         html.find('select[name^="system.weapons."][name$=".type"]').change(this._onWeaponTypeChange.bind(this));
         
         // Gestion des changements d'armes et d'armure (sans sauvegarde automatique)
         html.find('input[name^="system.weapons."], select[name^="system.weapons."], textarea[name^="system.weapons."], input[name^="system.armor."], textarea[name^="system.armor."]').change(this._onWeaponFieldChange.bind(this));
         
         // Gestion du mode édition/lecture des armes
         html.find('.toggle-weapons-edit-mode').click(this._onToggleWeaponsEditMode.bind(this));
        
        // Gestion des onglets Équipement/Traits
        const tabButtons = html.find('.tab-button');
        console.log(`Trouvé ${tabButtons.length} boutons d'onglets`);
        tabButtons.click(this._onTabButtonClick.bind(this));
        
        // Gestion des traits
        html.find('#create-trait-btn').click(this._onCreateTraitClick.bind(this));
        html.find('#trait-save-btn').click(this._onSaveTraitClick.bind(this));
        html.find('#trait-cancel-btn').click(this._onCancelTraitClick.bind(this));
        html.find('.trait-edit').click(this._onEditTraitClick.bind(this));
        html.find('.trait-delete').click(this._onDeleteTraitClick.bind(this));
        
        // Initialiser l'état des cœurs et de la santé
        this._initializeHealthState();
        
        // Appliquer les bonus des traits
        this._applyTraitBonuses();
        
        // Recalculer les bonus des traits avant chaque jet de dé
        this._recalculateTraitBonuses();
    }

    /**
     * Initialise l'état des cœurs en fonction de la valeur de blessure
     * @param {jQuery} html - Le contenu HTML de la fiche
     * @private
     */
    _initializeHearts(html) {
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const hearts = html.find('.heart-wrapper');
        
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
            } else {
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
            }
        });
    }

    /**
     * Initialise l'état des boucliers d'armure
     * @param {jQuery} html - Le contenu HTML de la fiche
     * @private
     */
    _initializeShields(html) {
        const armorDamage = this.actor.system.resources.armorDamage?.value || 0;
        const shields = html.find('.armor-container .shield-wrapper');
        
        console.log(`Initialisation des boucliers: ${shields.length} trouvés, dégâts: ${armorDamage}`);
        
        shields.each((index, wrapper) => {
            const shieldIndex = index;
            const activeButton = wrapper.querySelector('.active');
            const brokenButton = wrapper.querySelector('.broken');
            
            // Vérification de sécurité
            if (!activeButton || !brokenButton) {
                console.error("Boutons d'armure non trouvés lors de l'initialisation:", { activeButton, brokenButton });
                return;
            }
            
            if (shieldIndex < armorDamage) {
                activeButton.classList.add('hidden');
                brokenButton.classList.remove('hidden');
                console.log(`Bouclier ${shieldIndex} marqué comme cassé`);
            } else {
                activeButton.classList.remove('hidden');
                brokenButton.classList.add('hidden');
                console.log(`Bouclier ${shieldIndex} marqué comme actif`);
            }
        });
    }

    /**
     * Prépare les items pour l'affichage
     * @param {Object} data - Les données de l'acteur
     * @private
     */
    _prepareItems(data) {
        // Trier les items par type
        const items = {
            outil: [],
            A: []
        };

        // Trier chaque item dans son type
        for (let i of data.items) {
            if (items.hasOwnProperty(i.type)) {
                items[i.type].push(i);
            }
        }

        // Ajouter les items triés aux données
        data.items = items;
    }

    /**
     * Gère la création d'un nouvel item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onCreateItem(event) {
        event.preventDefault();
        
        const itemData = {
            name: "Nouvel Item",
            type: "equipment",
            system: {
                description: ""
            }
        };

        try {
            await Item.create(itemData, { parent: this.actor });
        } catch (error) {
            console.error("Erreur lors de la création de l'item:", error);
        }
    }

    /**
     * Gère l'édition d'un item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onItemEdit(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        
        if (item) {
            const template = `
                <form>
                    <div class="form-group">
                        <label>Nom</label>
                        <input type="text" name="name" value="${item.name}"/>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="system.description">${item.system.description || ""}</textarea>
                    </div>
                </form>
            `;

            new Dialog({
                title: "Modifier l'item",
                content: template,
                buttons: {
                    save: {
                        icon: '<i class="fas fa-save"></i>',
                        label: "Sauvegarder",
                        callback: async (html) => {
                            const formData = new FormData(html.find('form')[0]);
                            const updateData = {
                                name: formData.get('name'),
                                'system.description': formData.get('system.description')
                            };
                            await item.update(updateData);
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Annuler"
                    }
                },
                default: "save"
            }).render(true);
        }
    }

    /**
     * Gère la suppression d'un item
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onItemDelete(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        
        if (item) {
            new Dialog({
                title: "Supprimer l'item",
                content: `<p>Êtes-vous sûr de vouloir supprimer "${item.name}" ?</p>`,
                buttons: {
                    delete: {
                        icon: '<i class="fas fa-trash"></i>',
                        label: "Supprimer",
                        callback: async () => {
                            await item.delete();
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Annuler"
                    }
                },
                default: "cancel"
            }).render(true);
        }
    }

    /**
     * Gère les changements de valeurs numériques
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onResourceChange(event) {
        event.preventDefault();
        const target = event.target;
        
        // Ignorer les champs marqués comme ne devant pas être sauvegardés automatiquement
        if (target.hasAttribute('data-no-save')) {
            console.log(`Champ numérique ${target.name} ignoré (data-no-save)`);
            return;
        }
        
        const value = parseInt(target.value);
        const name = target.name;

        console.log("=== Debug Resource Change ===");
        console.log("Name:", name);
        console.log("Value:", value);
        console.log("Current actor data:", this.actor.system);

        // Si c'est un champ d'armure de base, de constitution, ou d'armure d'équipement, utiliser le système de sauvegarde différée
        if (name === "system.resources.armor.value" || name === "system.constitution.value" || name === "system.armor.bonus") {
            // Stocker le changement en mémoire sans sauvegarder
            if (!this._pendingWeaponChanges) {
                this._pendingWeaponChanges = {};
            }
            this._pendingWeaponChanges[name] = value;
            
            console.log(`Changement en attente pour ${name}: ${value}`);
            
            if (name === "system.resources.armor.value") {
                // Mettre à jour l'affichage local sans sauvegarder
                this._updateLocalArmorDisplay(value);
                
                // Mettre à jour l'affichage des boucliers
                this._updateShieldsDisplay();
            } else if (name === "system.constitution.value") {
                // Mettre à jour l'affichage local sans sauvegarder
                this._updateLocalConstitutionDisplay(value);
                
                // Mettre à jour l'affichage des cœurs
                this._updateHeartsDisplay();
                
                // Mettre à jour l'état de santé
                this._updateHealthStatus();
            } else if (name === "system.armor.bonus") {
                // Mettre à jour l'affichage local sans sauvegarder
                this._updateLocalWeaponDisplay(name, value);
                
                // Mettre à jour l'affichage des boucliers
                this._updateShieldsDisplay();
            }
            return;
        }

        // Pour les autres champs numériques, pas de traitement automatique
        console.log(`Champ numérique non géré: ${name}`);
        console.log("=== Fin Debug Resource Change ===");
    }

    _updateHeartsDisplay() {
        const totalConstitution = this._getTotalConstitution();
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const hearts = this.element.find('.heart-wrapper');
        
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
            } else {
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
            }
        });
    }

    /**
     * Met à jour l'affichage des boucliers en fonction de la valeur d'armure
     * @private
     */
    _updateShieldsDisplay() {
        console.log("=== Debug Shields Display ===");
        
        // Appliquer les bonus des boucliers avant de calculer l'armure totale
        this._applyShieldBonuses();
        
        const totalArmor = this._getTotalArmor();
        const armorDamage = parseInt(this.actor.system.resources.armorDamage?.value) || 0;
        
        console.log("Valeur d'armure totale (base + bonus):", totalArmor);
        console.log("Dégâts d'armure:", armorDamage);
        
        // Au lieu de recréer les boucliers, on force le re-render du template
        // car les boucliers sont générés par Handlebars
        console.log("Forcer le re-render pour mettre à jour les boucliers");
        this.render(true);
        
        // Après le re-render, reattacher les événements
        setTimeout(() => {
            this._reattachShieldEvents();
        }, 100);
        
        console.log("=== Fin Debug Shields Display ===");
    }

    /**
     * Gère les changements de texte
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onTextChange(event) {
        event.preventDefault();
        const input = event.target;
        
        // Ignorer les champs marqués comme ne devant pas être sauvegardés automatiquement
        if (input.hasAttribute('data-no-save')) {
            console.log(`Champ texte ${input.name} ignoré (data-no-save)`);
            return;
        }
        
        const field = input.name;
        
        // Si c'est un champ d'arme, utiliser le système de sauvegarde différée
        if (field.includes('system.weapons.')) {
            // Stocker le changement en mémoire sans sauvegarder
            if (!this._pendingWeaponChanges) {
                this._pendingWeaponChanges = {};
            }
            this._pendingWeaponChanges[field] = input.value;
            
            console.log(`Changement d'arme en attente pour ${field}: ${input.value}`);
            
            // Mettre à jour l'affichage local sans sauvegarder
            this._updateLocalWeaponDisplay(field, input.value);
            return;
        }
        
        // Pour les autres champs texte, sauvegarder immédiatement
        const updateData = {};
        updateData[field] = input.value;
        
        try {
            await this.actor.update(updateData);
            console.log(`Mise à jour réussie pour ${field}: ${input.value}`);
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Restaurer la valeur précédente en cas d'erreur
            if (field.includes('system.')) {
                const fieldParts = field.split('.');
                if (fieldParts.length >= 3) {
                    input.value = this.actor.system[fieldParts[1]]?.[fieldParts[2]]?.value || '';
                }
            }
        }
    }

    /**
     * Gère les changements de sélection (classe, affinité, caractéristiques)
     * @param {Event} event - L'événement de changement
     * @private
     */
    async _onSelectChange(event) {
        event.preventDefault();
        const select = event.target;
        
        // Ignorer les champs marqués comme ne devant pas être sauvegardés automatiquement
        if (select.hasAttribute('data-no-save')) {
            console.log(`Champ ${select.name} ignoré (data-no-save)`);
            return;
        }
        
        const field = select.name;
        const value = select.value;
        
        // Si c'est un changement de faction, sauvegarder immédiatement
        if (field === "system.faction.value") {
            try {
                await this.actor.update({ [field]: value });
                console.log(`Faction sauvegardée immédiatement: ${value}`);
                
                // Mettre à jour l'affichage du blason de faction
                this._updateFactionCrest(value);
                
                // Notification de succès
                ui.notifications.info("Faction mise à jour avec succès");
                
            } catch (error) {
                console.error("Erreur lors de la sauvegarde de la faction:", error);
                ui.notifications.error("Erreur lors de la mise à jour de la faction");
                
                // Restaurer la valeur précédente en cas d'erreur
                select.value = this.actor.system.faction?.value || "caradoc";
            }
            return;
        }
        
        // Si c'est un changement de classe ou d'affinité, sauvegarder immédiatement sans feedback
        if (field === "system.class.value" || field === "system.affinity.value") {
            try {
                await this.actor.update({ [field]: value });
                console.log(`${field === "system.class.value" ? "Classe" : "Affinité"} sauvegardée immédiatement: ${value}`);
            } catch (error) {
                console.error(`Erreur lors de la sauvegarde de ${field}:`, error);
                
                // Restaurer la valeur précédente en cas d'erreur
                if (field === "system.class.value") {
                    select.value = this.actor.system.class?.value || "";
                } else if (field === "system.affinity.value") {
                    select.value = this.actor.system.affinity?.value || "aucune";
                }
            }
            return;
        }
        
        // Si c'est un changement d'Arcane, mettre à jour seulement l'affichage du mana localement
        if (field === "system.arcane.value") {
            // Calculer le nouveau mana maximum basé sur la nouvelle valeur d'Arcane
            const manaPerLevel = {
                "1d4": 2,   // Insensible
                "2d4": 4,   // Eveillé
                "3d4": 6,   // Novice
                "4d4": 8,   // Initié
                "5d4": 10,  // Maître
                "6d4": 12   // Archimage
            };
            const newMaxMana = manaPerLevel[value] || 2;
            
            // Mettre à jour seulement l'affichage local, pas la sauvegarde
            this.actor.system.mana.max = newMaxMana;
            this.actor.system.mana.value = newMaxMana;
            this._updateManaDisplay();
            
            console.log(`Arcane et mana mis à jour localement: ${value} -> ${newMaxMana} points de mana`);
            
            // Ajouter les changements de mana aux changements en attente
        if (!this._pendingChanges) {
            this._pendingChanges = {};
        }
            this._pendingChanges['system.mana.max'] = newMaxMana;
            this._pendingChanges['system.mana.value'] = newMaxMana;
            
            // Continuer vers le traitement standard (stockage en mémoire sans sauvegarde)
        }
        
        // Pour les autres champs (caractéristiques), stocker le changement en mémoire sans sauvegarder
        if (!this._pendingChanges) {
            this._pendingChanges = {};
        }
        this._pendingChanges[field] = value;
        
        console.log(`Changement en attente pour ${field}: ${value}`);
        
        // Mettre à jour l'affichage local sans sauvegarder
        this._updateLocalDisplay(field, value);
    }

    /**
     * Met à jour l'affichage local sans sauvegarder
     * @param {string} field - Le nom du champ
     * @param {string} value - La nouvelle valeur
     * @private
     */
    _updateLocalDisplay(field, value) {
        // Mettre à jour l'affichage en mode lecture si c'est une caractéristique
        if (field.includes('system.') && field.endsWith('.value')) {
            const statName = field.split('.')[1];
            const readModeElement = this.element.find(`select[name="${field}"]`).closest('.stat-block').find('.read-mode');
            
            if (readModeElement.length > 0) {
                const label = this._getStatLabel(statName, value);
                readModeElement.text(label);
            }
        }
    }

    /**
     * Met à jour l'affichage local de l'armure sans sauvegarder
     * @param {number} value - La nouvelle valeur d'armure
     * @private
     */
    _updateLocalArmorDisplay(value) {
        // Mettre à jour l'affichage local de l'armure
        // Cette méthode peut être étendue si nécessaire pour mettre à jour d'autres éléments d'affichage
        console.log(`Affichage local de l'armure mis à jour: ${value}`);
    }

    /**
     * Met à jour l'affichage local de la constitution sans sauvegarder
     * @param {number} value - La nouvelle valeur de constitution
     * @private
     */
    _updateLocalConstitutionDisplay(value) {
        // Mettre à jour l'affichage local de la constitution
        console.log(`Affichage local de la constitution mis à jour: ${value}`);
    }

    /**
     * Met à jour l'affichage du blason de faction
     * @param {string} factionValue - La nouvelle valeur de faction
     * @private
     */
    _updateFactionCrest(factionValue) {
        const crestImg = this.element.find('.faction-crest img');
        if (crestImg.length > 0) {
            const newSrc = `systems/voidHorizon/assets/crests/${factionValue}.png`;
            crestImg.attr('src', newSrc);
            crestImg.attr('alt', `Blason ${factionValue}`);
            console.log(`Blason de faction mis à jour: ${newSrc}`);
        }
    }

    /**
     * Retourne le label d'affichage pour une statistique
     * @param {string} statName - Le nom de la statistique
     * @param {string} value - La valeur de la statistique
     * @returns {string} - Le label d'affichage
     * @private
     */
    _getStatLabel(statName, value) {
        const mappings = {
            'martialite': {
                "1d4": "Incompétent",
                "2d4": "Combatif",
                "3d4": "Soldat",
                "4d4": "Expérimenté",
                "5d4": "Vétéran",
                "6d4": "Légende"
            },
            'pimpance': {
                "1d4": "Tâche",
                "2d4": "Pas top",
                "3d4": "Honnête",
                "4d4": "Beau",
                "5d4": "Splendide",
                "6d4": "Ramirez"
            },
            'acuite': {
                "1d4": "Aveugle",
                "2d4": "Distrait",
                "3d4": "Alerte",
                "4d4": "Vif",
                "5d4": "Clairvoyant",
                "6d4": "Fulgurant"
            },
            'arcane': {
                "1d4": "Insensible",
                "2d4": "Eveillé",
                "3d4": "Novice",
                "4d4": "Initié",
                "5d4": "Maître",
                "6d4": "Archimage"
            }
        };
        
        return mappings[statName]?.[value] || value;
    }

    /**
     * Obtient la formule de dé en mode unsafe basée sur la valeur safe
     * @param {string} safeValue - La valeur en mode safe (ex: "2d4")
     * @returns {string} - La formule de dé en mode unsafe
     * @private
     */
    _getUnsafeFormula(safeValue) {
        const safeToUnsafe = {
            "1d4": "1d4",   // Degré 1
            "2d4": "1d8",   // Degré 2
            "3d4": "1d12",  // Degré 3
            "4d4": "1d16",  // Degré 4
            "5d4": "1d20",  // Degré 5
            "6d4": "1d24"   // Degré 6
        };
        return safeToUnsafe[safeValue] || safeValue;
    }

    /**
     * Sauvegarde tous les changements en attente
     * @private
     */
    async _saveAllChanges() {
        if (!this._pendingChanges || Object.keys(this._pendingChanges).length === 0) {
            console.log("Aucun changement à sauvegarder");
            return;
        }

        try {
            console.log("Sauvegarde des changements:", this._pendingChanges);
            
            // Sauvegarder tous les changements en une seule fois
            await this.actor.update(this._pendingChanges);
            
            console.log("Tous les changements ont été sauvegardés avec succès");
            
            // Vider les changements en attente
            this._pendingChanges = {};
            
            // Notification de succès
            ui.notifications.info("Caractéristiques sauvegardées avec succès");
            
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des changements:", error);
            ui.notifications.error("Erreur lors de la sauvegarde des caractéristiques");
            
            // Restaurer les valeurs précédentes en cas d'erreur
            this._restorePreviousValues();
        }
    }

    /**
     * Restaure les valeurs précédentes en cas d'erreur
     * @private
     */
    _restorePreviousValues() {
        if (!this._pendingChanges) return;
        
        Object.keys(this._pendingChanges).forEach(field => {
            const select = this.element.find(`select[name="${field}"]`);
            if (select.length > 0) {
                const statName = field.split('.')[1];
                const originalValue = this.actor.system[statName]?.value;
                select.val(originalValue);
                this._updateLocalDisplay(field, originalValue);
            }
        });
        
        this._pendingChanges = {};
    }

    /**
     * Lance un dé pour une statistique
     * @param {string} stat - Le nom de la statistique
     * @param {boolean} isUnsafe - Si le mode unsafe est activé
     * @private
     */
    async _onRollStat(event) {
        event.preventDefault();
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        const stat = event.currentTarget.dataset.stat;
        const baseFormula = this.actor.system[stat].value;
        const isUnsafe = event.currentTarget.dataset.unsafe === "true";
        
        if (!baseFormula) {
            ui.notifications.warn(`Aucune formule de dé définie pour ${stat}`);
            return;
        }

        // Déterminer la formule de base selon le mode
        let actualFormula = baseFormula;
        let modeLabel = "Safe";
        
        if (isUnsafe) {
            actualFormula = this._getUnsafeFormula(baseFormula);
            modeLabel = "Unsafe";
        }

        // Récupérer le bonus des traits pour cette statistique
        const traitBonus = this.actor.system.traitBonuses?.[stat] || 0;
        
        // Construire la formule finale avec le bonus des traits
        let finalFormula = actualFormula;
        let displayFormula = actualFormula;
        
        if (traitBonus !== 0) {
            finalFormula = `${actualFormula}+${traitBonus}`;
            displayFormula = `${actualFormula} + ${traitBonus > 0 ? '+' : ''}${traitBonus}`;
        }

        const roll = new Roll(finalFormula);
        await roll.evaluate({async: true});
        
        const templateData = {
            title: `${this.actor.name} - ${this._getStatDisplayName(stat)} (${modeLabel})`,
            subtitle: traitBonus !== 0 ? `Lance ${displayFormula} (${actualFormula} + bonus des traits)` : `Lance ${displayFormula}`,
            formula: finalFormula,
            total: roll.total,
            dice: roll.dice,
            baseFormula: actualFormula,
            traitBonus: traitBonus,
            mode: modeLabel
        };

        const html = await renderTemplate("systems/voidHorizon/templates/chat/roll.html", templateData);
        
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: html,
            sound: CONFIG.sounds.dice
        });
        
        console.log(`Jet de ${stat} (${modeLabel}): ${displayFormula} = ${roll.total} (base: ${actualFormula}, bonus traits: ${traitBonus})`);
    }

    /**
     * Gère le clic sur un bouton de lancement de dés
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollDice(event) {
        event.preventDefault();
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        const button = event.currentTarget;
        const stat = button.dataset.stat;
        const baseFormula = this.actor.system[stat]?.value;
        const isUnsafe = button.dataset.unsafe === "true";
        
        if (!baseFormula) {
            ui.notifications.warn(`Aucune formule de dé définie pour ${stat}`);
            return;
        }

        try {
            // Déterminer la formule de base selon le mode
            let actualFormula = baseFormula;
            let modeLabel = "Safe";
            
            if (isUnsafe) {
                actualFormula = this._getUnsafeFormula(baseFormula);
                modeLabel = "Unsafe";
            }

            // Récupérer le bonus des traits pour cette statistique
            const traitBonus = this.actor.system.traitBonuses?.[stat] || 0;
            
            // Construire la formule finale avec le bonus des traits
            let finalFormula = actualFormula;
            let displayFormula = actualFormula;
            
            if (traitBonus !== 0) {
                finalFormula = `${actualFormula}+${traitBonus}`;
                displayFormula = `${actualFormula} + ${traitBonus > 0 ? '+' : ''}${traitBonus}`;
            }

            const roll = new Roll(finalFormula);
            await roll.evaluate({async: true});
            
            const statName = this._getStatDisplayName(stat);
            const templateData = {
                title: `${this.actor.name} - ${statName} (${modeLabel})`,
                subtitle: traitBonus !== 0 ? `Lance ${displayFormula} (${actualFormula} + bonus des traits)` : `Lance ${displayFormula}`,
                formula: finalFormula,
                total: roll.total,
                dice: roll.dice,
                baseFormula: actualFormula,
                traitBonus: traitBonus,
                mode: modeLabel
            };

            const html = await renderTemplate("systems/voidHorizon/templates/chat/roll.html", templateData);
            
            await ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: html,
                sound: CONFIG.sounds.dice
            });
            
            console.log(`Lancement de dés ${displayFormula} (${modeLabel}) pour ${statName}: ${roll.total} (base: ${actualFormula}, bonus traits: ${traitBonus})`);
        } catch (error) {
            console.error(`Erreur lors du lancement de dés pour ${stat}:`, error);
            ui.notifications.error(`Erreur lors du lancement de dés pour ${stat}`);
        }
    }

    /**
     * Retourne le nom d'affichage d'une statistique
     * @param {string} stat - Le nom de la statistique
     * @returns {string} - Le nom d'affichage
     * @private
     */
    _getStatDisplayName(stat) {
        const statNames = {
            'martialite': 'Martialité',
            'pimpance': 'Pimpance',
            'acuite': 'Acuité',
            'arcane': 'Arcane'
        };
        return statNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
    }
    
    /**
     * Gère le clic sur un bouton de lancement d'arme
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollWeapon(event) {
        event.preventDefault();
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        const button = event.currentTarget;
        const weaponType = button.dataset.weapon; // 'primary' ou 'secondary'
        
        const weapon = this.actor.system.weapons[weaponType];
        
        if (!weapon || !weapon.name) {
            ui.notifications.warn(`Veuillez configurer l'équipement de la ${weaponType === 'primary' ? 'main principale' : 'main secondaire'} avant de lancer les dés`);
            return;
        }
        
        // Si la qualité est 0, pas de lancement de dés
        if (weapon.rank === "0") {
            ui.notifications.info(`${weapon.name} n'a aucune qualité et ne peut pas être utilisée pour attaquer`);
            return;
        }
        
        // Si c'est un bouclier, pas de lancement de dés
        if (weapon.type === 'shield') {
            ui.notifications.info(`${weapon.name} est un bouclier et ne peut pas être utilisé pour attaquer`);
            return;
        }
        
        try {
            // Déterminer la caractéristique à utiliser
            let characteristic, characteristicName, statName;
            if (weapon.type === 'strength') {
                characteristic = this.actor.system.martialite.value;
                characteristicName = 'Martialité';
                statName = 'martialite';
            } else if (weapon.type === 'agility') {
                characteristic = this.actor.system.acuite.value;
                characteristicName = 'Acuité';
                statName = 'acuite';
            } else {
                ui.notifications.error(`Type d'arme invalide: ${weapon.type}`);
                return;
            }
            
            // Récupérer le bonus des traits pour cette caractéristique
            const traitBonus = this.actor.system.traitBonuses?.[statName] || 0;
            
            // Créer la formule de dé
            const weaponRank = weapon.rank || "0";
            const weaponBonus = parseInt(weapon.bonus) || 0;
            
            // Construire la formule : caractéristique + bonus des traits + bonus de l'arme
            let formula = `${characteristic}`;
            let displayFormula = `${characteristic}`;
            let totalBonus = 0;
            
            // Ajouter le bonus des traits
            if (traitBonus !== 0) {
                formula += `+${traitBonus}`;
                displayFormula += ` + ${traitBonus > 0 ? '+' : ''}${traitBonus}`;
                totalBonus += traitBonus;
            }
            
            // Ajouter le bonus de l'arme
            if (weaponBonus !== 0) {
                formula += `+${weaponBonus}`;
                displayFormula += ` + ${weaponBonus > 0 ? '+' : ''}${weaponBonus}`;
                totalBonus += weaponBonus;
            }
            
            // Lancer les dés
            const roll = new Roll(formula);
            await roll.evaluate({async: true});
            
            // Préparer les données pour le template
                         const templateData = {
                 title: `${this.actor.name} - ${weapon.name}`,
                subtitle: `Attaque avec ${weapon.name} (${characteristicName}${traitBonus !== 0 ? ` + ${traitBonus > 0 ? '+' : ''}${traitBonus} traits` : ''}${weaponBonus !== 0 ? ` + ${weaponBonus > 0 ? '+' : ''}${weaponBonus} arme` : ''})`,
                 formula: formula,
                 total: roll.total,
                 dice: roll.dice,
                 weapon: {
                     name: weapon.name,
                     type: weapon.type === 'strength' ? 'Force' : 'Agilité',
                     rank: weaponRank,
                     bonus: weaponBonus
                 },
                 characteristic: {
                     name: characteristicName,
                     value: characteristic
                },
                traitBonus: traitBonus,
                totalBonus: totalBonus
             };
            
            const html = await renderTemplate("systems/voidHorizon/templates/chat/weapon-roll.html", templateData);
            
            await ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: html,
                sound: CONFIG.sounds.dice
            });
            
            console.log(`Lancement d'arme ${weapon.name}: ${displayFormula} = ${roll.total} (base: ${characteristic}, bonus traits: ${traitBonus}, bonus arme: ${weaponBonus})`);
         } catch (error) {
             console.error(`Erreur lors du lancement d'arme ${weaponType}:`, error);
             ui.notifications.error(`Erreur lors du lancement d'arme ${weaponType}`);
         }
     }
     
     /**
      * Applique les bonus des boucliers à l'armure et la constitution
      * @private
      */
     _applyShieldBonuses() {
         let totalArmorBonus = 0;
         let totalConstitutionBonus = 0;
         
         // Vérifier la main principale
         if (this.actor.system.weapons?.primary?.type === 'shield') {
             const shield = this.actor.system.weapons.primary;
             const bonus = parseInt(shield.bonus) || 0;
             totalArmorBonus += bonus;
             totalConstitutionBonus += bonus;
         }
         
         // Vérifier la main secondaire
         if (this.actor.system.weapons?.secondary?.type === 'shield') {
             const shield = this.actor.system.weapons.secondary;
             const bonus = parseInt(shield.bonus) || 0;
             totalArmorBonus += bonus;
             totalConstitutionBonus += bonus;
         }
         
         // Ajouter le bonus d'armure de l'équipement
         const equipmentArmorBonus = parseInt(this.actor.system.armor?.bonus) || 0;
         totalArmorBonus += equipmentArmorBonus;
         
         // Mettre à jour l'affichage des bonus
         this._updateShieldBonusDisplay(totalArmorBonus, totalConstitutionBonus);
         
         return { armorBonus: totalArmorBonus, constitutionBonus: totalConstitutionBonus };
     }
     
     /**
      * Met à jour l'affichage des bonus de bouclier
      * @param {number} armorBonus - Bonus d'armure total
      * @param {number} constitutionBonus - Bonus de constitution total
      * @private
      */
     _updateShieldBonusDisplay(armorBonus, constitutionBonus) {
         // Mettre à jour l'affichage de l'armure
         const armorInput = this.element.find('input[name="system.resources.armor.value"]');
         if (armorInput.length > 0) {
             const baseArmor = parseInt(this.actor.system.resources.armor?.value) || 0;
             const totalArmor = baseArmor + armorBonus;
             
             // Ajouter un indicateur visuel du bonus
             const armorContainer = armorInput.closest('.resource');
             let bonusIndicator = armorContainer.find('.shield-bonus-indicator');
             
             if (armorBonus > 0) {
                 if (bonusIndicator.length === 0) {
                     bonusIndicator = $(`<div class="shield-bonus-indicator">+${armorBonus} (Bouclier)</div>`);
                     armorContainer.append(bonusIndicator);
                 } else {
                     bonusIndicator.text(`+${armorBonus} (Bouclier)`);
                 }
                 bonusIndicator.show();
             } else if (bonusIndicator.length > 0) {
                 bonusIndicator.hide();
             }
         }
         
         // Mettre à jour l'affichage de la constitution
         const constitutionInput = this.element.find('input[name="system.constitution.value"]');
         if (constitutionInput.length > 0) {
             const baseConstitution = parseInt(this.actor.system.constitution?.value) || 0;
             const totalConstitution = baseConstitution + constitutionBonus;
             
             // Ajouter un indicateur visuel du bonus
             const constitutionContainer = constitutionInput.closest('.stat');
             let bonusIndicator = constitutionContainer.find('.shield-bonus-indicator');
             
             if (constitutionBonus > 0) {
                 if (bonusIndicator.length === 0) {
                     bonusIndicator = $(`<div class="shield-bonus-indicator">+${constitutionBonus} (Bouclier)</div>`);
                     constitutionContainer.append(bonusIndicator);
                 } else {
                     bonusIndicator.text(`+${constitutionBonus} (Bouclier)`);
                 }
                 bonusIndicator.show();
             } else if (bonusIndicator.length > 0) {
                 bonusIndicator.hide();
             }
         }
     }

    /**
     * Gère le clic sur un cœur de constitution
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onHeartClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const heartIndex = parseInt(button.dataset.heartIndex);
        const isAlive = button.dataset.alive === "true";
        const heartWrapper = button.closest('.heart-wrapper');
        
        // Mettre à jour la valeur de blessure
        const currentValue = this.actor.system.resources.blessure?.value || 0;
        const newValue = isAlive ? currentValue + 1 : currentValue - 1;
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur
            const updateData = {
                'system.resources.blessure.value': newValue
            };
            
            console.log("Mise à jour des points de vie:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des boutons
            this._updateHeartDisplay(heartWrapper, isAlive);
            
            // Mettre à jour l'état de santé
            this._updateHealthStatus();
            
            // Forcer la mise à jour de l'affichage
            this.render(true);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des points de vie:", error);
        }
    }

    /**
     * Met à jour l'affichage des boutons d'un cœur
     * @param {HTMLElement} heartWrapper - Le wrapper du cœur
     * @param {boolean} isAlive - Si le cœur est vivant
     * @private
     */
    _updateHeartDisplay(heartWrapper, isAlive) {
        const aliveButton = heartWrapper.querySelector('.alive');
        const deadButton = heartWrapper.querySelector('.dead');
        
        if (isAlive) {
            aliveButton.classList.add('hidden');
            deadButton.classList.remove('hidden');
        } else {
            aliveButton.classList.remove('hidden');
            deadButton.classList.add('hidden');
        }
    }

    /**
     * Met à jour l'affichage de l'état de santé
     * @private
     */
    _updateHealthStatus() {
        console.log("=== Debug Health Status ===");
        
        const totalConstitution = this._getTotalConstitution();
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const totalArmor = this._getTotalArmor();
        const armorDamage = this.actor.system.resources.armorDamage?.value || 0;
        const remainingHearts = totalConstitution - blessure;
        
        console.log("Constitution totale (base + bonus):", totalConstitution);
        console.log("Blessures:", blessure);
        console.log("Armure totale (base + bonus):", totalArmor);
        console.log("Dégâts d'armure:", armorDamage);
        console.log("Points de vie restants:", remainingHearts);
        
        let status = "Incapacité";
        let statusClass = "status-critical";
        
        if (remainingHearts >= 3) {
            status = "Bonne santé";
            statusClass = "status-good";
        } else if (remainingHearts === 2) {
            status = "Légèrement blessé";
            statusClass = "status-warning";
        } else if (remainingHearts === 1) {
            status = "Grièvement blessé";
            statusClass = "status-danger";
        }
        
        console.log("État calculé:", status);
        console.log("=== Fin Debug Health Status ===");
        
        // Mettre à jour le contenu HTML directement
        const statusHtml = `
            <span class="status-label">État :</span>
            <span class="status-value ${statusClass}" data-health-status>${status}</span>
        `;
        
        const healthStatusContainer = this.element.find('.health-status');
        if (healthStatusContainer.length) {
            healthStatusContainer.html(statusHtml);
        }
    }

    /**
     * Gère le clic sur un bouclier d'armure
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onShieldClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const shieldIndex = parseInt(button.dataset.shieldIndex);
        const isActive = button.dataset.active === "true";
        const shieldWrapper = button.closest('.shield-wrapper');
        
        console.log(`Clic sur bouclier ${shieldIndex}, actif: ${isActive}`);
        
        // Vérification de sécurité
        if (!shieldWrapper) {
            console.error("Wrapper d'armure non trouvé");
            return;
        }
        
        // Mettre à jour la valeur de dégâts d'armure
        const currentDamage = this.actor.system.resources.armorDamage?.value || 0;
        const newDamage = isActive ? currentDamage + 1 : currentDamage - 1;
        
        console.log(`Dégâts d'armure: ${currentDamage} -> ${newDamage}`);
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur de dégâts d'armure
            const updateData = {
                'system.resources.armorDamage.value': newDamage
            };
            
            console.log("Mise à jour des boucliers:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des boutons
            this._updateShieldDisplay(shieldWrapper, isActive);
            
            console.log("Bouclier mis à jour avec succès");
        } catch (error) {
            console.error("Erreur lors de la mise à jour des boucliers:", error);
        }
    }

    /**
     * Met à jour l'affichage des boutons d'un bouclier
     * @param {HTMLElement} shieldWrapper - Le wrapper du bouclier
     * @param {boolean} isActive - Si le bouclier est actif
     * @private
     */
    _updateShieldDisplay(shieldWrapper, isActive) {
        const activeButton = shieldWrapper.querySelector('.active');
        const brokenButton = shieldWrapper.querySelector('.broken');
        
        console.log("Mise à jour de l'affichage du bouclier:", { activeButton, brokenButton, isActive });
        
        // Vérification de sécurité
        if (!activeButton || !brokenButton) {
            console.error("Boutons d'armure non trouvés:", { activeButton, brokenButton });
            return;
        }
        
        if (isActive) {
            // Le bouclier était actif, on le casse
            activeButton.classList.add('hidden');
            brokenButton.classList.remove('hidden');
            console.log("Bouclier marqué comme cassé");
        } else {
            // Le bouclier était cassé, on le répare
            activeButton.classList.remove('hidden');
            brokenButton.classList.add('hidden');
            console.log("Bouclier marqué comme actif");
        }
    }

    /**
     * Gère le clic sur un point de mana
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onManaClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const manaIndex = parseInt(button.dataset.manaIndex);
        const isActive = button.dataset.active === "true";
        
        console.log(`Clic sur point de mana ${manaIndex}, actif: ${isActive}`);
        
        // Mettre à jour la valeur de mana actuel
        const currentMana = this.actor.system.mana?.value || 0;
        const newMana = isActive ? currentMana - 1 : currentMana + 1;
        
        // S'assurer que le mana ne descend pas en dessous de 0
        const finalMana = Math.max(0, newMana);
        
        console.log(`Mana: ${currentMana} -> ${finalMana}`);
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur de mana
            const updateData = {
                'system.mana.value': finalMana
            };
            
            console.log("Mise à jour du mana:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des points de mana
            this._updateManaDisplay();
            
            console.log("Mana mis à jour avec succès");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du mana:", error);
        }
    }

    /**
     * Met à jour l'affichage des points de mana
     * @private
     */
    _updateManaDisplay() {
        const totalMana = this._getTotalMana();
        const currentMana = this.actor.system.mana?.value || 0;
        const manaButtons = this.element.find('.mana-button');
        
        console.log(`Mise à jour affichage mana: total=${totalMana}, actuel=${currentMana}`);
        
        manaButtons.each((index, button) => {
            const manaIndex = index + 1;
            const isActive = manaIndex <= currentMana;
            
            if (isActive) {
                button.classList.remove('depleted');
                button.classList.add('active');
                button.dataset.active = "true";
            } else {
                button.classList.remove('active');
                button.classList.add('depleted');
                button.dataset.active = "false";
            }
        });
    }

    /**
     * Calcule le mana total basé sur le degré d'Arcane
     * @returns {number} Le nombre total de points de mana
     * @private
     */
    _getTotalMana() {
        const arcaneValue = this.actor.system.arcane?.value || "1d4";
        const manaPerLevel = {
            "1d4": 2,   // Insensible
            "2d4": 4,   // Eveillé
            "3d4": 6,   // Novice
            "4d4": 8,   // Initié
            "5d4": 10,  // Maître
            "6d4": 12   // Archimage
        };
        return manaPerLevel[arcaneValue] || 2;
    }

         /**
      * Gère les changements de rang
      * @param {Event} event - L'événement de changement
      * @private
      */
     async _onRankChange(event) {
         event.preventDefault();
         const input = event.target;
         const value = input.value;
         
         try {
             await this.actor.update({
                 "system.rank.value": value
             });
             console.log(`Mise à jour réussie du rang: ${value}`);
         } catch (error) {
             console.error("Erreur lors de la mise à jour du rang:", error);
             // Restaurer la valeur précédente en cas d'erreur
             input.value = this.actor.system.rank.value;
         }
     }
     
     /**
      * Gère les changements des champs d'armes
      * @param {Event} event - L'événement de changement
      * @private
      */
     _onWeaponFieldChange(event) {
         event.preventDefault();
         const input = event.target;
         const field = input.name;
         const value = input.value;
         
         // Stocker le changement en mémoire sans sauvegarder
         if (!this._pendingWeaponChanges) {
             this._pendingWeaponChanges = {};
         }
         this._pendingWeaponChanges[field] = value;
         
         console.log(`Changement d'équipement en attente pour ${field}: ${value}`);
         
         // Mettre à jour l'affichage local sans sauvegarder
         this._updateLocalWeaponDisplay(field, value);
         
         // Si c'est un changement de type d'arme, appliquer immédiatement les bonus des boucliers
         if (field.endsWith('.type')) {
             this._applyShieldBonuses();
         }
         
         // Si c'est un changement de bonus d'armure, mettre à jour l'affichage des boucliers
         if (field === 'system.armor.bonus') {
             this._updateShieldsDisplay();
         }
     }

     /**
      * Gère les changements de type d'équipement (pour les boucliers)
      * @param {Event} event - L'événement de changement
      * @private
      */
     async _onWeaponTypeChange(event) {
         event.preventDefault();
         const select = event.target;
         const value = select.value;
         const field = select.name;
         
         // Stocker le changement en mémoire sans sauvegarder
         if (!this._pendingWeaponChanges) {
             this._pendingWeaponChanges = {};
         }
         this._pendingWeaponChanges[field] = value;
         
         // Mettre à jour l'affichage local sans sauvegarder
         this._updateLocalWeaponDisplay(field, value);
         
         // Appliquer les bonus des boucliers immédiatement pour l'affichage
         this._applyShieldBonuses();
         
         console.log(`Type d'équipement en attente: ${field} = ${value}`);
     }

    /**
     * Initialise l'état de santé
     * @private
     */
         _initializeHealthState() {
         this._initializeHearts(this.element);
         this._initializeShields(this.element);
        this._updateManaDisplay();
         this._updateHealthStatus();
         
         // Appliquer les bonus des boucliers
         this._applyShieldBonuses();
        
        // Reattacher les événements des boucliers après le re-render
        this._reattachShieldEvents();
    }
    
    /**
     * Gère le clic sur les boutons d'onglets (Équipement/Traits)
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onTabButtonClick(event) {
        event.preventDefault();
        console.log('Clic sur onglet détecté');
        
        const button = $(event.currentTarget); // Convertir en objet jQuery
        const tabName = button.data('tab');
        console.log('Nom de l\'onglet:', tabName);
        
        // Mettre à jour l'état actif des boutons
        this.element.find('.tab-button').removeClass('active');
        button.addClass('active');
        console.log('Bouton actif mis à jour');
        
        // Masquer tous les contenus d'onglets
        this.element.find('.tab-content').removeClass('active');
        console.log('Tous les contenus d\'onglets masqués');
        
        // Afficher le contenu de l'onglet sélectionné
        const targetContent = this.element.find(`.tab-content[data-tab="${tabName}"]`);
        if (targetContent.length > 0) {
            targetContent.addClass('active');
            console.log(`Contenu de l'onglet ${tabName} affiché`);
            
            // Log spécifique pour l'onglet traits
            if (tabName === 'traits') {
                const traitsList = targetContent.find('#traits-list');
                console.log('Liste des traits trouvée:', traitsList.length > 0);
                console.log('Contenu de la liste des traits:', traitsList.html());
            }
        } else {
            console.error(`Contenu de l'onglet ${tabName} non trouvé`);
        }
        
        // Afficher/masquer le bouton d'édition selon l'onglet
        const editButton = this.element.find('#weapons-edit-button');
        if (tabName === 'equipment') {
            editButton.show();
            console.log('Bouton d\'édition affiché');
        } else {
            editButton.hide();
            console.log('Bouton d\'édition masqué');
        }
        
        console.log(`Onglet ${tabName} activé avec succès`);
    }

    /**
     * Reattache les événements des boucliers après un re-render
     * @private
     */
    _reattachShieldEvents() {
        const shieldButtons = this.element.find('.armor-container .shield-button');
        console.log(`Reattachement des événements pour ${shieldButtons.length} boutons de bouclier`);
        
        shieldButtons.each((index, button) => {
            // Supprimer les anciens événements
            $(button).off('click');
            
            // Attacher le nouvel événement
            $(button).on('click', this._onShieldClick.bind(this));
        });
     }

         /**
      * Gère le basculement entre les modes édition et lecture
      * @param {Event} event - L'événement de clic
      * @private
      */
     _onToggleEditMode(event) {
         event.preventDefault();
         const form = event.currentTarget.closest('form');
         const isEditing = form.classList.contains('editing');
         
         if (isEditing) {
             // Mode sauvegarde - sauvegarder tous les changements
             if (this._pendingChanges && Object.keys(this._pendingChanges).length > 0) {
                 this._saveAllChanges();
             }
             
             form.classList.remove('editing');
             form.classList.add('read-only');
             event.currentTarget.querySelector('i').classList.remove('fa-save');
             event.currentTarget.querySelector('i').classList.add('fa-edit');
             event.currentTarget.querySelector('.button-text').textContent = 'Éditer';
         } else {
             // Mode édition - initialiser les changements en attente
             this._pendingChanges = {};
             form.classList.remove('read-only');
             form.classList.add('editing');
             event.currentTarget.querySelector('i').classList.remove('fa-edit');
             event.currentTarget.querySelector('i').classList.add('fa-save');
             event.currentTarget.querySelector('.button-text').textContent = 'Sauvegarder';
         }
     }
     
     /**
      * Gère le basculement entre les modes édition et lecture des armes
      * @param {Event} event - L'événement de clic
      * @private
      */
     _onToggleWeaponsEditMode(event) {
         event.preventDefault();
         // Trouver la section weapons-section qui est dans le même onglet que le bouton
         const tabContent = event.currentTarget.closest('.tab-content[data-tab="equipment"]');
         const weaponsSection = tabContent.querySelector('.weapons-section');
         
         if (!weaponsSection) {
             console.error('Section weapons-section non trouvée');
             return;
         }
         
         const isEditing = weaponsSection.classList.contains('editing');
         
         if (isEditing) {
             // Mode sauvegarde - sauvegarder tous les changements d'armes
             if (this._pendingWeaponChanges && Object.keys(this._pendingWeaponChanges).length > 0) {
                 this._saveAllWeaponChanges();
             }
             
             weaponsSection.classList.remove('editing');
             weaponsSection.classList.add('read-only');
             event.currentTarget.querySelector('i').classList.remove('fa-save');
             event.currentTarget.querySelector('i').classList.add('fa-edit');
         } else {
             // Mode édition - initialiser les changements en attente
             this._pendingWeaponChanges = {};
             weaponsSection.classList.remove('read-only');
             weaponsSection.classList.add('editing');
             event.currentTarget.querySelector('i').classList.remove('fa-edit');
             event.currentTarget.querySelector('i').classList.add('fa-save');
         }
     }

     /**
      * Sauvegarde tous les changements d'armes en attente
      * @private
      */
     async _saveAllWeaponChanges() {
         if (!this._pendingWeaponChanges || Object.keys(this._pendingWeaponChanges).length === 0) {
             console.log("Aucun changement d'arme à sauvegarder");
             return;
         }

         try {
             console.log("Sauvegarde des changements d'armes:", this._pendingWeaponChanges);
             
             // Sauvegarder tous les changements en une seule fois
             await this.actor.update(this._pendingWeaponChanges);
             
             console.log("Tous les changements d'armes ont été sauvegardés avec succès");
             
             // Vider les changements en attente
             this._pendingWeaponChanges = {};
             
             // Notification de succès
             ui.notifications.info("Équipement sauvegardé avec succès");
             
         } catch (error) {
             console.error("Erreur lors de la sauvegarde des changements d'armes:", error);
             ui.notifications.error("Erreur lors de la sauvegarde de l'équipement");
             
             // Restaurer les valeurs précédentes en cas d'erreur
             this._restorePreviousWeaponValues();
         }
     }

     /**
      * Restaure les valeurs précédentes des armes en cas d'erreur
      * @private
      */
         _restorePreviousWeaponValues() {
        if (!this._pendingWeaponChanges) return;
        
        Object.keys(this._pendingWeaponChanges).forEach(field => {
            const input = this.element.find(`[name="${field}"]`);
            if (input.length > 0) {
                if (field.includes('system.weapons.')) {
                // Extraire le nom du champ et la main (primary/secondary)
                const fieldParts = field.split('.');
                const weaponType = fieldParts[2]; // primary ou secondary
                const fieldName = fieldParts[3]; // name, type, rank, bonus, description
                
                // Restaurer la valeur depuis l'acteur
                const originalValue = this.actor.system.weapons[weaponType]?.[fieldName];
                if (originalValue !== undefined) {
                    input.val(originalValue);
                    }
                } else if (field.includes('system.armor.')) {
                    // Gérer l'armure d'équipement
                    const fieldParts = field.split('.');
                    const fieldName = fieldParts[2]; // name, bonus, description
                    
                    // Restaurer la valeur depuis l'acteur
                    const originalValue = this.actor.system.armor?.[fieldName];
                    if (originalValue !== undefined) {
                        input.val(originalValue);
                    }
                } else if (field === 'system.resources.armor.value') {
                    // Gérer l'armure de base
                    const originalValue = this.actor.system.resources?.armor?.value;
                    if (originalValue !== undefined) {
                        input.val(originalValue);
                    }
                }
            }
        });
        
        this._pendingWeaponChanges = {};
    }

     /**
      * Met à jour l'affichage local des armes sans sauvegarder
      * @param {string} field - Le nom du champ
      * @param {string} value - La nouvelle valeur
      * @private
      */
     _updateLocalWeaponDisplay(field, value) {
         // Mettre à jour l'affichage en mode lecture si c'est un champ d'arme
         if (field.includes('system.weapons.')) {
             const fieldParts = field.split('.');
             const weaponType = fieldParts[2]; // primary ou secondary
             const fieldName = fieldParts[3]; // name, type, rank, bonus, description
             
             const readModeElement = this.element.find(`[name="${field}"]`).closest('.weapon-field').find('.read-mode');
             
             if (readModeElement.length > 0) {
                 if (fieldName === 'type') {
                     // Gérer l'affichage du type
                     let displayValue = 'Non défini';
                     if (value === 'strength') displayValue = 'Force (Martialité)';
                     else if (value === 'agility') displayValue = 'Agilité (Acuité)';
                     else if (value === 'shield') displayValue = 'Bouclier';
                     readModeElement.text(displayValue);
                 } else if (fieldName === 'rank') {
                     // Gérer l'affichage de la qualité
                     if (value === '0') {
                         readModeElement.text('Équipement brisé');
                     } else {
                         readModeElement.text(value);
                     }
                 } else if (fieldName === 'bonus') {
                     // Gérer l'affichage du bonus
                     const bonusValue = parseInt(value) || 0;
                     if (bonusValue > 0) {
                         readModeElement.text(`+${bonusValue}`);
                     } else {
                         readModeElement.text(bonusValue.toString());
                     }
                 } else {
                     // Pour les autres champs (name, description)
                     readModeElement.text(value || '');
                 }
             }
         } else if (field.includes('system.armor.')) {
             // Mettre à jour l'affichage en mode lecture pour l'armure
             const fieldParts = field.split('.');
             const fieldName = fieldParts[2]; // name, bonus, description
             
             const readModeElement = this.element.find(`[name="${field}"]`).closest('.weapon-field').find('.read-mode');
             
             if (readModeElement.length > 0) {
                 if (fieldName === 'bonus') {
                     // Gérer l'affichage du bonus d'armure
                     const bonusValue = parseInt(value) || 0;
                     if (bonusValue > 0) {
                         readModeElement.text(`+${bonusValue}`);
                     } else {
                         readModeElement.text(bonusValue.toString());
                     }
                 } else {
                     // Pour les autres champs (name, description)
                     readModeElement.text(value || '');
                 }
             }
         }
     }

    async _updateObject(event, formData) {
        // Mise à jour des données du formulaire
        const updateData = {};
        
        // Parcourir les données du formulaire
        for (let [key, value] of formData.entries()) {
            console.log(`Form data - Key: ${key}, Value: ${value}`);
            // Vérifier si c'est une statistique
            if (key.startsWith('system.') && key.endsWith('.value')) {
                const stat = key.split('.')[1];
                console.log(`Stat found: ${stat}`);
                if (['martialite', 'pimpance', 'acuite', 'arcane'].includes(stat)) {
                    // S'assurer que la valeur est une chaîne de caractères
                    updateData[key] = String(value);
                    console.log(`Adding to updateData: ${key} = ${updateData[key]}`);
                }
            }
        }

        console.log('Final updateData:', updateData);
        // Mettre à jour l'acteur
        try {
            await this.actor.update(updateData);
            console.log('Update successful');
        } catch (error) {
            console.error('Error updating actor:', error);
            ui.notifications.error('Erreur lors de la mise à jour des données');
        }
    }

    /**
     * Gère le clic sur le bouton de création de trait
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onCreateTraitClick(event) {
        event.preventDefault();
        const formContainer = this.element.find('#trait-form-container');
        formContainer.show();
        
        // Vider les champs du formulaire
        this.element.find('#trait-name-input').val('');
        this.element.find('#trait-description-input').val('');
        this.element.find('#trait-bonus-target').val('');
        this.element.find('#trait-bonus-value').val('');
        
        // Focus sur le premier champ
        this.element.find('#trait-name-input').focus();
    }

    /**
     * Gère le clic sur le bouton de sauvegarde de trait
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onSaveTraitClick(event) {
        event.preventDefault();
        
        const name = this.element.find('#trait-name-input').val().trim();
        const description = this.element.find('#trait-description-input').val().trim();
        const bonusTarget = this.element.find('#trait-bonus-target').val();
        const bonusValue = parseInt(this.element.find('#trait-bonus-value').val()) || 0;
        
        // Validation
        if (!name) {
            ui.notifications.warn('Le nom du trait est requis');
            return;
        }
        
        if (!bonusTarget) {
            ui.notifications.warn('Veuillez sélectionner une caractéristique pour le bonus');
            return;
        }
        
        try {
            const saveButton = this.element.find('#trait-save-btn');
            const isEditing = saveButton.attr('data-edit-trait-id');
            
            if (isEditing) {
                // Mode édition - mettre à jour le trait existant
                const traitId = isEditing;
                const traitData = {
                    name: name,
                    description: description,
                    bonusTarget: bonusTarget,
                    bonusValue: bonusValue
                };
                
                await this.actor.update({
                    [`system.traits.${traitId}`]: traitData
                });
                
                ui.notifications.info(`Trait "${name}" modifié avec succès`);
                
                // Réinitialiser le bouton
                saveButton.removeAttr('data-edit-trait-id').text('Sauvegarder');
                
            } else {
                // Mode création - créer un nouveau trait
                const traitId = `trait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                const traitData = {
                    name: name,
                    description: description,
                    bonusTarget: bonusTarget,
                    bonusValue: bonusValue
                };
                
                await this.actor.update({
                    [`system.traits.${traitId}`]: traitData
                });
                
                ui.notifications.info(`Trait "${name}" créé avec succès`);
            }
            
            // Masquer le formulaire
            this.element.find('#trait-form-container').hide();
            
            // Recalculer les bonus des traits
            this._applyTraitBonuses();
            
            // Mettre à jour l'affichage des cœurs, boucliers et mana
            this._updateHealthStatus();
            this._updateShieldsDisplay();
            this._updateHeartsDisplay();
            this._updateManaDisplay();
            
            // Recharger la fiche pour afficher les changements
            this.render(true);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du trait:', error);
            ui.notifications.error('Erreur lors de la sauvegarde du trait');
        }
    }

    /**
     * Gère le clic sur le bouton d'annulation de création de trait
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onCancelTraitClick(event) {
        event.preventDefault();
        
        // Masquer le formulaire
        this.element.find('#trait-form-container').hide();
        
        // Réinitialiser le formulaire
        this.element.find('#trait-name-input').val('');
        this.element.find('#trait-description-input').val('');
        this.element.find('#trait-bonus-target').val('');
        this.element.find('#trait-bonus-value').val('');
        
        // Réinitialiser le bouton de sauvegarde
        const saveButton = this.element.find('#trait-save-btn');
        saveButton.removeAttr('data-edit-trait-id').text('Sauvegarder');
        
        // Réinitialiser le titre
        this.element.find('#trait-form-container h4').text('Nouveau trait');
    }

    /**
     * Gère le clic sur le bouton d'édition de trait
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onEditTraitClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const traitId = button.data('trait-id');
        const trait = this.actor.system.traits?.[traitId];
        
        if (!trait) {
            ui.notifications.error('Trait non trouvé');
            return;
        }
        
        // Afficher le formulaire avec les données du trait
        const formContainer = this.element.find('#trait-form-container');
        formContainer.show();
        
        // Remplir les champs avec les données existantes
        this.element.find('#trait-name-input').val(trait.name);
        this.element.find('#trait-description-input').val(trait.description);
        this.element.find('#trait-bonus-target').val(trait.bonusTarget);
        this.element.find('#trait-bonus-value').val(trait.bonusValue);
        
        // Changer le titre et le bouton de sauvegarde
        formContainer.find('h4').text('Modifier le trait');
        formContainer.find('#trait-save-btn').text('Modifier').attr('data-edit-trait-id', traitId);
        
        // Focus sur le premier champ
        this.element.find('#trait-name-input').focus();
    }

    /**
     * Gère le clic sur le bouton de suppression de trait
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onDeleteTraitClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const traitId = button.data('trait-id');
        
        console.log('=== SUPPRESSION DE TRAIT ===');
        console.log('Trait ID:', traitId);
        console.log('Traits actuels:', this.actor.system.traits);
        
        const trait = this.actor.system.traits?.[traitId];
        
        // Si le trait est null, c'est qu'il a déjà été supprimé
        if (trait === null) {
            console.log('Trait déjà supprimé (null), masqué par CSS');
            ui.notifications.info('Trait déjà supprimé');
            return;
        }
        
        if (!trait) {
            console.error('Trait non trouvé pour ID:', traitId);
            ui.notifications.error('Trait non trouvé');
            return;
        }
        
        console.log('Trait à supprimer:', trait);
        
        // Demander confirmation
        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: 'Confirmer la suppression',
                content: `<p>Êtes-vous sûr de vouloir supprimer le trait "${trait.name}" ?</p>`,
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'Oui',
                        callback: () => resolve(true)
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Non',
                        callback: () => resolve(false)
                    }
                },
                default: 'no'
            }).render(true);
        });
        
        if (!confirmed) return;
        
        try {
            // Mettre le trait à null au lieu de le supprimer complètement
            const currentTraits = { ...this.actor.system.traits };
            currentTraits[traitId] = null; // Explicitement mettre le trait à null
            
            console.log('Suppression du trait:', traitId);
            console.log('Traits restants:', currentTraits);
            
            // Vérifier que la mise à null locale a bien fonctionné
            if (currentTraits[traitId] !== null) {
                console.error('Erreur : le trait n\'a pas été mis à null dans la copie locale !');
                ui.notifications.error('Erreur interne lors de la suppression du trait');
                return;
            }
            
            // Mettre à jour l'acteur avec les traits (le trait supprimé est maintenant null)
            const updateData = {
                'system.traits': currentTraits
            };
            
            console.log('Données de mise à jour:', updateData);
            
                         // Mettre à jour l'acteur avec les traits restants
             await this.actor.update(updateData);
             console.log('Mise à jour réussie');
            
                         // Synchronisation des données
             await this.actor.sheet.render(true);
            
                                     // Vérifier que la mise à null est bien persistante
            if (this.actor.system.traits[traitId] !== null) {
                console.log('Le trait n\'a pas été mis à null après la mise à jour !');
            } else {
                console.log('Le trait a été mis à null avec succès, il sera masqué par CSS');
            }
            
                         // Notification de succès
             ui.notifications.info(`Trait "${trait.name}" supprimé avec succès`);
             
                         // Recalculer les bonus des traits
            this._applyTraitBonuses();
            
            // Mettre à jour l'affichage des cœurs, boucliers et mana
            this._updateHealthStatus();
            this._updateShieldsDisplay();
            this._updateHeartsDisplay();
            this._updateManaDisplay();
            
            // Recharger la fiche pour afficher les changements
            this.render(true);
            
        } catch (error) {
            console.error('Erreur lors de la suppression du trait:', error);
            ui.notifications.error('Erreur lors de la suppression du trait');
        }
    }

    /**
     * Calcule le bonus total d'un trait sur une caractéristique
     * @param {string} statName - Nom de la caractéristique
     * @returns {number} - Bonus total
     * @private
     */
    _calculateTraitBonus(statName) {
        const traits = this.actor.system.traits || {};
        let totalBonus = 0;
        
        for (const traitId in traits) {
            const trait = traits[traitId];
            // Ignorer les traits null ou undefined
            if (!trait || trait === null) {
                continue;
            }
            if (trait.bonusTarget === statName) {
                totalBonus += trait.bonusValue || 0;
            }
        }
        
        return totalBonus;
    }

    /**
     * Applique les bonus des traits aux caractéristiques
     * @private
     */
    _applyTraitBonuses() {
        const traits = this.actor.system.traits || {};
        console.log('Traits disponibles:', traits);
        console.log('Structure de system:', this.actor.system);
        
        // Calculer les bonus pour chaque caractéristique
        const bonuses = {
            martialite: this._calculateTraitBonus('martialite'),
            pimpance: this._calculateTraitBonus('pimpance'),
            acuite: this._calculateTraitBonus('acuite'),
            arcane: this._calculateTraitBonus('arcane'),
            armor: this._calculateTraitBonus('armor'),
            constitution: this._calculateTraitBonus('constitution')
        };
        
        // Stocker les bonus dans l'acteur pour utilisation ultérieure (en mémoire seulement)
        this.actor.system.traitBonuses = bonuses;
        
        console.log('Bonus des traits appliqués:', bonuses);
        
        // Si les bonus d'armure ou de constitution ont changé, forcer la mise à jour de l'affichage
        const oldArmorBonus = this._lastArmorBonus || 0;
        const oldConstitutionBonus = this._lastConstitutionBonus || 0;
        const oldArcaneBonus = this._lastArcaneBonus || 0;
        
        if (bonuses.armor !== oldArmorBonus || bonuses.constitution !== oldConstitutionBonus || bonuses.arcane !== oldArcaneBonus) {
            console.log('Bonus d\'armure, constitution ou arcane changé, mise à jour de l\'affichage...');
            this._updateHealthStatus();
            this._updateShieldsDisplay();
            this._updateHeartsDisplay();
            
            // Si le bonus d'Arcane a changé, mettre à jour le mana
            if (bonuses.arcane !== oldArcaneBonus) {
                console.log('Bonus d\'Arcane changé, mise à jour du mana...');
                this._updateManaDisplay();
            }
            
            // Stocker les nouveaux bonus pour la prochaine comparaison
            this._lastArmorBonus = bonuses.armor;
            this._lastConstitutionBonus = bonuses.constitution;
            this._lastArcaneBonus = bonuses.arcane;
        }
    }

    /**
     * Obtient la valeur totale de constitution incluant les bonus des traits
     * @returns {number} - Valeur totale de constitution
     * @private
     */
    _getTotalConstitution() {
        const baseConstitution = parseInt(this.actor.system.constitution?.value) || 0;
        const traitBonus = this.actor.system.traitBonuses?.constitution || 0;
        return baseConstitution + traitBonus;
    }

    /**
     * Obtient la valeur totale d'armure incluant les bonus des traits
     * @returns {number} - Valeur totale d'armure
     * @private
     */
    _getTotalArmor() {
        const baseArmor = parseInt(this.actor.system.resources?.armor?.value) || 0;
        const traitBonus = this.actor.system.traitBonuses?.armor || 0;
        const equipmentBonus = parseInt(this.actor.system.armor?.bonus) || 0;
        
        // Ajouter les bonus des boucliers d'armes
        let shieldBonus = 0;
        if (this.actor.system.weapons?.primary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.primary.bonus) || 0;
        }
        if (this.actor.system.weapons?.secondary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.secondary.bonus) || 0;
        }
        
        const totalArmor = baseArmor + traitBonus + equipmentBonus + shieldBonus;
        console.log(`Calcul armure totale: base(${baseArmor}) + traits(${traitBonus}) + équipement(${equipmentBonus}) + boucliers(${shieldBonus}) = ${totalArmor}`);
        
        return totalArmor;
    }
    
    /**
     * Recalcule les bonus des traits (appelé avant chaque jet de dé)
     * @private
     */
    _recalculateTraitBonuses() {
        // S'assurer que les bonus des traits sont à jour
        if (!this.actor.system.traitBonuses) {
            this._applyTraitBonuses();
        }
        
        // Vérifier que les bonus sont cohérents avec les traits actuels
        const currentTraits = this.actor.system.traits || {};
        // Compter seulement les traits valides (pas null)
        const validTraits = Object.values(currentTraits).filter(trait => trait && trait !== null);
        const currentBonusCount = validTraits.length;
        
        console.log('Recalcul des bonus - Traits actuels:', currentTraits);
        console.log('Traits valides:', validTraits);
        console.log('Nombre de traits valides:', currentBonusCount);
        console.log('Dernier compte:', this._lastTraitCount);
        
        // Si le nombre de traits valides a changé, recalculer
        if (this._lastTraitCount !== currentBonusCount) {
            console.log('Nombre de traits valides changé, recalcul des bonus...');
            this._applyTraitBonuses();
            this._lastTraitCount = currentBonusCount;
        }
    }
}

// Enregistrer la classe de la fiche
Hooks.once("init", function() {
    console.log("Enregistrement de la fiche Héros");
    
    // Enregistrer les helpers Handlebars
    Handlebars.registerHelper('times', function(n) {
        return Array.from({length: n}, (_, i) => i);
    });
    
    Handlebars.registerHelper('add', function(a, b) {
        return parseInt(a) + parseInt(b);
    });
    
    Handlebars.registerHelper('sub', function(a, b) {
        return parseInt(a) - parseInt(b);
    });
    
    Handlebars.registerHelper('selected', function(value, current) {
        return value === current ? "selected" : "";
    });
    
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('gte', function(a, b) {
        return parseInt(a) >= parseInt(b);
    });

    Handlebars.registerHelper('gt', function(a, b) {
        return parseInt(a) > parseInt(b);
    });

    Handlebars.registerHelper('contains', function(array, value) {
        return array && array.includes(parseInt(value));
    });

            // Nouveaux helpers pour les valeurs totales incluant les bonus des traits
        Handlebars.registerHelper('getTotalConstitution', function(actor) {
            const baseConstitution = parseInt(actor.system.constitution?.value) || 0;
            const traitBonus = parseInt(actor.system.traitBonuses?.constitution) || 0;
            return baseConstitution + traitBonus;
        });

        Handlebars.registerHelper('getTotalArmor', function(actor) {
            const baseArmor = parseInt(actor.system.resources?.armor?.value) || 0;
            const traitBonus = parseInt(actor.system.traitBonuses?.armor) || 0;
            const equipmentBonus = parseInt(actor.system.armor?.bonus) || 0;
            
            // Ajouter les bonus des boucliers d'armes
            let shieldBonus = 0;
            if (actor.system.weapons?.primary?.type === 'shield') {
                shieldBonus += parseInt(actor.system.weapons.primary.bonus) || 0;
            }
            if (actor.system.weapons?.secondary?.type === 'shield') {
                shieldBonus += parseInt(actor.system.weapons.secondary.bonus) || 0;
            }
            
            return baseArmor + traitBonus + equipmentBonus + shieldBonus;
        });

        // Helper pour calculer le mana total basé sur le degré d'Arcane
        Handlebars.registerHelper('getTotalMana', function(actor) {
            const arcaneValue = actor.system.arcane?.value || "1d4";
            const manaPerLevel = {
                "1d4": 2,   // Insensible
                "2d4": 4,   // Eveillé
                "3d4": 6,   // Novice
                "4d4": 8,   // Initié
                "5d4": 10,  // Maître
                "6d4": 12   // Archimage
            };
            return manaPerLevel[arcaneValue] || 2;
        });

        // Helper pour accéder aux propriétés imbriquées
        Handlebars.registerHelper('get', function(obj, key) {
            if (!obj || typeof obj !== 'object') return 0;
            return obj[key] || 0;
        });

        // Helper pour obtenir la formule de dé en mode unsafe
        Handlebars.registerHelper('getUnsafeFormula', function(safeValue) {
            const safeToUnsafe = {
                "1d4": "1d4",   // Degré 1
                "2d4": "1d8",   // Degré 2
                "3d4": "1d12",  // Degré 3
                "4d4": "1d16",  // Degré 4
                "5d4": "1d20",  // Degré 5
                "6d4": "1d24"   // Degré 6
            };
            return safeToUnsafe[safeValue] || safeValue;
    });

    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    foundry.documents.collections.Actors.registerSheet("voidHorizon", HeroSheet, {
        types: ["heros"],
        makeDefault: true
    });
}); 