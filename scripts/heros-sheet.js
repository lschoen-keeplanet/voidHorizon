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
        // Données de l'acteur et du système
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
            const arcaneValue = data.actor.system.arcane?.value || "2d4";
            const manaPerLevel = {
                "2d4": 2,   // Insensible
                "3d4": 4,   // Eveillé
                "4d4": 6,   // Novice
                "5d4": 8,   // Initié
                "6d4": 10,  // Maître
                "7d4": 12   // Archimage
            };
            const maxMana = manaPerLevel[arcaneValue] || 2;
            data.actor.system.mana.value = maxMana;
            data.actor.system.mana.max = maxMana;
        }
        
        // Préparation des statistiques principales
        data.system = {
            ...data.system,
            acuite: {
                value: data.actor.system.acuite?.value || "2d4",
                label: "acuité"
            },
            pimpance: {
                value: data.actor.system.pimpance?.value || "2d4",
                label: "Pimpance"
            },
            martialite: {
                value: data.actor.system.martialite?.value || "2d4",
                label: "Martialité"
            },
            arcane: {
                value: data.actor.system.arcane?.value || "2d4",
                label: "Arcane"
            },
            agilite: {
                value: data.actor.system.agilite?.value || "2d4",
                label: "Agilité"
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
        if (!data.actor.system.acuite) data.actor.system.acuite = { value: "2d4" };
        if (!data.actor.system.pimpance) data.actor.system.pimpance = { value: "2d4" };
        if (!data.actor.system.martialite) data.actor.system.martialite = { value: "2d4" };
        if (!data.actor.system.arcane) data.actor.system.arcane = { value: "2d4" };
        if (!data.actor.system.agilite) data.actor.system.agilite = { value: "2d4" };
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
            data.actor.system.armor = { name: "", type: "tissu", description: "" };
        }
        
        // Ajouter les helpers pour le template
        data.helpers = {
            getSelectedText: (value, type) => {
                // Helper getSelectedText appelé
                const mappings = {
                    martialite: {
                        "2d4": "Incompétent",
                        "3d4": "Combatif",
                        "4d4": "Soldat",
                        "5d4": "Expérimenté",
                        "6d4": "Vétéran",
                        "7d4": "Légende"
                    },
                    pimpance: {
                        "2d4": "Tâche",
                        "3d4": "Pas top",
                        "4d4": "Honnête",
                        "5d4": "Beau",
                        "6d4": "Splendide",
                        "7d4": "Ramirez"
                    },
                    acuite: {
                        "2d4": "Aveugle",
                        "3d4": "Distrait",
                        "4d4": "Alerte",
                        "5d4": "Vif",
                        "6d4": "Clairvoyant",
                        "7d4": "Fulgurant"
                    },
                    arcane: {
                        "2d4": "Insensible",
                        "3d4": "Eveillé",
                        "4d4": "Novice",
                        "5d4": "Initié",
                        "6d4": "Maître",
                        "7d4": "Archimage"
                    },
                    agilite: {
                        "2d4": "Challengé",
                        "3d4": "Lourdeau",
                        "4d4": "Bien",
                        "5d4": "Rapide",
                        "6d4": "Très rapide",
                        "7d4": "Très très rapide"
                    }
                };
                const result = mappings[type]?.[value] || value;
                // Helper getSelectedText retourne le résultat
                return result;
            },
            // Helper pour obtenir la formule de dé en mode unsafe
            getUnsafeFormula: (safeValue) => {
                const safeToUnsafe = {
                    "2d4": "1d12",  // Degré 1: 2d4 max=8, donc 1d8+4=1d12
                    "3d4": "1d16",  // Degré 2: 3d4 max=12, donc 1d12+4=1d16
                    "4d4": "1d20",  // Degré 3: 4d4 max=16, donc 1d16+4=1d20
                    "5d4": "1d24",  // Degré 4: 5d4 max=20, donc 1d20+4=1d24
                    "6d4": "1d28",  // Degré 5: 6d4 max=24, donc 1d24+4=1d28
                    "7d4": "1d32"   // Degré 6: 7d4 max=28, donc 1d28+4=1d32
                };
                return safeToUnsafe[safeValue] || safeValue;
            },
            // Helper pour obtenir la plage des dés en mode Safe
            getSafeRange: (safeValue) => {
                const rangeMap = {
                    "2d4": "2-8",   // 2d4: min=2, max=8
                    "3d4": "3-12",  // 3d4: min=3, max=12
                    "4d4": "4-16",  // 4d4: min=4, max=16
                    "5d4": "5-20",  // 5d4: min=5, max=20
                    "6d4": "6-24",  // 6d4: min=6, max=24
                    "7d4": "7-28"   // 7d4: min=7, max=28
                };
                return rangeMap[safeValue] || "?";
            },
            // Helper pour obtenir la plage des dés en mode Unsafe
            getUnsafeRange: (safeValue) => {
                const rangeMap = {
                    "2d4": "1-12",  // 1d12: min=1, max=12
                    "3d4": "1-16",  // 1d16: min=1, max=16
                    "4d4": "1-20",  // 1d20: min=1, max=20
                    "5d4": "1-24",  // 1d24: min=1, max=24
                    "6d4": "1-28",  // 1d28: min=1, max=28
                    "7d4": "1-32"   // 1d32: min=1, max=32
                };
                return rangeMap[safeValue] || "?";
            },
            // Helper pour obtenir le malus d'agilité basé sur le type d'armure
            getAgilityPenalty: (actor) => {
                const armorType = actor.system.armor?.type || 'tissu';
                const penaltyMap = {
                    'tissu': 0,      // Pas de malus
                    'legere': -4,    // Malus de 4
                    'lourde': -8,    // Malus de 8
                    'blindee': -16   // Malus de 16
                };
                return penaltyMap[armorType] || 0;
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
        // Boutons d'onglets trouvés
        tabButtons.click(this._onTabButtonClick.bind(this));
        
        // Gestion des traits
        html.find('#create-trait-btn').click(this._onCreateTraitClick.bind(this));
        html.find('#trait-save-btn').click(this._onSaveTraitClick.bind(this));
        html.find('#trait-cancel-btn').click(this._onCancelTraitClick.bind(this));
        html.find('.trait-edit').click(this._onEditTraitClick.bind(this));
        html.find('.trait-delete').click(this._onDeleteTraitClick.bind(this));
        
        // Gestion des compétences
        html.find('#create-skill-btn').click(this._onCreateSkillClick.bind(this));
        html.find('#skill-save-btn').click(this._onSaveSkillClick.bind(this));
        html.find('#skill-cancel-btn').click(this._onCancelSkillClick.bind(this));
        html.find('.skill-edit').click(this._onEditSkillClick.bind(this));
        html.find('.skill-delete').click(this._onDeleteSkillClick.bind(this));
        
        // IMPORTANT: Calculer les bonus des traits AVANT d'initialiser l'état de santé
        this._applyTraitBonuses();
        
        // Initialiser l'état des cœurs et de la santé (après les bonus des traits)
        this._initializeHealthState();
        
        // Recalculer les bonus des traits avant chaque jet de dé
        this._recalculateTraitBonuses();
        
        // Attendre 0.5 secondes puis recalculer tous les éléments de santé pour s'assurer que l'affichage est à jour
        setTimeout(() => {
            console.log("Délai de 0.5 secondes écoulé, recalcul de tous les éléments de santé...");
            this._applyTraitBonuses();
            this._updateShieldsDisplay();
            this._updateHeartsDisplay();
            this._updateManaDisplay();
            this._updateHealthStatus();
            console.log("Recalcul de tous les éléments de santé terminé après délai");
        }, 500);
    }

    /**
     * Initialise l'état des cœurs et boucliers en fonction des valeurs actuelles
     * @private
     */
    _initializeHealthState() {
        // Initialiser les cœurs
        this._initializeHearts();
        
        // Initialiser les boucliers
        this._initializeShields();
        
        // Initialiser les points de mana
        this._initializeMana();
        
        // Mettre à jour l'état de santé
        this._updateHealthStatus();
    }

    /**
     * Initialise l'état des cœurs en fonction de la valeur de blessure
     * @private
     */
    _initializeHearts() {
        const blessure = this.actor.system.resources?.blessure?.value || 0;
        const totalConstitution = this._getTotalConstitution(); // Utiliser la constitution totale avec bonus
        const heartsContainer = this.element.find('.hearts-container');
        
        // Initialisation des cœurs
        
        // Vider le conteneur des cœurs
        heartsContainer.empty();
        
        // Créer le bon nombre de cœurs basé sur la constitution totale
        for (let i = 0; i < totalConstitution; i++) {
            const heartWrapper = $(`
                <div class="heart-wrapper" data-heart-index="${i}">
                    <button class="heart-button alive" data-heart-index="${i}" data-alive="true">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="heart-button dead hidden" data-heart-index="${i}" data-alive="false">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                </div>
            `);
            
            // Attacher l'événement de clic
            heartWrapper.find('.heart-button').click(this._onHeartClick.bind(this));
            
            // Ajouter au conteneur
            heartsContainer.append(heartWrapper);
        }
        
        // Maintenant mettre à jour l'affichage des cœurs existants
        const hearts = this.element.find('.heart-wrapper');
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                // Ce cœur est "mort" (blessé)
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
                // Cœur initialisé comme mort
            } else {
                // Ce cœur est "vivant" (non blessé)
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
                // Cœur initialisé comme vivant
            }
        });
        
        // Cœurs créés et initialisés
    }

    /**
     * Initialise l'état des boucliers d'armure
     * @private
     */
    _initializeShields() {
        const armorDamage = this.actor.system.resources?.armorDamage?.value || 0;
        
        // S'assurer que les bonus des traits sont calculés
        if (!this.actor.system.traitBonuses) {
            console.log("Bonus des traits non calculés, calcul en cours...");
            this._applyTraitBonuses();
        }
        
        const totalArmor = this._getTotalArmor(); // Utiliser l'armure totale avec bonus
        
        // Debug: Initialisation des boucliers
        console.log(`ARMURE: base=${this.actor.system.resources?.armor?.value || 0}, traits=${this.actor.system.traitBonuses?.armor || 0}, équipement=${this._getArmorTypeBonus()}, boucliers=${this._getShieldBonus()}, TOTAL=${totalArmor}, dégâts=${armorDamage}`);
        
        // Les boucliers sont déjà générés par le template HTML
        // On doit juste mettre à jour leur état
        this._updateShieldsDisplay();
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

        // Si c'est un champ d'armure de base ou de constitution, utiliser le système de sauvegarde différée
        if (name === "system.resources.armor.value" || name === "system.constitution.value") {
            // Stocker le changement en mémoire sans sauvegarder
            if (!this._pendingWeaponChanges) {
                this._pendingWeaponChanges = {};
            }
            this._pendingWeaponChanges[name] = value;
            
            console.log(`Changement en attente pour ${name}: ${value}`);
            
            if (name === "system.resources.armor.value") {
                // Répliquer en mémoire pour un rendu immédiat cohérent
                if (!this.actor.system.resources) this.actor.system.resources = {};
                if (!this.actor.system.resources.armor) this.actor.system.resources.armor = {};
                this.actor.system.resources.armor.value = value;
                // Mettre à jour l'affichage local sans sauvegarder
                this._updateLocalArmorDisplay(value);
                
                // Note: _updateShieldsDisplay() est appelé par _updateLocalArmorDisplay()
            } else if (name === "system.constitution.value") {
                // Mettre à jour l'affichage local sans sauvegarder
                this._updateLocalConstitutionDisplay(value);
                
                // Note: _updateHeartsDisplay() et _updateHealthStatus() sont appelés par _updateLocalConstitutionDisplay()
            }
            return;
        }
        
        // Si c'est un champ d'armure d'équipement, l'ignorer complètement (géré par _onWeaponFieldChange)
        if (name === "system.armor.bonus") {
            console.log(`Champ d'armure d'équipement ${name} ignoré dans _onResourceChange (géré par _onWeaponFieldChange)`);
            return;
        }

        // Pour les autres champs numériques, pas de traitement automatique
        console.log(`Champ numérique non géré: ${name}`);
        console.log("=== Fin Debug Resource Change ===");
    }

    _updateHeartsDisplay() {
        const totalConstitution = this._getTotalConstitution();
        const blessure = this.actor.system.resources?.blessure?.value || 0;
        const hearts = this.element.find('.heart-wrapper');
        
        console.log(`=== Debug Hearts Display ===`);
        console.log(`Constitution totale (base + bonus): ${totalConstitution}`);
        console.log(`Blessures actuelles: ${blessure}`);
        console.log(`Cœurs trouvés: ${hearts.length}`);
        
        // Si le nombre de cœurs ne correspond pas à la constitution totale, forcer le re-render
        if (hearts.length !== totalConstitution) {
            console.log(`Nombre de cœurs incorrect (${hearts.length} vs ${totalConstitution}), re-render nécessaire`);
            // Ne pas appeler _applyTraitBonuses ici pour éviter la boucle infinie
            // Les bonus des traits sont déjà calculés et stockés
            this.render(true);
            return;
        }
        
        // Mettre à jour l'affichage des cœurs existants
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                // Ce cœur est "mort" (blessé)
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
                console.log(`Cœur ${heartIndex} affiché comme mort`);
            } else {
                // Ce cœur est "vivant" (non blessé)
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
                console.log(`Cœur ${heartIndex} affiché comme vivant`);
            }
        });
        
        console.log(`=== Fin Debug Hearts Display ===`);
    }

    /**
     * Met à jour l'affichage des boucliers en fonction de la valeur d'armure
     * @private
     */
    _updateShieldsDisplay() {
        // Ne pas appeler _applyTraitBonuses ici pour éviter la boucle infinie
        // Les bonus des traits sont déjà calculés et stockés dans this.actor.system.traitBonuses
        
        const totalArmor = this._getTotalArmor();
        const armorDamage = parseInt(this.actor.system.resources?.armorDamage?.value) || 0;
        const shields = this.element.find('.shield-wrapper');
        
        console.log(`Boucliers: total=${totalArmor}, dégâts=${armorDamage}, trouvés=${shields.length}`);
        
        // Si le nombre de boucliers ne correspond pas à l'armure totale, forcer le re-render
        if (shields.length !== totalArmor) {
            console.log(`Nombre de boucliers incorrect (${shields.length} vs ${totalArmor}), re-render nécessaire`);
            // Forcer la mise à jour des données en mémoire avant le re-render
            this.render(true);
            return;
        }
        
        // Mettre à jour l'affichage des boucliers existants
        shields.each((index, wrapper) => {
            const shieldIndex = index;
            const activeButton = wrapper.querySelector('.active');
            const brokenButton = wrapper.querySelector('.broken');
            
            // Vérification de sécurité
            if (!activeButton || !brokenButton) {
                console.error("Boutons d'armure non trouvés:", { activeButton, brokenButton });
                return;
            }
            
            if (shieldIndex < armorDamage) {
                // Ce bouclier est cassé
                activeButton.classList.add('hidden');
                brokenButton.classList.remove('hidden');
            } else {
                // Ce bouclier est actif
                activeButton.classList.remove('hidden');
                brokenButton.classList.add('hidden');
            }
        });
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
                "2d4": 2,   // Insensible
                "3d4": 4,   // Eveillé
                "4d4": 6,   // Novice
                "5d4": 8,   // Initié
                "6d4": 10,  // Maître
                "7d4": 12   // Archimage
            };
            const newMaxMana = manaPerLevel[value] || 2;
            
            // Mettre à jour seulement l'affichage local, pas la sauvegarde
            this.actor.system.mana.max = newMaxMana;
            this.actor.system.mana.value = newMaxMana;
            
            // Mettre à jour l'affichage du mana
            this._updateManaDisplay();
            
            // Mettre à jour l'affichage des valeurs totales de mana
            this._updateManaTotalDisplay();
            
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
            
            // Si c'est une caractéristique qui affecte les bonus des traits, recalculer et mettre à jour l'affichage
            if (['martialite', 'pimpance', 'acuite', 'arcane', 'agilite'].includes(statName)) {
                console.log(`Caractéristique ${statName} mise à jour, recalcul des bonus des traits...`);
                
                // IMPORTANT: Forcer la mise à jour des helpers Handlebars
                this._applyTraitBonuses();
                
                // Mettre à jour l'affichage des valeurs totales
                this._updateTotalValuesDisplay();
                
                // Forcer la mise à jour des cœurs et boucliers
                this._updateHeartsDisplay();
                this._updateShieldsDisplay();
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
        console.log(`Affichage local de l'armure mis à jour: ${value}`);
        
        // Mettre à jour les données en mémoire pour que les calculs incluent les bonus
        if (!this.actor.system.resources) this.actor.system.resources = {};
        if (!this.actor.system.resources.armor) this.actor.system.resources.armor = {};
        this.actor.system.resources.armor.value = value;
        
        // Ne pas appeler _applyTraitBonuses ici pour éviter la boucle infinie
        // Les bonus des traits sont déjà calculés et stockés
        
        // Mettre à jour l'affichage des valeurs totales d'armure
        this._updateArmorTotalDisplay();
        
        // Forcer la mise à jour de l'affichage des boucliers
        this._updateShieldsDisplay();
    }

    /**
     * Met à jour l'affichage local de la constitution sans sauvegarder
     * @param {number} value - La nouvelle valeur de constitution
     * @private
     */
    _updateLocalConstitutionDisplay(value) {
        // Mettre à jour l'affichage local de la constitution
        console.log(`Affichage local de la constitution mis à jour: ${value}`);
        
        // Mettre à jour les données en mémoire pour que les calculs incluent les bonus
        if (!this.actor.system.constitution) this.actor.system.constitution = {};
        this.actor.system.constitution.value = value;
        
        // Ne pas appeler _applyTraitBonuses ici pour éviter la boucle infinie
        // Les bonus des traits sont déjà calculés et stockés
        
        // Mettre à jour l'affichage des valeurs totales de constitution
        this._updateConstitutionTotalDisplay();
        
        // Forcer la mise à jour de l'affichage des cœurs
        this._updateHeartsDisplay();
        
        // Mettre à jour l'état de santé
        this._updateHealthStatus();
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
                "2d4": "Incompétent",
                "3d4": "Combatif",
                "4d4": "Soldat",
                "5d4": "Expérimenté",
                "6d4": "Vétéran",
                "7d4": "Légende"
            },
            'pimpance': {
                "2d4": "Tâche",
                "3d4": "Pas top",
                "4d4": "Honnête",
                "5d4": "Beau",
                "6d4": "Splendide",
                "7d4": "Ramirez"
            },
            'acuite': {
                "2d4": "Aveugle",
                "3d4": "Distrait",
                "4d4": "Alerte",
                "5d4": "Vif",
                "6d4": "Clairvoyant",
                "7d4": "Fulgurant"
            },
            'arcane': {
                "2d4": "Insensible",
                "3d4": "Eveillé",
                "4d4": "Novice",
                "5d4": "Initié",
                "6d4": "Maître",
                "7d4": "Archimage"
            },
            'agilite': {
                "2d4": "Challengé",
                "3d4": "Lourdeau",
                "4d4": "Bien",
                "5d4": "Rapide",
                "6d4": "Très rapide",
                "7d4": "Très très rapide"
            }
        };
        
        return mappings[statName]?.[value] || value;
    }

    /**
     * Obtient la valeur totale de constitution incluant les bonus des traits
     * @returns {number} - Valeur totale de constitution
     * @private
     */
    _getTotalConstitution() {
        const baseConstitution = parseInt(this.actor.system.constitution?.value) || 0;
        const traitBonus = this.actor.system.traitBonuses?.constitution || 0;
        
        console.log(`=== Debug Constitution ===`);
        console.log(`Base constitution: ${baseConstitution}`);
        console.log(`Bonus traits: ${traitBonus}`);
        console.log(`TraitBonuses object:`, this.actor.system.traitBonuses);
        console.log(`Total: ${baseConstitution + traitBonus}`);
        console.log(`=== Fin Debug Constitution ===`);
        
        // Note: Les bonus d'équipement pour la constitution pourront être ajoutés ici plus tard
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
        const equipmentBonus = this._getArmorTypeBonus();
        
        // Calculer le bonus des boucliers d'armes
        let shieldBonus = 0;
        if (this.actor.system.weapons?.primary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.primary.bonus) || 0;
        }
        if (this.actor.system.weapons?.secondary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.secondary.bonus) || 0;
        }
        
        // Armure totale = base + équipement + traits + boucliers
        const totalArmor = baseArmor + equipmentBonus + traitBonus + shieldBonus;
        
        // Debug temporaire pour tester le calcul
        console.log(`CALCUL ARMURE: base=${baseArmor}, équipement=${equipmentBonus}, traits=${traitBonus}, boucliers=${shieldBonus}, TOTAL=${totalArmor}`);
        
        return totalArmor;
    }

    _getArmorTypeBonus() {
        const armorType = this.actor.system.armor?.type || 'tissu';
        const bonusMap = {
            'tissu': 0,
            'legere': 1,
            'lourde': 2,
            'blindee': 4
        };
        return bonusMap[armorType] || 0;
    }

    /**
     * Calcule le malus d'agilité basé sur le type d'armure
     * @returns {number} - Malus d'agilité (négatif)
     * @private
     */
    _getAgilityPenalty() {
        const armorType = this.actor.system.armor?.type || 'tissu';
        const penaltyMap = {
            'tissu': 0,      // Pas de malus
            'legere': -4,    // Malus de 4
            'lourde': -8,    // Malus de 8
            'blindee': -16   // Malus de 16
        };
        return penaltyMap[armorType] || 0;
    }
    
    /**
     * Calcule le bonus des boucliers d'armes
     * @returns {number} - Bonus total des boucliers
     * @private
     */
    _getShieldBonus() {
        let shieldBonus = 0;
        
        // Vérifier la main principale
        if (this.actor.system.weapons?.primary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.primary.bonus) || 0;
        }
        
        // Vérifier la main secondaire
        if (this.actor.system.weapons?.secondary?.type === 'shield') {
            shieldBonus += parseInt(this.actor.system.weapons.secondary.bonus) || 0;
        }
        
        return shieldBonus;
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
            agilite: this._calculateTraitBonus('agilite')
        };
        
        // Stocker les bonus dans l'acteur pour utilisation ultérieure (en mémoire seulement)
        this.actor.system.traitBonuses = bonuses;
        
        console.log('Bonus des traits appliqués:', bonuses);
        
        // Si les bonus d'armure ou de constitution ont changé, stocker les anciens bonus pour comparaison
        const oldArmorBonus = this._lastArmorBonus || 0;
        const oldConstitutionBonus = this._lastConstitutionBonus || 0;
        const oldArcaneBonus = this._lastArcaneBonus || 0;
        
        // Stocker les nouveaux bonus pour la prochaine comparaison
        this._lastArmorBonus = bonuses.armor;
        this._lastConstitutionBonus = bonuses.constitution;
        this._lastArcaneBonus = bonuses.arcane;
        
        // Note: Ne pas appeler _updateShieldsDisplay ou _updateHeartsDisplay ici
        // Ces méthodes seront appelées séparément quand nécessaire
    }

    /**
     * Met à jour l'affichage de l'état de santé
     * @private
     */
    _updateHealthStatus() {
        const totalConstitution = this._getTotalConstitution();
        const blessure = this.actor.system.resources.blessure?.value || 0;
        const totalArmor = this._getTotalArmor();
        const armorDamage = this.actor.system.resources.armorDamage?.value || 0;
        const remainingHearts = totalConstitution - blessure;
        
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
        
        // État de santé calculé
        
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
     * Met à jour l'affichage des cœurs
     * @private
     */
    _updateHeartsDisplay() {
        const totalConstitution = this._getTotalConstitution();
        const blessure = this.actor.system.resources?.blessure?.value || 0;
        const hearts = this.element.find('.heart-wrapper');
        
        console.log(`=== Debug Hearts Display ===`);
        console.log(`Constitution totale (base + bonus): ${totalConstitution}`);
        console.log(`Blessures actuelles: ${blessure}`);
        console.log(`Cœurs trouvés: ${hearts.length}`);
        
        // Si le nombre de cœurs ne correspond pas à la constitution totale, forcer le re-render
        if (hearts.length !== totalConstitution) {
            console.log(`Nombre de cœurs incorrect (${hearts.length} vs ${totalConstitution}), re-render nécessaire`);
            // Ne pas appeler _applyTraitBonuses ici pour éviter la boucle infinie
            // Les bonus des traits sont déjà calculés et stockés
            this.render(true);
            return;
        }
        
        // Mettre à jour l'affichage des cœurs existants
        hearts.each((index, wrapper) => {
            const heartIndex = index;
            const aliveButton = wrapper.querySelector('.alive');
            const deadButton = wrapper.querySelector('.dead');
            
            if (heartIndex < blessure) {
                // Ce cœur est "mort" (blessé)
                aliveButton.classList.add('hidden');
                deadButton.classList.remove('hidden');
                console.log(`Cœur ${heartIndex} affiché comme mort`);
            } else {
                // Ce cœur est "vivant" (non blessé)
                aliveButton.classList.remove('hidden');
                deadButton.classList.add('hidden');
                console.log(`Cœur ${heartIndex} affiché comme vivant`);
            }
        });
        
        console.log(`=== Fin Debug Hearts Display ===`);
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
        const arcaneValue = this.actor.system.arcane?.value || "2d4";
        const manaPerLevel = {
            "2d4": 2,   // Insensible
            "3d4": 4,   // Eveillé
            "4d4": 6,   // Novice
            "5d4": 8,   // Initié
            "6d4": 10,  // Maître
            "7d4": 12   // Archimage
        };
        return manaPerLevel[arcaneValue] || 2;
    }

    /**
     * Applique les bonus des boucliers à l'armure
     * @private
     */
    _applyShieldBonuses() {
        let totalArmorBonus = 0;
        
        // Vérifier la main principale
        if (this.actor.system.weapons?.primary?.type === 'shield') {
            const shield = this.actor.system.weapons.primary;
            const bonus = parseInt(shield.bonus) || 0;
            totalArmorBonus += bonus;
        }
        
        // Vérifier la main secondaire
        if (this.actor.system.weapons?.secondary?.type === 'shield') {
            const shield = this.actor.system.weapons.secondary;
            const bonus = parseInt(shield.bonus) || 0;
            totalArmorBonus += bonus;
        }
        
        return { armorBonus: totalArmorBonus };
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
        const currentValue = this.actor.system.resources?.blessure?.value || 0;
        const maxConstitution = this._getTotalConstitution();
        
        let newValue;
        if (isAlive) {
            // Le cœur était vivant, on le tue (ajoute une blessure)
            newValue = currentValue + 1;
            // Vérifier qu'on ne dépasse pas la constitution maximale
            if (newValue > maxConstitution) {
                console.log("Impossible d'ajouter plus de blessures que de constitution");
                return;
            }
        } else {
            // Le cœur était mort, on le ressuscite (retire une blessure)
            newValue = currentValue - 1;
            // Vérifier qu'on ne descend pas en dessous de 0
            if (newValue < 0) {
                console.log("Impossible d'avoir moins de 0 blessures");
                return;
            }
        }
        
        console.log(`Blessures: ${currentValue} -> ${newValue} (max: ${maxConstitution})`);
        
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
            
            // Forcer la mise à jour de l'affichage des cœurs
            this._updateHeartsDisplay();
            
            console.log("Points de vie mis à jour avec succès");
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
            // Le cœur était vivant, on le tue (ajoute une blessure)
            aliveButton.classList.add('hidden');
            deadButton.classList.remove('hidden');
            console.log("Cœur marqué comme mort");
        } else {
            // Le cœur était mort, on le ressuscite (retire une blessure)
            aliveButton.classList.remove('hidden');
            deadButton.classList.add('hidden');
            console.log("Cœur marqué comme vivant");
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
        const currentDamage = this.actor.system.resources?.armorDamage?.value || 0;
        const newDamage = isActive ? currentDamage + 1 : currentDamage - 1;
        
        // S'assurer que les dégâts ne descendent pas en dessous de 0
        const finalDamage = Math.max(0, newDamage);
        
        console.log(`Dégâts d'armure: ${currentDamage} -> ${finalDamage}`);
        
        try {
            // Mettre à jour l'acteur avec la nouvelle valeur de dégâts d'armure
            const updateData = {
                'system.resources.armorDamage.value': finalDamage
            };
            
            console.log("Mise à jour des boucliers:", updateData);
            await this.actor.update(updateData);
            
            // Mettre à jour l'affichage des boutons
            this._updateShieldDisplay(shieldWrapper, isActive);
            
            // Forcer la mise à jour de l'affichage des boucliers
            this._updateShieldsDisplay();
            
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
            // Le bouclier était actif, on le casse (ajoute des dégâts)
            activeButton.classList.add('hidden');
            brokenButton.classList.remove('hidden');
            console.log("Bouclier marqué comme cassé");
        } else {
            // Le bouclier était cassé, on le répare (retire des dégâts)
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
     * Gère le clic sur le bouton de création de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onCreateSkillClick(event) {
        event.preventDefault();
        console.log('=== CRÉATION DE COMPÉTENCE ===');
        
        // Masquer le formulaire des traits s'il est ouvert
        this.element.find('#trait-form-container').hide();
        
        // Afficher le formulaire de création de compétence
        const formContainer = this.element.find('#skill-form-container');
        formContainer.show();
        
        // Réinitialiser le formulaire
        this.element.find('#skill-name-input').val('');
        this.element.find('#skill-description-input').val('');
        this.element.find('#skill-characteristic-input').val('');
        this.element.find('#skill-mastery-input').val('2d4');
        
        // Changer le titre et le bouton de sauvegarde
        formContainer.find('h4').text('Nouvelle compétence');
        formContainer.find('#skill-save-btn').text('Sauvegarder').removeAttr('data-edit-skill-id');
        
        // Focus sur le premier champ
        this.element.find('#skill-name-input').focus();
    }

    /**
     * Gère le clic sur le bouton de sauvegarde de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onSaveSkillClick(event) {
        event.preventDefault();
        console.log('=== SAUVEGARDE DE COMPÉTENCE ===');
        
        // Récupérer les valeurs du formulaire
        const name = this.element.find('#skill-name-input').val().trim();
        const description = this.element.find('#skill-description-input').val().trim();
        const characteristic = this.element.find('#skill-characteristic-input').val();
        const mastery = this.element.find('#skill-mastery-input').val();
        const isEdit = this.element.find('#skill-save-btn').attr('data-edit-skill-id');
        
        // Validation des champs
        if (!name) {
            ui.notifications.error('Le nom de la compétence est requis');
            this.element.find('#skill-name-input').focus();
            return;
        }
        
        if (!characteristic) {
            ui.notifications.error('La caractéristique associée est requise');
            this.element.find('#skill-characteristic-input').focus();
            return;
        }
        
        try {
            // Préparer les données de la compétence
            const skillData = {
                name: name,
                description: description,
                characteristic: characteristic,
                mastery: mastery
            };
            
            console.log('Données de la compétence:', skillData);
            
            // Initialiser les compétences si elles n'existent pas
            if (!this.actor.system.skills) {
                this.actor.system.skills = {};
            }
            
            let skillId;
            if (isEdit) {
                // Mode édition : mettre à jour la compétence existante
                skillId = isEdit;
                this.actor.system.skills[skillId] = skillData;
                console.log('Compétence mise à jour:', skillId);
            } else {
                // Mode création : générer un nouvel ID
                skillId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                this.actor.system.skills[skillId] = skillData;
                console.log('Nouvelle compétence créée:', skillId);
            }
            
            // Mettre à jour l'acteur
            const updateData = {
                [`system.skills.${skillId}`]: skillData
            };
            
            await this.actor.update(updateData);
            console.log('Compétence sauvegardée avec succès');
            
            // Masquer le formulaire
            this.element.find('#skill-form-container').hide();
            
            // Notification de succès
            const action = isEdit ? 'modifiée' : 'créée';
            ui.notifications.info(`Compétence "${name}" ${action} avec succès`);
            
            // Recharger la fiche pour afficher les changements
            this.render(true);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la compétence:', error);
            ui.notifications.error('Erreur lors de la sauvegarde de la compétence');
        }
    }

    /**
     * Gère le clic sur le bouton d'annulation de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onCancelSkillClick(event) {
        event.preventDefault();
        console.log('=== ANNULATION DE COMPÉTENCE ===');
        
        // Masquer le formulaire
        this.element.find('#skill-form-container').hide();
        
        // Réinitialiser le formulaire
        this.element.find('#skill-name-input').val('');
        this.element.find('#skill-description-input').val('');
        this.element.find('#skill-characteristic-input').val('');
        this.element.find('#skill-mastery-input').val('2d4');
    }

    /**
     * Gère le clic sur le bouton d'édition de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    _onEditSkillClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const skillId = button.data('skill-id');
        
        console.log('=== ÉDITION DE COMPÉTENCE ===');
        console.log('Compétence ID:', skillId);
        
        const skill = this.actor.system.skills?.[skillId];
        if (!skill) {
            console.error('Compétence non trouvée pour ID:', skillId);
            ui.notifications.error('Compétence non trouvée');
            return;
        }
        
        console.log('Compétence à éditer:', skill);
        
        // Masquer le formulaire des traits s'il est ouvert
        this.element.find('#trait-form-container').hide();
        
        // Afficher le formulaire avec les données de la compétence
        const formContainer = this.element.find('#skill-form-container');
        formContainer.show();
        
        // Remplir les champs avec les données existantes
        this.element.find('#skill-name-input').val(skill.name);
        this.element.find('#skill-description-input').val(skill.description);
        this.element.find('#skill-characteristic-input').val(skill.characteristic);
        this.element.find('#skill-mastery-input').val(skill.mastery);
        
        // Changer le titre et le bouton de sauvegarde
        formContainer.find('h4').text('Modifier la compétence');
        formContainer.find('#skill-save-btn').text('Modifier').attr('data-edit-skill-id', skillId);
        
        // Focus sur le premier champ
        this.element.find('#skill-name-input').focus();
    }

    /**
     * Gère le clic sur le bouton de suppression de compétence
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onDeleteSkillClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const skillId = button.data('skill-id');
        
        console.log('=== SUPPRESSION DE COMPÉTENCE ===');
        console.log('Compétence ID:', skillId);
        
        const skill = this.actor.system.skills?.[skillId];
        if (!skill) {
            console.error('Compétence non trouvée pour ID:', skillId);
            ui.notifications.error('Compétence non trouvée');
            return;
        }
        
        console.log('Compétence à supprimer:', skill);
        
        // Demander confirmation
        const confirmed = await new Promise((resolve) => {
            new Dialog({
                title: 'Confirmer la suppression',
                content: `<p>Êtes-vous sûr de vouloir supprimer la compétence "${skill.name}" ?</p>`,
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
            // Supprimer la compétence
            const currentSkills = { ...this.actor.system.skills };
            delete currentSkills[skillId];
            
            console.log('Suppression de la compétence:', skillId);
            console.log('Compétences restantes:', currentSkills);
            
            // Mettre à jour l'acteur
            const updateData = {
                'system.skills': currentSkills
            };
            
            await this.actor.update(updateData);
            console.log('Compétence supprimée avec succès');
            
            // Notification de succès
            ui.notifications.info(`Compétence "${skill.name}" supprimée avec succès`);
            
            // Recharger la fiche pour afficher les changements
            this.render(true);
            
        } catch (error) {
            console.error('Erreur lors de la suppression de la compétence:', error);
            ui.notifications.error('Erreur lors de la suppression de la compétence');
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
        
        console.log(`Type d'équipement changé: ${field} = ${value}`);
        
        // Appliquer les bonus des boucliers immédiatement pour l'affichage
        this._applyShieldBonuses();
    }

    /**
     * Gère les changements d'armes et d'armure (sans sauvegarde automatique)
     * @param {Event} event - L'événement de changement
     * @private
     */
    _onWeaponFieldChange(event) {
        event.preventDefault();
        const input = event.target;
        const field = input.name;
        const value = input.value;
        
        console.log(`Changement d'équipement: ${field} = ${value}`);
        
        // Si c'est un changement de type d'armure, mettre à jour l'affichage des boucliers et des valeurs totales
        if (field === 'system.armor.type') {
            // Répliquer en mémoire pour un rendu immédiat cohérent
            if (!this.actor.system.armor) this.actor.system.armor = {};
            this.actor.system.armor.type = value;
            
            // Mettre à jour l'affichage des valeurs totales d'armure
            this._updateArmorTotalDisplay();
            
            // Mettre à jour l'affichage des boucliers
            this._updateShieldsDisplay();
        }
        
        // Si c'est un changement de type d'arme (pour les boucliers), mettre à jour l'affichage
        if (field.includes('system.weapons.') && field.endsWith('.type')) {
            // Mettre à jour l'affichage des valeurs totales d'armure
            this._updateArmorTotalDisplay();
            
            // Mettre à jour l'affichage des boucliers
            this._updateShieldsDisplay();
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
            weaponsSection.classList.remove('editing');
            weaponsSection.classList.add('read-only');
            event.currentTarget.querySelector('i').classList.remove('fa-save');
            event.currentTarget.querySelector('i').classList.add('fa-edit');
        } else {
            // Mode édition - initialiser les changements en attente
            weaponsSection.classList.remove('read-only');
            weaponsSection.classList.add('editing');
            event.currentTarget.querySelector('i').classList.remove('fa-edit');
            event.currentTarget.querySelector('i').classList.add('fa-save');
        }
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
            form.classList.remove('editing');
            form.classList.add('read-only');
            event.currentTarget.querySelector('i').classList.remove('fa-save');
            event.currentTarget.querySelector('i').classList.add('fa-edit');
            event.currentTarget.querySelector('.button-text').textContent = 'Éditer';
        } else {
            // Mode édition - initialiser les changements en attente
            form.classList.remove('read-only');
            form.classList.add('editing');
            event.currentTarget.querySelector('i').classList.remove('fa-edit');
            event.currentTarget.querySelector('i').classList.add('fa-save');
            event.currentTarget.querySelector('.button-text').textContent = 'Sauvegarder';
        }
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
                "2d4": 2,   // Insensible
                "3d4": 4,   // Eveillé
                "4d4": 6,   // Novice
                "5d4": 8,   // Initié
                "6d4": 10,  // Maître
                "7d4": 12   // Archimage
            };
            const newMaxMana = manaPerLevel[value] || 2;
            
            // Mettre à jour seulement l'affichage local, pas la sauvegarde
            this.actor.system.mana.max = newMaxMana;
            this.actor.system.mana.value = newMaxMana;
            
            // Mettre à jour l'affichage du mana
            this._updateManaDisplay();
            
            // Mettre à jour l'affichage des valeurs totales de mana
            this._updateManaTotalDisplay();
            
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
            console.log(`Changement d'arme en attente pour ${field}: ${input.value}`);
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
     * Gère les lancers de dés pour les statistiques
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollStat(event) {
        event.preventDefault();
        const stat = event.currentTarget.dataset.stat;
        console.log(`Lancement de dés pour ${stat} (mode Safe par défaut)`);
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        try {
            // Obtenir la valeur de la caractéristique
            const statValue = this.actor.system[stat]?.value || "2d4";
            console.log(`Valeur de ${stat}: ${statValue}`);
            
            // Lancer en mode Safe par défaut
            const diceFormula = statValue;
            console.log(`Formule de dés (Safe): ${diceFormula}`);
            
            // Lancer les dés
            const rollData = await this._rollDice(diceFormula, stat, false);
            
            // Afficher le résultat
            this._displayRollResult(rollData, stat, false);
            
        } catch (error) {
            console.error(`Erreur lors du lancement de dés pour ${stat}:`, error);
            ui.notifications.error(`Erreur lors du lancement de dés pour ${stat}`);
        }
    }

    /**
     * Gère les lancers de dés avec les boutons Safe/Unsafe
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollDice(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const stat = button.dataset.stat;
        const isUnsafe = button.dataset.unsafe === "true";
        
        console.log(`Lancement de dés ${stat} (${isUnsafe ? 'Unsafe' : 'Safe'})`);
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        try {
            // Obtenir la valeur de la caractéristique
            const statValue = this.actor.system[stat]?.value || "1d4";
            console.log(`Valeur de ${stat}: ${statValue}`);
            
            // Calculer la formule de dés selon le mode
            const diceFormula = this._calculateDiceFormula(statValue, isUnsafe);
            console.log(`Formule de dés: ${diceFormula}`);
            
            // Lancer les dés
            const roll = await this._rollDice(diceFormula, stat, isUnsafe);
            
            // Afficher le résultat
            this._displayRollResult(roll, stat, isUnsafe);
            
        } catch (error) {
            console.error(`Erreur lors du lancement de dés pour ${stat}:`, error);
            ui.notifications.error(`Erreur lors du lancement de dés pour ${stat}`);
        }
    }

    /**
     * Calcule la formule de dés selon le mode Safe/Unsafe
     * @param {string} statValue - La valeur de la caractéristique (ex: "3d4")
     * @param {boolean} isUnsafe - Si c'est en mode unsafe
     * @returns {string} - La formule de dés à lancer
     * @private
     */
                    _calculateDiceFormula(statValue, isUnsafe) {
                    console.log(`Calcul formule dés: ${statValue}, unsafe: ${isUnsafe}`);

                    if (!isUnsafe) {
                        // Mode Safe: retourner la valeur telle quelle (ex: "3d4")
                        console.log(`Mode Safe: formule = ${statValue}`);
                        return statValue;
                    } else {
                        // Mode Unsafe: convertir selon la table de conversion et ajouter 4 aux faces
                        const safeToUnsafe = {
                            "2d4": "1d12",  // Degré 1: 2d4 max=8, donc 1d8+4=1d12
                            "3d4": "1d16",  // Degré 2: 3d4 max=12, donc 1d12+4=1d16
                            "4d4": "1d20",  // Degré 3: 4d4 max=16, donc 1d16+4=1d20
                            "5d4": "1d24",  // Degré 4: 5d4 max=20, donc 1d20+4=1d24
                            "6d4": "1d28",  // Degré 5: 6d4 max=24, donc 1d24+4=1d28
                            "7d4": "1d32"   // Degré 6: 7d4 max=28, donc 1d28+4=1d32
                        };
                        const unsafeFormula = safeToUnsafe[statValue] || statValue;
                        console.log(`Mode Unsafe: ${statValue} -> ${unsafeFormula}`);
                        return unsafeFormula;
                    }
                }
    
    /**
     * Lance les dés avec la formule donnée et applique les bonus de traits
     * @param {string} diceFormula - La formule de dés (ex: "3d4" ou "1d12")
     * @param {string} stat - Le nom de la caractéristique
     * @param {boolean} isUnsafe - Si c'est en mode unsafe
     * @returns {Promise<Object>} - Le résultat du lancer avec bonus
     * @private
     */
    async _rollDice(diceFormula, stat, isUnsafe) {
        // Créer un objet Roll avec la formule
        const roll = new Roll(diceFormula);
        
        // Lancer les dés
        await roll.evaluate({async: true});
        
        // Récupérer le bonus de trait pour cette caractéristique
        const traitBonus = this.actor.system.traitBonuses?.[stat] || 0;
        
        // Calculer le résultat final avec bonus
        const baseResult = roll.total;
        const finalResult = baseResult + traitBonus;
        
        console.log(`Lancer de ${diceFormula} pour ${stat} (${isUnsafe ? 'Unsafe' : 'Safe'}): ${baseResult} + bonus trait ${traitBonus} = ${finalResult}`);
        
        return {
            roll: roll,
            baseResult: baseResult,
            traitBonus: traitBonus,
            finalResult: finalResult
        };
    }
    
    /**
     * Calcule les valeurs min/max d'une formule de dés
     * @param {string} diceFormula - La formule de dés (ex: "3d4" ou "1d12")
     * @returns {Object} - {min: number, max: number}
     * @private
     */
    _calculateDiceRange(diceFormula) {
        const match = diceFormula.match(/(\d+)d(\d+)/);
        if (!match) return { min: 0, max: 0 };
        
        const numDice = parseInt(match[1]);
        const dieSize = parseInt(match[2]);
        
        return {
            min: numDice,
            max: numDice * dieSize
        };
    }

    /**
     * Affiche le résultat du lancer de dés
     * @param {Object} rollData - Le résultat du lancer avec bonus
     * @param {string} stat - Le nom de la caractéristique
     * @param {boolean} isUnsafe - Si c'est en mode unsafe
     * @private
     */
    _displayRollResult(rollData, stat, isUnsafe) {
        const statName = this._getStatName(stat);
        const statLabel = this._getStatLabel(stat, this.actor.system[stat]?.value || "2d4");
        const modeLabel = isUnsafe ? "Unsafe" : "Safe";
        const formula = rollData.roll.formula;
        const baseResult = rollData.baseResult;
        const traitBonus = rollData.traitBonus;
        const finalResult = rollData.finalResult;
        
        // Détecter les succès/échecs critiques pour les jets Unsafe
        let criticalMessage = '';
        if (isUnsafe) {
            const diceRange = this._calculateDiceRange(formula);
            console.log(`DEBUG - Formule: ${formula}, baseResult: ${baseResult}, diceRange:`, diceRange);
            console.log(`DEBUG - Comparaison: baseResult === diceRange.min: ${baseResult === diceRange.min}, baseResult === diceRange.max: ${baseResult === diceRange.max}`);
            
            if (baseResult === diceRange.min) {
                criticalMessage = '<p class="critical-failure">💥 <strong>ÉCHEC CRITIQUE!</strong></p>';
                console.log('DEBUG - ÉCHEC CRITIQUE détecté!');
            } else if (baseResult === diceRange.max) {
                criticalMessage = '<p class="critical-success">⭐ <strong>RÉUSSITE CRITIQUE!</strong></p>';
                console.log('DEBUG - RÉUSSITE CRITIQUE détectée!');
            }
            
            console.log(`DEBUG - criticalMessage final:`, criticalMessage);
        }
        
                            // Créer un message de chat avec le résultat
                    const chatData = {
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        content: `
                            <div class="voidhorizon-roll-result">
                                <h3>🎲 Test de ${statName}</h3>
                                ${criticalMessage}
                                <div class="roll-details">
                                    <p><strong>Degré de maîtrise:</strong> ${statLabel}</p>
                                    <p><strong>Mode:</strong> ${modeLabel}</p>
                                    <p><strong>Formule:</strong> ${formula}</p>
                                    <p><strong>Résultat des dés:</strong> <span class="roll-base">${baseResult}</span></p>
                                    ${traitBonus > 0 ? `<p><strong>Bonus de trait:</strong> <span class="roll-bonus">+${traitBonus}</span></p>` : ''}
                                    <p><strong>Résultat final:</strong> <span class="roll-total">${finalResult}</span></p>
                                </div>
                                <div class="roll-dice">
                                    ${rollData.roll.dice.map(die => `
                                        <div class="die-result">
                                            <span class="die-formula">${die.formula}</span>:
                                            <span class="die-values">[${die.results.map(r => r.result).join(', ')}]</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: rollData.roll
        };
        
        // Envoyer le message dans le chat
        ChatMessage.create(chatData);
        
        // Notification rapide
        ui.notifications.info(`${statName} (${modeLabel}): ${finalResult}`);
    }

    /**
     * Gère les lancers de dés pour les armes
     * @param {Event} event - L'événement de clic
     * @private
     */
    async _onRollWeapon(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const weaponType = button.dataset.weapon;
        
        console.log(`Lancement de dés pour arme ${weaponType}`);
        
        // Recalculer les bonus des traits avant le jet
        this._recalculateTraitBonuses();
        
        // Pour l'instant, juste un log
        ui.notifications.info(`Lancement de dés pour arme ${weaponType} (fonctionnalité à implémenter)`);
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
                "2d4": "Incompétent",
                "3d4": "Combatif",
                "4d4": "Soldat",
                "5d4": "Expérimenté",
                "6d4": "Vétéran",
                "7d4": "Légende"
            },
            'pimpance': {
                "2d4": "Tâche",
                "3d4": "Pas top",
                "4d4": "Honnête",
                "5d4": "Beau",
                "6d4": "Splendide",
                "7d4": "Ramirez"
            },
            'acuite': {
                "2d4": "Aveugle",
                "3d4": "Distrait",
                "4d4": "Alerte",
                "5d4": "Vif",
                "6d4": "Clairvoyant",
                "7d4": "Fulgurant"
            },
            'arcane': {
                "2d4": "Insensible",
                "3d4": "Eveillé",
                "4d4": "Novice",
                "5d4": "Initié",
                "6d4": "Maître",
                "7d4": "Archimage"
            },
            'agilite': {
                "2d4": "Challengé",
                "3d4": "Lourdeau",
                "4d4": "Bien",
                "5d4": "Rapide",
                "6d4": "Très rapide",
                "7d4": "Très très rapide"
            }
        };
        
        return mappings[statName]?.[value] || value;
    }

    /**
     * Retourne le nom de la caractéristique
     * @param {string} statName - Le nom de la statistique
     * @returns {string} - Le nom de la caractéristique
     * @private
     */
    _getStatName(statName) {
        const statNames = {
            'martialite': 'Martialité',
            'pimpance': 'Pimpance',
            'acuite': 'Acuité',
            'arcane': 'Arcane',
            'agilite': 'Agilité'
        };
        
        return statNames[statName] || statName;
    }

    /**
     * Met à jour l'affichage des valeurs totales incluant les bonus des traits
     * @private
     */
    _updateTotalValuesDisplay() {
        console.log("=== Mise à jour de l'affichage des valeurs totales ===");
        
        // Mettre à jour l'affichage de l'armure totale
        this._updateArmorTotalDisplay();
        
        // Mettre à jour l'affichage de la constitution totale
        this._updateConstitutionTotalDisplay();
        
        // Mettre à jour l'affichage du mana total
        this._updateManaTotalDisplay();
        
        console.log("=== Fin mise à jour des valeurs totales ===");
    }
    
    /**
     * Met à jour l'affichage de l'armure totale
     * @private
     */
    _updateArmorTotalDisplay() {
        const totalArmor = this._getTotalArmor();
        const armorBreakdown = this.element.find('.armor-breakdown');
        
        if (armorBreakdown.length > 0) {
            // Mettre à jour la valeur totale
            const totalElement = armorBreakdown.find('.armor-source.total .source-value');
            if (totalElement.length > 0) {
                totalElement.text(totalArmor);
            }
            
            // Mettre à jour les bonus des traits
            const traitBonusElement = armorBreakdown.find('.armor-source[data-source="traits"] .source-value');
            if (traitBonusElement.length > 0) {
                const traitBonus = this.actor.system.traitBonuses?.armor || 0;
                traitBonusElement.text(traitBonus);
            }
            
            // Mettre à jour le bonus d'équipement
            const equipmentBonusElement = armorBreakdown.find('.armor-source[data-source="equipment"] .source-value');
            if (equipmentBonusElement.length > 0) {
                const equipmentBonus = this._getArmorTypeBonus();
                equipmentBonusElement.text(equipmentBonus);
            }
            
            console.log(`Affichage armure totale mis à jour: ${totalArmor}`);
        }
    }
    
    /**
     * Met à jour l'affichage de la constitution totale
     * @private
     */
    _updateConstitutionTotalDisplay() {
        const totalConstitution = this._getTotalConstitution();
        const constitutionBreakdown = this.element.find('.constitution-breakdown');
        
        if (constitutionBreakdown.length > 0) {
            // Mettre à jour la valeur totale
            const totalElement = constitutionBreakdown.find('.armor-source.total .source-value');
            if (totalElement.length > 0) {
                totalElement.text(totalConstitution);
            }
            
            // Mettre à jour les bonus des traits
            const traitBonusElement = constitutionBreakdown.find('.armor-source[data-source="traits"] .source-value');
            if (traitBonusElement.length > 0) {
                const traitBonus = this.actor.system.traitBonuses?.constitution || 0;
                traitBonusElement.text(traitBonus);
            }
            
            console.log(`Affichage constitution totale mis à jour: ${totalConstitution}`);
        }
    }
    
    /**
     * Met à jour l'affichage du mana total
     * @private
     */
    _updateManaTotalDisplay() {
        const totalMana = this._getTotalMana();
        const manaDisplay = this.element.find('.mana-display');
        
        if (manaDisplay.length > 0) {
            // Mettre à jour la valeur maximale du mana
            const maxManaElement = manaDisplay.find('.mana-max');
            if (maxManaElement.length > 0) {
                maxManaElement.text(totalMana);
            }
            
            console.log(`Affichage mana total mis à jour: ${totalMana}`);
        }
    }

    /**
     * Initialise l'état des points de mana
     * @private
     */
    _initializeMana() {
        const totalMana = this._getTotalMana(); // Utiliser le mana total avec bonus des traits
        const currentMana = this.actor.system.mana?.value || totalMana;
        const manaContainer = this.element.find('.mana-container');
        
        console.log(`Initialisation du mana: total: ${totalMana}, actuel: ${currentMana}`);
        
        // Vider le conteneur du mana
        manaContainer.empty();
        
        // Créer le bon nombre de points de mana basé sur le mana total
        for (let i = 0; i < totalMana; i++) {
            const manaIndex = i + 1;
            const isActive = manaIndex <= currentMana;
            
            const manaButton = $(`
                <button class="mana-button ${isActive ? 'active' : 'depleted'}" 
                        data-mana-index="${manaIndex}" 
                        data-active="${isActive}">
                    <i class="fas fa-star"></i>
                </button>
            `);
            
            // Attacher l'événement de clic
            manaButton.click(this._onManaClick.bind(this));
            
            // Ajouter au conteneur
            manaContainer.append(manaButton);
        }
        
        console.log(`${totalMana} points de mana créés et initialisés`);
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
            // Note: Les bonus d'équipement pour la constitution pourront être ajoutés ici plus tard
            return baseConstitution + traitBonus;
        });

                 Handlebars.registerHelper('getTotalArmor', function(actor) {
            const baseArmor = parseInt(actor.system.resources?.armor?.value) || 0;
            const traitBonus = parseInt(actor.system.traitBonuses?.armor) || 0;
            const equipmentBonus = getArmorTypeBonus(actor);
            
            // Calculer le bonus des boucliers d'armes
            let shieldBonus = 0;
            if (actor.system.weapons?.primary?.type === 'shield') {
                shieldBonus += parseInt(actor.system.weapons.primary.bonus) || 0;
            }
            if (actor.system.weapons?.secondary?.type === 'shield') {
                shieldBonus += parseInt(actor.system.weapons.secondary.bonus) || 0;
            }
            
            // Armure totale = base + équipement + traits + boucliers
            return baseArmor + equipmentBonus + traitBonus + shieldBonus;
        });

         // Fonction helper pour calculer le bonus d'armure basé sur le type
         function getArmorTypeBonus(actor) {
             const armorType = actor.system.armor?.type || 'tissu';
             const bonusMap = {
                 'tissu': 0,
                 'legere': 1,
                 'lourde': 2,
                 'blindee': 4
             };
             return bonusMap[armorType] || 0;
         }

         // Fonction helper pour calculer le malus d'agilité basé sur le type d'armure
         function getAgilityPenalty(actor) {
             const armorType = actor.system.armor?.type || 'tissu';
             const penaltyMap = {
                 'tissu': 0,      // Pas de malus
                 'legere': -4,    // Malus de 4
                 'lourde': -8,    // Malus de 8
                 'blindee': -16   // Malus de 16
             };
             return penaltyMap[armorType] || 0;
         }

        // Helper pour calculer le mana total basé sur le degré d'Arcane
        Handlebars.registerHelper('getTotalMana', function(actor) {
            const arcaneValue = actor.system.arcane?.value || "2d4";
            const manaPerLevel = {
                "2d4": 2,   // Insensible
                "3d4": 4,   // Eveillé
                "4d4": 6,   // Novice
                "5d4": 8,   // Initié
                "6d4": 10,  // Maître
                "7d4": 12   // Archimage
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
                "2d4": "1d12",  // Degré 1: 2d4 max=8, donc 1d8+4=1d12
                "3d4": "1d16",  // Degré 2: 3d4 max=12, donc 1d12+4=1d16
                "4d4": "1d20",  // Degré 3: 4d4 max=16, donc 1d16+4=1d20
                "5d4": "1d24",  // Degré 4: 5d4 max=20, donc 1d20+4=1d24
                "6d4": "1d28",  // Degré 5: 6d4 max=24, donc 1d24+4=1d28
                "7d4": "1d32"   // Degré 6: 7d4 max=28, donc 1d28+4=1d32
            };
            return safeToUnsafe[safeValue] || safeValue;
        });

        // Helper pour obtenir la range des dés en mode Safe
        Handlebars.registerHelper('getSafeRange', function(safeValue) {
            const rangeMap = {
                "2d4": "2-8",   // 2d4: min=2, max=8
                "3d4": "3-12",  // 3d4: min=3, max=12
                "4d4": "4-16",  // 4d4: min=4, max=16
                "5d4": "5-20",  // 5d4: min=5, max=20
                "6d4": "6-24",  // 6d4: min=6, max=24
                "7d4": "7-28"   // 7d4: min=7, max=28
            };
            return rangeMap[safeValue] || "?";
        });

        // Helper pour obtenir la range des dés en mode Unsafe
        Handlebars.registerHelper('getUnsafeRange', function(safeValue) {
            const rangeMap = {
                "2d4": "1-12",  // 1d12: min=1, max=12
                "3d4": "1-16",  // 1d16: min=1, max=16
                "4d4": "1-20",  // 1d20: min=1, max=20
                "5d4": "1-24",  // 1d24: min=1, max=24
                "6d4": "1-28",  // 1d28: min=1, max=28
                "7d4": "1-32"   // 1d32: min=1, max=32
            };
            return rangeMap[safeValue] || "?";
        });

    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    foundry.documents.collections.Actors.registerSheet("voidHorizon", HeroSheet, {
        types: ["heros"],
        makeDefault: true
    });
}); 