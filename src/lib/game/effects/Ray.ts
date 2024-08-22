import * as THREE from "three";

export type Area = "point" | "rect"

const lightRayMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0x00ff00) },
    intensity: { value: 0.05 }
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vPosition;
    
    void main() {
      float dist = length(vPosition.xy); // Vzdálenost od středu
      float glow = intensity / (dist * dist + 0.1); // Efekt záře
      gl_FragColor = vec4(color * glow, 1.0);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending
});

type CreateRaysAtAreaProps = {
  count?: number;
  position?: THREE.Vector3;
}

export type LightRay = THREE.Mesh<THREE.CylinderGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap>;

class RayFactory {
  public createRaysAtArea(area: Area, { count = 4, position = new THREE.Vector3(0, 0, 0) }: CreateRaysAtAreaProps): LightRay[] {
    const rays: LightRay[] = [];
    switch (area) {
      case "point": {
        for (let i = 0; i < count; i++) {
          const rotation = Math.PI * 2 / count * i;
          rays.push(this.createRay(position, rotation));
        }

        break;
      };
      case "rect": {
        throw new Error("Not implemented");
      }
    }

    return rays;
  }

  public addRaysToScene(rays: LightRay[], scene: THREE.Group<THREE.Object3DEventMap>): void {
    rays.forEach(ray => scene.add(ray));
  }

  private createRay(position: THREE.Vector3, rotation: number): LightRay {
    const lightRayGeometry = new THREE.CylinderGeometry(0.02, 0.05, 2, 16);
    const lightRay = new THREE.Mesh(lightRayGeometry, lightRayMaterial);
    lightRay.position.set(position.x, position.y, position.z);
    lightRay.rotation.x = Math.PI;
    lightRay.rotation.y = rotation;
    lightRay.rotation.z = Math.PI / 10;
    lightRay.translateY(-1);
    return lightRay;
  }
}

const rayFactory = new RayFactory();
export default rayFactory;