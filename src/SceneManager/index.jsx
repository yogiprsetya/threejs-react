import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

function SceneManager() {
  const mount = useRef(null);
  const [fov, setFov] = useState(70);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = width / height;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
  const scene = new THREE.Scene();

  let lon = 0;
  let lat = 0;
  let phi = 0;
  let theta = 0;
  let onPointerDownPointerX;
  let onPointerDownPointerY;
  let onPointerDownLon;
  let onPointerDownLat;
  let isUserInteracting = false;

  function init() {
    const texture = new THREE.TextureLoader().load( '/texture/1.jpg' );

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const geomety = new THREE.SphereGeometry(500, 60, 40);
    const mesh = new THREE.Mesh(geomety, material);
    mesh.geometry.scale( - 1, 1, 1 );
    scene.add(mesh);
    renderer.setSize(width, height);

    mount.current.addEventListener('mousedown', onDocumentMouseDown, false);
    mount.current.addEventListener('mousewheel', onDocumentMouseWheel, false);
    mount.current.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    mount.current.addEventListener('resize', onWindowResized, false);

    mount.current.appendChild(renderer.domElement);
  }

  function onWindowResized(event) {
    renderer.setSize(width, height);
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
    mount.current.addEventListener('mousemove', onDocumentMouseMove, false);
    mount.current.addEventListener('mouseup', onDocumentMouseUp, false);
  }

  function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
  }

  function onDocumentMouseUp(event) {
    isUserInteracting = false;
    mount.current.removeEventListener('mousemove', onDocumentMouseMove, false);
    mount.current.removeEventListener('mouseup', onDocumentMouseUp, false);
  }

  function onDocumentMouseWheel(event) {
    // WebKit
    if (event.wheelDeltaY) {
      setFov(fov - event.wheelDeltaY * 0.05);
      // Opera / Explorer 9
    } else if (event.wheelDelta) {
      setFov(fov - event.wheelDelta * 0.05);
      // Firefox
    } else if (event.detail) {
      setFov(fov + event.detail * 1.0);
    }
    if (fov < 45 || fov > 90) {
      setFov((fov < 45) ? 45 : 90);
    }

    camera.updateProjectionMatrix();
  }

  useEffect(() => {
    init();
    animate();
  }, [])

  return <div className="tour" ref={mount} />
};

export default SceneManager;
