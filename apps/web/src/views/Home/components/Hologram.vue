<template>
  <canvas ref="hologramRef"></canvas>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTemplateRef, onMounted } from 'vue';
const hologramRef = useTemplateRef<HTMLCanvasElement>('hologramRef')

const initThree = () => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000);
  camera.position.set(0, 0, 10)
  let mixer: THREE.AnimationMixer | null = null
  // const clock = new THREE.Clock()
  const timer = new THREE.Timer()

  const loader = new GLTFLoader();
  loader.load('/models/hologram/scene.gltf', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(4, 4, 4) //缩放模型
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene)
      gltf.animations.forEach((clip) => {
        const action = mixer!.clipAction(clip)
        action.play()
      })
    }
  });

  //环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
  //平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(5, 10, 7.5)
  scene.add(directionalLight)


  const renderer = new THREE.WebGLRenderer({
    canvas: hologramRef.value!,
    alpha: true, // 背景透明
    antialias: true, // 抗锯齿
    precision: 'highp', // 精度
    powerPreference: 'high-performance' // 性能优先
  })

  renderer.setSize(500, 250); // 设置渲染器大小
  const controls = new OrbitControls(camera, renderer.domElement); // 创建轨道控制器

  const animate = () => {
    requestAnimationFrame(animate);
    // controls.update();
    // const delta = clock.getDelta();
    const delta = timer.getDelta();
    if (mixer) {
      mixer.update(delta);
      timer.update();
    }
    scene.rotation.y += 0.005; // 旋转场景
    controls.update();
    renderer.render(scene, camera);
  }
  animate()
}

onMounted(() => {
  initThree();
})
</script>

<style scoped></style>