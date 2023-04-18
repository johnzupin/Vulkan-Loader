/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 693:
/***/ ((module) => {

module.exports = eval("require")("@actions/artifact");


/***/ }),

/***/ 931:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 886:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 738:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 96:
/***/ ((module) => {

module.exports = eval("require")("@actions/glob");


/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(931);
const github = __nccwpck_require__(738);
const exec = __nccwpck_require__(886);
const artifact = __nccwpck_require__(693);
const glob = __nccwpck_require__(96);
const path = __nccwpck_require__(17);

async function run() {
    try {
	const repoName = core.getInput('repo');
	console.log(`repoName=${repoName}`);
	const refName = core.getInput('ref');
	console.log(`refName=${refName}`);
	if (repoName == '' || refName == '')
	    throw new error("repoName and refName inputs not specified")
	
	// Clone the repo
	await exec.exec(`git clone -v -b ${refName} --single-branch --recurse-submodules https://github.com/${repoName}.git vulkan-headers`);
	process.chdir("vulkan-headers");
	
	// Build the package
	await exec.exec(`gbp buildpackage --git-verbose --git-force-create --git-upstream-tree="branch" --git-ignore-branch --git-upstream-branch="${refName}" --no-sign`);
	
	// Find the package - fail if not found
	const patterns = path.resolve('..')+'/*vulkan-headers*_all.deb';
	const globber = await glob.create(patterns);
	const files = await globber.glob();
	if (files)
	    console.log(`The Debian file has been found: ${files}`);
	else
	    throw new error("No Debian files were created");
	
	// Upload the package
	const artifactClient = artifact.create()
	const artifactName = 'vulkan-headers-jammy-package'
	const rootDirectory = '.'
	const options = {
	    continueOnError: false
	}

	const uploadResult = await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
	// Get the JSON webhook payload for the event that triggered the workflow
	const payload = JSON.stringify(github.context.payload, undefined, 2)
	console.log(`The event payload: ${payload}`);
    } catch (error) {
	core.setFailed(error.message);
    }
}
run().catch(err => console.error(err));

})();

module.exports = __webpack_exports__;
/******/ })()
;