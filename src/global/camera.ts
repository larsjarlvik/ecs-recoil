import { mat4, vec3 } from 'gl-matrix';
import Viewport from './viewport';

const viewport = Viewport.Instance;

class Camera {
    private static _instance: Camera;
    public lookAt: vec3;
    public distance: number;
    public modelView: mat4;
    public projection: mat4;

    private constructor() {
        this.lookAt = vec3.fromValues(0.0, 0.0, 0.0);
        this.distance = 1.0;
        this.modelView = mat4.create();
        this.projection = mat4.create();
    }

    public static get Instance(): Camera {
        const instance = this._instance || (this._instance = new this());
        return instance;
    }

    public update() {
        mat4.lookAt(this.modelView, vec3.fromValues(0.0, 0.0, -this.distance), this.lookAt, vec3.fromValues(0.0, 1.0, 0.0));
        mat4.perspective(this.projection, 45.0, viewport.aspect, 0.1, 100.0);
    }
}

export default Camera;
