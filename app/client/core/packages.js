/**
 * @typedef {Object} PackageCompatibilityBadge
 * @property {string} type        A type in "safe", "unsafe", "warning", "neutral" applied as a CSS class
 * @property {string} tooltip     A tooltip string displayed when hovering over the badge
 * @property {string} [label]     An optional text label displayed in the badge
 * @property {string} [icon]      An optional icon displayed in the badge
 */


/**
 * A client-side mixin used for all Package types.
 * @param {typeof BasePackage} BasePackage    The parent BasePackage class being mixed
 * @returns {typeof ClientPackage}            A BasePackage subclass mixed with ClientPackage features
 * @category - Mixins
 */
function ClientPackageMixin(BasePackage) {
  class ClientPackage extends BasePackage {

    /**
     * Is this package marked as a favorite?
     * This boolean is currently only populated as true in the /setup view of the software.
     * @type {boolean}
     */
    favorite = false;

    /**
     * Associate package availability with certain badge for client-side display.
     * @returns {PackageCompatibilityBadge|null}
     */
    getVersionBadge() {
      const ac = CONST.PACKAGE_AVAILABILITY_CODES;
      const cv = this.compatibility.verified;
      switch ( this.availability ) {

        // Unsafe
        case ac.UNKNOWN:
        case ac.MISSING_SYSTEM:
        case ac.REQUIRES_CORE_DOWNGRADE:
        case ac.REQUIRES_CORE_UPGRADE_STABLE:
        case ac.REQUIRES_CORE_UPGRADE_UNSTABLE:
          const labels = {
            [ac.UNKNOWN]: "SETUP.CompatibilityUnknown",
            [ac.MISSING_SYSTEM]: "SETUP.RequireDep",
            [ac.REQUIRES_CORE_DOWNGRADE]: "SETUP.RequireCoreDowngrade",
            [ac.REQUIRES_CORE_UPGRADE_STABLE]: "SETUP.RequireCoreUpgrade",
            [ac.REQUIRES_CORE_UPGRADE_UNSTABLE]: "SETUP.RequireCoreUnstable"
          };
          return {
            type: "unsafe",
            tooltip: game.i18n.localize(labels[this.availability]),
            label: this.version,
            icon: "fa fa-file-slash"
          };

        case ac.MISSING_DEPENDENCY:
        case ac.REQUIRES_DEPENDENCY_UPDATE:
          return {
            type: "unsafe",
            label: this.version,
            icon: "fa fa-file-slash",
            tooltip: this._formatBadDependenciesTooltip()
          };

        // Warning
        case ac.UNVERIFIED_GENERATION:
          return {
            type: "warning",
            tooltip: game.i18n.format("SETUP.CompatibilityRiskWithVersion", {version: cv}),
            label: this.version,
            icon: "fas fa-exclamation-triangle"
          };

        // Neutral
        case ac.UNVERIFIED_BUILD:
          return {
            type: "neutral",
            tooltip: game.i18n.format("SETUP.CompatibilityRiskWithVersion", {version: cv}),
            label: this.version,
            icon: "fas fa-code-branch"
          };

        // Safe
        case ac.VERIFIED:
          return {
            type: "safe",
            tooltip: game.i18n.localize("SETUP.Verified"),
            label: this.version,
            icon: "fas fa-code-branch"
          };

        // Default null
        default:
          return null;
      }
    }

    /* -------------------------------------------- */

    /**
     * List missing dependencies and format them for display.
     * @param {Iterable<RelatedPackage>} [deps]  The dependencies to format, otherwise use relationships.requires.
     * @returns {string}
     * @protected
     */
    _formatBadDependenciesTooltip(deps) {
      deps ??= this.relationships.requires.values();
      const codes = CONST.PACKAGE_AVAILABILITY_CODES;
      const checked = new Set();
      const bad = [];
      for ( const dep of deps ) {
        if ( (dep.type !== "module") || checked.has(dep.id) ) continue;
        if ( !game.modules.has(dep.id) ) bad.push(dep.id);
        else if ( this.availability === codes.REQUIRES_DEPENDENCY_UPDATE ) {
          const module = game.modules.get(dep.id);
          if ( module.availability !== codes.VERIFIED ) bad.push(dep.id);
        }
        checked.add(dep.id);
      }
      const label = this.availability === codes.MISSING_DEPENDENCY ? "SETUP.RequireDep" : "SETUP.IncompatibleDep";
      return game.i18n.format(label, { dependencies: bad.join(", ") });
    }

    /* ----------------------------------------- */

    /**
     * When a package has been installed, add it to the local game data.
     */
    install() {
      const collection = this.constructor.collection;
      game.data[collection].push(this.toObject());
      game[collection].set(this.id, this);
    }

    /* ----------------------------------------- */

    /**
     * When a package has been uninstalled, remove it from the local game data.
     */
    uninstall() {
      this.constructor.uninstall(this.id);
    }

    /* -------------------------------------------- */

    /**
     * Remove a package from the local game data when it has been uninstalled.
     * @param {string} id  The package ID.
     */
    static uninstall(id) {
      game.data[this.collection].findSplice(p => p.id === id);
      game[this.collection].delete(id);
    }

    /* -------------------------------------------- */

    /**
     * Retrieve the latest Package manifest from a provided remote location.
     * @param {string} manifest                 A remote manifest URL to load
     * @param {object} options                  Additional options which affect package construction
     * @param {boolean} [options.strict=true]   Whether to construct the remote package strictly
     * @returns {Promise<ClientPackage|null>}   A Promise which resolves to a constructed ServerPackage instance
     * @throws                                  An error if the retrieved manifest data is invalid
     */
    static async fromRemoteManifest(manifest, {strict=false}={}) {
      try {
        const data = await Setup.post({action: "getPackageFromRemoteManifest", type: this.type, manifest});
        return new this(data, {installed: false, strict: strict});
      }
      catch(e) {
        return null;
      }
    }
  }
  return ClientPackage;
}

