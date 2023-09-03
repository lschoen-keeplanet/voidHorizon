import{isNewerVersion}from"../../common/utils/helpers.mjs";import{PACKAGE_AVAILABILITY_CODES}from"../../common/constants.mjs";import{World,System,Module,PACKAGE_TYPE_MAPPING}from"./_module.mjs";import path from"path";export async function getPackages({type:e="system"}={}){const r=PACKAGE_TYPE_MAPPING[e];if(!r)throw new Error(`Invalid package type ${e} requested`);const{packages:t,owned:o}=await r.getRepositoryPackages();return{packages:Array.from(t.values()).map((e=>e.vend())),owned:o}}export async function getPackageFromRemoteManifest({type:e="module",manifest:r=""}={}){const t=PACKAGE_TYPE_MAPPING[e];return await t.fromRemoteManifest(r)}export async function checkPackage({type:e,id:r,manifest:t}={}){const o=PACKAGE_TYPE_MAPPING[e];if(!o)throw new Error(`Invalid package type ${e} requested`);const a=o.get(r,{strict:!1});if(!t){if(!a.manifest)throw new Error(`The ${e} ${r} has no manifest URL provided`);t=a.manifest}const n=await o.check(t,a),i=n.remote;let s;if(a&&(s=await o.fromRepository(r),!s||i&&!isNewerVersion(s.version,i.version)||(n.trackChange=a.suggestTrackChange(s))),n.trackChange&&n.error&&404===n.errorCode&&delete n.error,n.trackChange||!i)return n;if(n.isUpgrade||n.isDowngrade)return n;if(a&&!a.protected){a.sidegrade(i,s)&&(n.hasSidegraded=!0)}return n}export async function installPackage({type:e,id:r,manifest:t}){const{logger:o,express:a}=config,n=PACKAGE_TYPE_MAPPING[e];if(!n)throw new Error(`Invalid package type ${e} requested`);if(!t)throw new Error("A manifest URL must be provided");const i=await checkPackage({type:e,id:r,manifest:t}),s=i.remote;if(!s){let r=[`Unable to load valid ${e} manifest data from "${t}"`,i.error].filterJoin("\n");throw new Error(r)}if(r=s.id,i.isDowngrade)throw new Error(`You are currently using a more recent version of ${e} ${s.title} and may not downgrade to an older version`);const c=s.availability,l=PACKAGE_AVAILABILITY_CODES;if(c===l.REQUIRES_CORE_DOWNGRADE)throw new Error(`${e} ${r} version ${s.version} requires an older version of the Foundry Virtual Tabletop software: ${s.compatibility.maximum} or older`);if([l.REQUIRES_CORE_UPGRADE_STABLE,l.REQUIRES_CORE_UPGRADE_UNSTABLE].includes(c))throw new Error(`${e} ${r} version ${s.version} requires a more modern version of the Foundry Virtual Tabletop software: ${s.compatibility.minimum} or newer`);let d,g=s.download;if(s.protected){if(d=await n.getProtectedDownloadURL({type:e,id:r,version:s.version}),"error"===d.status)throw new Error(d.message);g=d.download}if(!g)throw new Error(`The ${s.title} ${e} does not provide a download URL that can be installed`);const m={};!1==!i.compatibility?m.warning=`${s.title} version ${s.version} may not be compatible with Foundry VTT versions newer than ${s.compatibility.verified}`:null===i.compatibility&&(m.warning=`${s.title} version ${s.version} does not specify compatibility and may not work with Foundry VTT version ${config.release.version}`);const p=(n,i,s={})=>{let c;const l=CONST.SETUP_PACKAGE_PROGRESS.STEPS;switch(n){case l.DOWNLOAD:c="Downloading Package";break;case l.INSTALL:c="Installing package";break;case l.CLEANUP:c="Cleaning Up Artifacts";break;case l.COMPLETE:c="Installation Complete";break;case l.VEND:c="Vending Package";break;case l.ERROR:c=s.error}o.info(`${c} - ${i}%`);const d=`SETUP.PackageProgress${n.titleCase()}`;a.io.emit("progress",{action:CONST.SETUP_PACKAGE_PROGRESS.ACTIONS.INSTALL_PKG,type:e,id:r,manifest:t,pct:i,step:n,message:d,...s})};return new Promise((async(e,a)=>{const i=CONST.SETUP_PACKAGE_PROGRESS.STEPS;try{const o=await n.install(r,t,g,d,{onFetched:()=>e(m),onProgress:p,onError:(e,r)=>{if(e===i.DOWNLOAD)return a(r);const t={error:r.message,stack:r.stack};p(i.ERROR,100,t)}});if(!o)return p(i.ERROR,100,{error:"PACKAGE.InstallFailed",packageWarnings:{[r]:packages.warnings.toJSON()[r]}});const s={pkg:o.vend()};p(i.VEND,100,s)}catch(e){p(i.ERROR,100,{error:e.message}),o.error(e),a(e)}}))}export async function resetPackages(){return Module.resetPackages(),System.resetPackages(),World.resetPackages(),{message:"Reset package cache for all package types"}}export async function uninstallPackage({type:e,id:r}){const t=PACKAGE_TYPE_MAPPING[e];if(!t)throw new Error(`Invalid package type ${e} requested`);const o=t.uninstall(r);return o.uninstalled=!0,o}export async function lockPackage({type:e,id:r,shouldLock:t}){const o=PACKAGE_TYPE_MAPPING[e];if(!o)throw new Error(`Invalid package type ${e} requested`);return o.get(r,{strict:!1}).lock(t),{message:`Locked package ${r}`}}