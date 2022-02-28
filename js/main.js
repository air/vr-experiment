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

// END MAIN

// build a Line or Mesh representing this controller based on the targetRayMode
function buildController(data)
{
  let geometry, material;
  switch (data.targetRayMode)
  {
    case 'tracked-pointer':
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
      material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
      return new THREE.Line(geometry, material);
    case 'gaze':
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
      material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
      return new THREE.Mesh(geometry, material);
  }
}

function init()
{
  // helpers
  const axesHelper = new THREE.AxesHelper(5);
  three.scene.add(axesHelper);

  const hemiLight = new THREE.HemisphereLight(0x6060F0, 0xA0A040); // skyColor, groundColor
  three.scene.add(hemiLight);
  const hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
  three.scene.add(hemiHelper);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(3, 3, 3);//.normalize(); // i.e. would bound to 1,1,1
  three.scene.add(dirLight);
  const dirHelper = new THREE.DirectionalLightHelper(dirLight, 1);
  three.scene.add(dirHelper);

  // test scene
  three.scene.background = new THREE.Color(0x505050);
  cube.position.set(1,1,1);
  three.scene.add(cube);
  three.camera.position.set(1, 1, 2);
  three.camera.lookAt(new THREE.Vector3(0, 0, 0));

  // room
  const room = new THREE.LineSegments(
    new BoxLineGeometry(10, 10, 10, 10, 10, 10), // width, height, depth, # of segments per axis
    new THREE.LineBasicMaterial({ color: 0x808080 })
  );
  room.geometry.translate(0, 3, 0);
  three.scene.add(room);

  // VR: add the Enter VR button
  document.body.appendChild(VRButton.createButton(three.renderer));
  three.renderer.xr.enabled = true; // "tell your instance of WebGLRenderer to enable XR rendering"
  // is this important to work on Quest? from ballshooter.js. Has major effect on colors/lighting
  three.renderer.outputEncoding = THREE.sRGBEncoding;

  // VR controllers part 1: we decide how to render the pointer coming out of the controller.
  // We provide a Group, and the XR manager will move and rotate the whole thing as needed.
  // #1
  const controller1 = three.renderer.xr.getController(0); // an empty THREE.Group for us to populate
  // controller1.addEventListener('selectstart', onSelectStart);
  // controller1.addEventListener('selectend', onSelectEnd);
  controller1.addEventListener('connected', function(event) {
    let controlObject = buildController(event.data); // probably just a Line
    this.add(controlObject); // add the Object3D we created to the controller THREE.Group
  });
  controller1.addEventListener('disconnected', function () {this.remove(this.children[0]);});
  three.scene.add(controller1);
  // #2
  const controller2 = three.renderer.xr.getController(1); // an empty THREE.Group for us to populate
  // controller2.addEventListener('selectstart', onSelectStart);
  // controller2.addEventListener('selectend', onSelectEnd);
  controller2.addEventListener('connected', function (event) {
    let controlObject = buildController(event.data); // probably just a Line
    this.add(controlObject); // add the Object3D we created to the controller THREE.Group
  });
  controller2.addEventListener('disconnected', function () { this.remove(this.children[0]); });
  three.scene.add(controller2);
  // VR controllers part 2: how to render the controller itself (supplied for us).
  // We provide a Group, and the XR manager will move and rotate the whole thing as needed.
  const controllerModelFactory = new XRControllerModelFactory();
  // #1
  const controllerGrip1 = three.renderer.xr.getControllerGrip(0); // an empty THREE.Group for us to populate
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  three.scene.add(controllerGrip1);
  // #2
  const controllerGrip2 = three.renderer.xr.getControllerGrip(1); // an empty THREE.Group for us to populate
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  three.scene.add(controllerGrip2);
}

three.on('update', function () {
  cube.rotateY(0.01);
  let t = three.Time.now;
  three.camera.position.set(Math.cos(t)*3, 1.5, Math.sin(t)*3);
  three.camera.lookAt(new THREE.Vector3(1,1,1));
});
