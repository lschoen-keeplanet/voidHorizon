# voidHorizon Actor Export

Module d'export d'acteurs pour le système Foundry VTT voidHorizon.

## 🚀 **Fonctionnalités**

- **Export PDF** : Fiches de personnages formatées et imprimables
- **Export JSON** : Données brutes pour sauvegarde et transfert
- **Export HTML** : Pages web partageables
- **Interface intuitive** : Bouton d'export intégré aux fiches
- **Options configurables** : Choix des éléments à inclure
- **Support multilingue** : Français et Anglais

## 📦 **Installation**

1. **Télécharger** le module dans le dossier `modules/` de votre monde Foundry VTT
2. **Activer** le module dans la liste des modules de votre monde
3. **Redémarrer** Foundry VTT si nécessaire

## 🎯 **Utilisation**

### Export Simple
1. **Ouvrir** une fiche de personnage (héros ou NPC)
2. **Cliquer** sur le bouton "Exporter" dans l'en-tête
3. **Choisir** le format d'export (PDF, JSON, HTML)
4. **Configurer** les options d'export
5. **Cliquer** sur "Exporter" pour télécharger le fichier

### Options d'Export
- ✅ **Image du personnage** : Inclure l'avatar
- ✅ **Équipement** : Inclure les objets et armes
- ✅ **Traits et compétences** : Inclure les caractéristiques
- ✅ **Biographie** : Inclure l'histoire du personnage

## 🔧 **Configuration**

Le module s'installe automatiquement et ne nécessite pas de configuration supplémentaire. Il détecte automatiquement les fiches voidHorizon et ajoute le bouton d'export.

## 📋 **Formats Supportés**

### PDF
- **Usage** : Impression, partage, archivage
- **Contenu** : Fiche complète formatée
- **Avantages** : Universel, imprimable

### JSON
- **Usage** : Sauvegarde, transfert, développement
- **Contenu** : Données brutes structurées
- **Avantages** : Portable, éditable

### HTML
- **Usage** : Partage web, consultation
- **Contenu** : Page web interactive
- **Avantages** : Navigable, partageable

## 🛠️ **Développement**

### Structure des Fichiers
```
module/actor-export/
├── module.json          # Configuration du module
├── scripts/
│   ├── main.js         # Script principal
│   ├── providers/      # Providers d'export
│   └── utils/          # Utilitaires
├── templates/           # Templates HTML
├── styles/              # Styles CSS
└── lang/               # Fichiers de traduction
```

### Ajouter un Nouveau Provider
1. **Créer** un nouveau fichier dans `scripts/providers/`
2. **Implémenter** la classe avec la méthode `export()`
3. **Enregistrer** le provider dans `main.js`

## 📝 **Changelog**

### Version 1.0.0
- ✅ Export PDF basique
- ✅ Export JSON des données
- ✅ Export HTML des fiches
- ✅ Interface utilisateur intuitive
- ✅ Support multilingue FR/EN
- ✅ Intégration automatique aux fiches voidHorizon

## 🤝 **Support**

Pour toute question ou problème :
1. **Vérifier** que le module est activé
2. **Consulter** la console du navigateur pour les erreurs
3. **Redémarrer** Foundry VTT si nécessaire

## 📄 **Licence**

Ce module est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🙏 **Remerciements**

- **Foundry VTT** pour la plateforme
- **Système voidHorizon** pour l'intégration
- **Communauté Foundry** pour l'inspiration