/**
 * @extends foundry.packages.BaseModule
 * @mixes ClientPackageMixin
 * @category - Packages
 */
class Module extends ClientPackageMixin(foundry.packages.BaseModule) {
  constructor(data, options = {}) {
    const {active} = data;
    super(data, options);

    /**
     * Is this package currently active?
     * @type {boolean}
     */
    Object.defineProperty(this, "active", {value: active, writable: false});
  }
}

/**
 * @extends foundry.packages.BaseSystem
 * @mixes ClientPackageMixin
 * @category - Packages
 */
class System extends ClientPackageMixin(foundry.packages.BaseSystem) {}

/**
 * @extends foundry.packages.BaseWorld
 * @mixes ClientPackageMixin
 * @category - Packages
 */
class World extends ClientPackageMixin(foundry.packages.BaseWorld) {

  /** @inheritDoc */
  getVersionBadge() {
    const badge = super.getVersionBadge();
    if ( !badge ) return badge;
    const ac = CONST.PACKAGE_AVAILABILITY_CODES;
    if ( this.availability === ac.VERIFIED ) {
      const s = game.systems.get(this.system);
      if ( s.availability !== ac.VERIFIED ) badge.type = "neutral";
    }
    if ( !this.manifest ) badge.label = "";
    return badge;
  }

  /* -------------------------------------------- */

  /**
   * Provide data for a system badge displayed for the world which reflects the system ID and its availability
   * @returns {PackageCompatibilityBadge|null}
   */
  getSystemBadge() {
    const s = game.systems.get(this.system);
    if ( !s ) return {
      type: "unsafe",
      tooltip: game.i18n.format("SETUP.RequireSystem", { system: this.system }),
      label: this.system,
      icon: "fa fa-file-slash"
    };
    const badge = s.getVersionBadge();
    if ( badge.type === "safe" ) {
      badge.type = "neutral";
      badge.icon = null;
    }
    badge.tooltip = `<p>${s.title}</p><p>${badge.tooltip}</p>`;
    badge.label = s.id;
    return badge;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _formatBadDependenciesTooltip(deps) {
    const system = game.systems.get(this.system);
    if ( system ) deps ??= [...this.relationships.requires.values(), ...system.relationships.requires.values()];
    return super._formatBadDependenciesTooltip(deps);
  }
}

/**
 * A mapping of allowed package types and the classes which implement them.
 * @type {{world: World, system: System, module: Module}}
 */
const PACKAGE_TYPES = {
  world: World,
  system: System,
  module: Module
};
