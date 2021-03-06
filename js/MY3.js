import * as THREE from '../lib/three-0.138.module.js';

// v2 of MY3 designed to run with threestrap.

// runtime environment
//=============================================================================
export var WIDTH = window.innerWidth;
export var HEIGHT = window.innerHeight;
export var HALFWIDTH = window.innerWidth / 2;
export var HALFHEIGHT = window.innerHeight / 2;

// constants
//=============================================================================
export const X_AXIS = new THREE.Vector3(1,0,0);
export const Y_AXIS = new THREE.Vector3(0,1,0);
export const Z_AXIS = new THREE.Vector3(0,0,1);
export const TO_RADIANS = Math.PI / 180;
export const TO_DEGREES = 180 / Math.PI;

// maths
//=============================================================================
// true if the vector length is within a small delta of 1
export function isVectorNormalised(vector)
{
  var diff = Math.abs(1 - vector.length());
  return (diff < 0.01);
};

// pass in two Vector3s and their radii. Y axis is ignored.
export function doCirclesCollide(position1, radius1, position2, radius2)
{
  if (position2 === undefined)
  {
    console.error('doCirclesCollide: undefined position2');
    debugger;
  }
  if (radius2 === undefined)
  {
    console.error('doCirclesCollide: undefined radius2');
    debugger;
  }
  // collision overlap must exceed a small epsilon so we don't count rounding errors
  var COLLISION_EPSILON = 0.01;
  var collisionThreshold = radius1 + radius2 - COLLISION_EPSILON; // centres must be this close together to touch
  var distance = new THREE.Vector2(position1.x, position1.z).distanceTo(new THREE.Vector2(position2.x, position2.z));
  return (distance < collisionThreshold);
};

// pass in two Vector2s, returns a Vector2
export function lineMidpoint(p1, p2)
{
  var x = Math.min(p1.x, p2.x) + Math.abs( (p1.x - p2.x) / 2 );
  var y = Math.min(p1.y, p2.y) + Math.abs( (p1.y - p2.y) / 2 );
  return new THREE.Vector2(x, y);
};

// Pass an object with a .rotation, or a Vector3. Will mod 360.
// Note the axes: 0 is negative along Z axis, and it turns anticlockwise from there, so:
// 90 along negative X axis
// 180 along positive Z axis
// -90 along positive X axis
export function yRotationToDegrees(object)
{
  if (object.rotation === undefined) {
    return (object.y * TO_DEGREES) % 360;
  } else {
    return (object.rotation.y * TO_DEGREES) % 360;
  }
};

// pass in an object3D, get the .rotation as the unit vector of X and Z
export function objectRotationAsUnitVector(object)
{
  // 1. sin expects radians
  // 2. have to adjust the signs to match three.js orientation
  var xComponent = -Math.sin(object.rotation.y);
  var zComponent = -Math.cos(object.rotation.y);
  var vector = new THREE.Vector3(xComponent, 0, zComponent);
  return vector.normalize();
};

// returns a random rotation in radians, suitable for object.rotation
export function randomDirection()
{
  return Math.random() * 2 * Math.PI;
};

// pass in a Vector3 with X and Z values, get the rotation in radians, suitable for object.rotation.y
// Note the axes: 0 is negative along Z axis, and it turns anticlockwise from there, so:
// 90 along negative X axis
// 180 along positive Z axis
// -90 along positive X axis
export function vectorToRotation(vector)
{
  // we need atan2 to get all quadrants
  // atan2 rotates to the X axis (+Z for us) - so invert the values to get a rotation to -Z axis
  return Math.atan2(-vector.x, -vector.z);
};

// TODO if lookAt were fully understood we wouldn't need this?
export function rotateObjectToLookAt(object, point)
{
  var vectorDelta = new THREE.Vector3();
  vectorDelta.subVectors(point, object.position);
  var rotation = this.vectorToRotation(vectorDelta);
  object.rotation.y = rotation;
};

// 3D objects
//=============================================================================

// Return a marker sphere at a location with a material to add to your scene
// mat is optional, default is wireframe
export function markerAt(x, y, z, mat)
{
  if (!mat) {
    mat = MATS.normal;
  }
  let marker = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), mat);
  marker.position.set(x, y, z);
  marker.castShadow = true;
  return marker;
};

// Return some text as a 2D quad to add to your scene
// text will appear to top left of point, facing the camera
export function textAt(x, y, z, text)
{
  // make a canvas...
  var c = document.createElement('canvas');
  c.getContext('2d').font = '50px Arial';
  c.getContext('2d').fillText(text, 2, 50);
  // ...into a texture
  var tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  // create material
  var mat = new THREE.MeshBasicMaterial({
    map : tex,
    transparent : true,
    side : THREE.DoubleSide
  });
  var textQuad = new THREE.Mesh(new THREE.PlaneGeometry(c.width/2, c.height/2), mat);
  textQuad.position.set(x, y, z);
  return textQuad;
};

//=============================================================================
// materials
//=============================================================================
export var MATS = {};
MATS.red = new THREE.MeshLambertMaterial({ color : 0xDD0000 });
MATS.blue = new THREE.MeshLambertMaterial({ color : 0x0000DD });
MATS.green = new THREE.MeshLambertMaterial({ color : 0x00DD00 });
MATS.white = new THREE.MeshLambertMaterial({ color : 0xFFFFFF });
MATS.yellow = new THREE.MeshLambertMaterial({ color : 0xFFFF00 });
MATS.normal = new THREE.MeshNormalMaterial();
MATS.wireframe = new THREE.MeshBasicMaterial({color : 0xFFFFFF, wireframe: true, transparent: true});
// TODO linewidth is broken https://github.com/mrdoob/three.js/issues/269
MATS.lineVertex = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors, linewidth: 1 } );

//=============================================================================
// colors
//=============================================================================
// colorMaps for THREE.Lut, example use
//   var colorTable = new THREE.Lut('rainbow', 16);
//   colorTable.addColorMap('base16', map);
//   colorTable = colorTable.changeColorMap('base16'); // Lut is pretty broken - this.mapname will be wrong

// From http://chriskempson.github.io/base16/
export const COLORMAP_BASE16 = [
  [0.00, '0x151515'],
  [0.07, '0x202020'],
  [0.13, '0x303030'],
  [0.20, '0x505050'],
  [0.27, '0xb0b0b0'],
  [0.33, '0xd0d0d0'],
  [0.40, '0xe0e0e0'],
  [0.47, '0xf5f5f5'],
  [0.53, '0xac4142'],
  [0.60, '0xd28445'],
  [0.67, '0xf4bf75'],
  [0.73, '0x90a959'],
  [0.80, '0x75b5aa'],
  [0.87, '0x6a9fb5'],
  [0.93, '0xaa759f'],
  [1.00, '0x8f5536']
];
