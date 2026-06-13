<template>
  <div class="relative w-[800px] h-full bg-linear-to-br from-gray-800 to-gray-900">
    <canvas class="w-full h-full" ref="canvasRef"></canvas>
    <div class="absolute top-6 left-6">
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center">
          <span class="text-white font-bold text-xl">E</span>
        </div>
        <span class="text-white text-xl font-bold">English App</span>
      </div>
    </div>
    <!-- 登录/注册切换按钮 -->
    <div class="absolute top-6 right-6">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
        <button :class="loginClass" @click="loadModel('login')">
          登录
        </button>
        <button :class="registerClass" @click="loadModel('register')">
          注册
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'; // 加载 gltf 文件
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // 轨道控制器
import type { LoginType } from './type';
const type = ref<LoginType>('login')
const loginClass = computed(() => {
  return type.value === 'login' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})
const registerClass = computed(() => {
  return type.value === 'register' ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all' : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
})

const emits = defineEmits(['changeType'])

let currentModel: THREE.Group | null = null
let mixer: THREE.AnimationMixer | null = null
const timer = new THREE.Timer()
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
// 创建场景
const scene = new THREE.Scene();

let loginGltf: GLTF | null = null
let registerGltf: GLTF | null = null
const loader = new GLTFLoader();

const loadModel = (url: LoginType, init: 'init' | '' = '') => {
  if (type.value === url && init !== 'init') {
    return
  }
  if (currentModel) {
    scene.remove(currentModel)
    currentModel = null
  }
  type.value = url
  if (url === 'login') {
    if (loginGltf) {
      currentModel = loginGltf.scene
      scene.position.y = -0.7 //设置模型位置高度为-0.7
      scene.add(currentModel);
      console.log('have loginGltf')
    } else {
      loader.load('/models/login/scene.gltf', (gltf) => {
        loginGltf = gltf
        currentModel = gltf.scene
        currentModel.scale.set(0.8, 0.8, 0.8) //设置模型缩放
        scene.position.y = -0.7 //设置模型位置高度为-0.7
        scene.add(currentModel);
      });
    }
  }
  if (url === 'register') {
    if (registerGltf) {
      currentModel = registerGltf.scene
      scene.position.y = -0.7 //设置模型位置高度为-0.7
      scene.add(currentModel);
      if (registerGltf.animations && registerGltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(currentModel)
        registerGltf.animations.forEach((clip) => {
          const action = mixer!.clipAction(clip)
          action.play()
        })
      }
      console.log('have registerGltf')
    } else {
      loader.load('/models/register/scene.gltf', (gltf) => {
        registerGltf = gltf
        currentModel = gltf.scene
        currentModel.scale.set(0.8, 0.8, 0.8) //设置模型缩放
        scene.position.y = -0.7 //设置模型位置高度为-0.7
        scene.add(currentModel);
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(currentModel)
          gltf.animations.forEach((clip) => {
            const action = mixer!.clipAction(clip)
            action.play()
          })
        }
      });
    }
  }
  emits('changeType', url)
}

const initThree = () => {
  const width = canvasRef.value!.clientWidth
  const height = canvasRef.value!.clientHeight
  // 创建相机
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(1, 0.5, 1) //设置相机位置
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true, // 开启抗锯齿
    alpha: true, // 开启透明度
    precision: 'highp', // 高精度渲染
    powerPreference: 'high-performance', // 高性能渲染
  });
  loadModel(type.value, 'init')
  renderer.setSize(width, height);
  renderer.render(scene, camera);
  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  const animate = () => {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.002 //旋转场景
    renderer.render(scene, camera);
    if (mixer) {
      mixer.update(timer.getDelta())
      timer.update()
    }
    controls.update();
  }
  animate();
}
onMounted(() => {
  initThree()
})
</script>