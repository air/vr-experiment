// VR support
import { VRButton } from '/lib/VRButton.js';
// import { BoxLineGeometry } from '/lib/BoxLineGeometry.js';
// import { XRControllerModelFactory } from '/lib/XRControllerModelFactory.js';

const three = new Threestrap.Bootstrap();
// export refs to Chrome console
window.three = three;

// globals
const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff3333 }));

init();
// kick off animation. can't use window.requestAnimationFrame so:
three.renderer.setAnimationLoop(function () {
  three.renderer.render(three.scene, three.camera);
});

function init()
{
  // test scene
  three.scene.add(cube);
  three.camera.position.set(1, 1, 2);
  three.camera.lookAt(new THREE.Vector3(0, 0, 0));

  // VR button
  document.body.appendChild(VRButton.createButton(three.renderer));
  // "tell your instance of WebGLRenderer to enable XR rendering"
  three.renderer.xr.enabled = true;
}

three.on('update', function () {
  cube.rotateY(0.02);
  // var t = three.Time.now;
  // three.camera.position.set(Math.cos(t), 1.5, Math.sin(t));
  // three.camera.lookAt(new THREE.Vector3());
});
