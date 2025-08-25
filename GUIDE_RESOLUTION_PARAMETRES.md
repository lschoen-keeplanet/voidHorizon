# 🛠️ Guide de Résolution - Paramètres voidHorizon

## 🚨 Problème Identifié

**Symptôme** : L'onglet "Configure Settings" est vide pour le système voidHorizon, mais fonctionne pour d'autres systèmes sur le même serveur.

**Cause** : Erreurs dans le code JavaScript du système voidHorizon qui empêchent l'enregistrement correct des paramètres.

## ✅ Solutions Implémentées

### **1. Correction du Fichier Principal** (`voidHorizon.js`)

**Problèmes corrigés :**
- ❌ **Double hook `init`** qui causait des conflits
- ❌ **Import manquant** de `ItemSheet`
- ❌ **Référence à `$`** non définie
- ❌ **Ordre des hooks** incorrect

**Code corrigé :**
```javascript
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
```

### **2. Fichier de Configuration des Paramètres** (`module/settings.js`)

**Fonctionnalités :**
- ✅ **Paramètres d'affichage** : Mouvement, armure, tooltips
- ✅ **Paramètres de calcul** : Formule de mouvement, multiplicateurs
- ✅ **Paramètres d'armure** : Malus de mouvement, types d'armure
- ✅ **Paramètres avancés** : Mode debug, sauvegarde automatique

**Fonction d'enregistrement :**
```javascript
export function registerSettings() {
    console.log("Enregistrement des paramètres voidHorizon...");
    
    // Enregistrer les paramètres de base
    for (const [key, setting] of Object.entries(voidHorizonSettings.baseSettings)) {
        game.settings.register("voidHorizon", key, setting);
    }
    
    // Enregistrer les paramètres avancés
    for (const [key, setting] of Object.entries(voidHorizonSettings.advancedSettings)) {
        game.settings.register("voidHorizon", key, setting);
    }
    
    console.log("Paramètres voidHorizon enregistrés avec succès !");
}
```

### **3. Traductions Françaises** (`lang/fr.json`)

**Paramètres traduits :**
- 🎯 **Affichage** : Mouvement disponible, malus d'armure
- 🧮 **Calcul** : Formule de mouvement, multiplicateurs
- 🛡️ **Armure** : Types d'armure, malus de mouvement
- ⚙️ **Avancé** : Mode debug, sauvegarde, logs

## 🔧 Étapes de Test

### **Étape 1 : Vérification de la Console**
1. Ouvrez Foundry VTT avec le système voidHorizon
2. Appuyez sur **F12** pour ouvrir la console
3. Recherchez ces messages :
   ```
   🚀 Initialisation du système voidHorizon
   ✅ Paramètres voidHorizon enregistrés avec succès
   ✅ Feuilles d'objets voidHorizon enregistrées
   🎮 Système voidHorizon prêt et opérationnel
   ```

### **Étape 2 : Test des Paramètres**
1. Ouvrez **Configure Settings** (⚙️)
2. Vérifiez que l'onglet **voidHorizon** apparaît
3. Vérifiez que les paramètres sont visibles et modifiables
4. Testez la modification d'un paramètre
5. Vérifiez que la sauvegarde fonctionne

### **Étape 3 : Test de Fonctionnement**
1. Créez un personnage avec le système voidHorizon
2. Vérifiez que les fiches de personnage s'affichent correctement
3. Testez les fonctionnalités de mouvement et d'armure
4. Vérifiez que les paramètres s'appliquent correctement

## 🧪 Fichiers de Test

### **`test-settings-simple.html`**
- Test simple des paramètres voidHorizon
- Vérification de `game.settings`
- Diagnostic des erreurs

### **`test-foundry-settings-debug.html`**
- Diagnostic complet des paramètres Foundry VTT
- Solutions pour problèmes globaux
- Checklist de vérification

## 🚀 Résolution Attendue

Après application des corrections :

1. ✅ **Console propre** : Plus d'erreurs JavaScript
2. ✅ **Paramètres visibles** : Onglet voidHorizon dans Configure Settings
3. ✅ **Fonctionnalité** : Paramètres modifiables et sauvegardés
4. ✅ **Intégration** : Système fonctionne avec les autres modules

## 🔍 Diagnostic en Cas d'Échec

Si le problème persiste :

1. **Vérifiez la console** pour des erreurs spécifiques
2. **Comparez avec d'autres systèmes** qui fonctionnent
3. **Vérifiez les permissions** des dossiers
4. **Testez en mode navigateur** avec le fichier de test
5. **Vérifiez la version** de Foundry VTT

## 📋 Checklist de Vérification

- [ ] Console sans erreurs JavaScript
- [ ] Messages d'initialisation visibles
- [ ] Onglet voidHorizon dans Configure Settings
- [ ] Paramètres modifiables et sauvegardés
- [ ] Fiches de personnage fonctionnelles
- [ ] Système compatible avec autres modules

## 🎯 Prochaines Étapes

Une fois les paramètres fonctionnels :

1. **Configurer** les paramètres selon vos préférences
2. **Tester** les fonctionnalités de mouvement et d'armure
3. **Personnaliser** l'interface selon vos besoins
4. **Documenter** les configurations pour votre groupe

---

**💡 Conseil** : Gardez la console ouverte pendant les tests pour identifier rapidement tout problème.
