import * as THREE from '../lib/three-0.138.module.js'
import * as MY3 from './MY3.js'
// VR support
import { VRButton } from '../lib/VRButton.js';
import { XRControllerModelFactory } from '/lib/XRControllerModelFactory.js';
// objects
import { BoxLineGeometry } from '../lib/BoxLineGeometry.js';

const three = new Threestrap.Bootstrap();
// export refs to Chrome console
window.three = three;
window.MY3 = MY3;

// globals
const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff3333 }));

init();
// kick off animation. can't use window.requestAnimationFrame so:
three.renderer.setAnimationLoop(function () {
  three.renderer.render(three.scene, three.camera);
});

function init()
{
  // helpers
  let axesHelper = new THREE.AxesHelper(5);
  three.scene.add(axesHelper);

  // skyColor, groundColor
  let hemiLight = new THREE.HemisphereLight(0x6060F0, 0xA0A040);
  three.scene.add(hemiLight);
  let hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
  three.scene.add(hemiHelper);

  let dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(3, 3, 3);//.normalize();
  three.scene.add(dirLight);
  let dirHelper = new THREE.DirectionalLightHelper(dirLight, 1);
  three.scene.add(dirHelper);

  // test scene
  three.scene.background = new THREE.Color(0x505050);
  cube.position.set(1,1,1);
  three.scene.add(cube);
  three.camera.position.set(1, 1, 2);
  three.camera.lookAt(new THREE.Vector3(0, 0, 0));

  // room
  let room = new THREE.LineSegments(
    // width, height, depth, segments XYZ
    new BoxLineGeometry(10, 10, 10, 10, 10, 10),
    new THREE.LineBasicMaterial({ color: 0x808080 })
  );
  room.geometry.translate(0, 3, 0);
  three.scene.add(room);

  // VR setup
  document.body.appendChild(VRButton.createButton(three.renderer));
  // "tell your instance of WebGLRenderer to enable XR rendering"
  three.renderer.xr.enabled = true;
  // is this important to work on Quest? from ballshooter.js. Has major effect on colors/lighting
  three.renderer.outputEncoding = THREE.sRGBEncoding;
}

three.on('update', function () {
  cube.rotateY(0.01);
  let t = three.Time.now;
  three.camera.position.set(Math.cos(t)*3, 1.5, Math.sin(t)*3);
  three.camera.lookAt(new THREE.Vector3(1,1,1));
});
