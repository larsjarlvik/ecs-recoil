import GL from 'engine/gl';

const gl = GL.Instance;

enum ShaderType {
    Vertex = gl.VERTEX_SHADER,
    Fragment = gl.FRAGMENT_SHADER,
}

const attachShader = (shaderProgram: WebGLProgram, content: string, type: ShaderType) => {
    const shader = gl.createShader(type);
    if (shader === null) throw new Error('gl.createShader returned null!');

    gl.shaderSource(shader, content);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        const line = parseInt(log!.split(':')[2]);
        console.error(`Failed to load shader ${name}`);
        console.error(gl.getShaderInfoLog(shader));
        console.error(`${content.split('\n')[line - 2]}\n${content.split('\n')[line - 1]}\n${content.split('\n')[line]}`);
    }
    gl.attachShader(shaderProgram, shader);
};

const createProgram = () => {
    const program = gl.createProgram();
    if (program === null) throw new Error('gl.createProgram returned null!');

    return program as WebGLProgram;
};

const linkProgram = (program: WebGLProgram) => {
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
};

export {
    attachShader,
    createProgram,
    linkProgram,
    ShaderType,
};
