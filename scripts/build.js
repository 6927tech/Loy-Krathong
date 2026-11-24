import fs from 'fs';
import path from 'path';

const siteDir = path.resolve('_site');
if (fs.existsSync(siteDir)) {
  fs.rmSync(siteDir, { recursive: true, force: true });
}
fs.mkdirSync(siteDir, { recursive: true });

// Copy static project files and folders if they exist
['index.html', 'css', 'js', 'assets'].forEach(item => {
  if (fs.existsSync(item)) {
    fs.cpSync(item, path.join(siteDir, item), { recursive: true });
  }
});

// Copy Three.js modules required by importmap
const threeBuildSrc = path.resolve('node_modules/three/build/three.module.js');
const threeBuildDest = path.join(siteDir, 'node_modules/three/build');
fs.mkdirSync(threeBuildDest, { recursive: true });
fs.copyFileSync(threeBuildSrc, path.join(threeBuildDest, 'three.module.js'));

const threeJsmSrc = path.resolve('node_modules/three/examples/jsm');
const threeJsmDest = path.join(siteDir, 'node_modules/three/examples/jsm');
if (fs.existsSync(threeJsmSrc)) {
  fs.mkdirSync(path.dirname(threeJsmDest), { recursive: true });
  fs.cpSync(threeJsmSrc, threeJsmDest, { recursive: true });
}

console.log('Build completed successfully for _site');
