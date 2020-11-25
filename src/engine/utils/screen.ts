import GL from 'engine/gl';
import Viewport from 'engine/viewport';

const gl = GL.Instance;
const viewport = Viewport.Instance;

export function clearScreen(renderScale: number) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, viewport.viewport.width * renderScale, viewport.viewport.height * renderScale);
}