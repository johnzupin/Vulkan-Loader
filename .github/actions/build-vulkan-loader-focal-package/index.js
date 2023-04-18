const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const artifact = require('@actions/artifact');
const glob = require('@actions/glob');
const path = require('path');

async function run() {
    try {
	const repoName = core.getInput('repo');
	console.log(`repoName=${repoName}`);
	const refName = core.getInput('ref');
	console.log(`refName=${refName}`);
	if (repoName == '' || refName == '')
	    throw new Error("repoName and refName inputs not specified")


	// Download dependencies
	const artifactClient = artifact.create()
	artifactName = 'vulkan-headers-focal-package';
	path = '/tmp/'
	options = {
	    createArtifactFolder: false
	}
	const downloadResponse = await artifactClient.downloadArtifact(artifactName, path, options)

	// Install the dependency
	await exec.exec('dpkg -i /tmp/vulkan-headers*.deb');
	
	// Clone the repo
	await exec.exec(`git clone -v -b ${refName} --single-branch --recurse-submodules https://github.com/${repoName}.git vulkan-loader`);
	process.chdir("vulkan-loader");
	
	// Build the package
	await exec.exec(`gbp buildpackage --git-verbose --git-force-create --git-upstream-tree="branch" --git-ignore-branch --git-upstream-branch="${refName}" --no-sign`);
	
	// Find the package - fail if not found
	const patterns = path.resolve('..')+'/*vulkan-loader*20.04*.deb';
	const globber = await glob.create(patterns);
	const files = await globber.glob();
	console.log(files);
	if (files != '')
	    console.log(`The Debian file has been found: ${files}`);
	else
	    throw new Error("No Debian files were created");
	
	// Upload the package
	// const artifactClient = artifact.create()
	artifactName = 'vulkan-loader-focal-package'
	rootDirectory = '.'
	options = {
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
