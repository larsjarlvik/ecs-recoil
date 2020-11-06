import { Entity } from 'ecs';

export class Shader extends Entity {
    private shaderProgram: WebGLProgram;

    constructor(
        public readonly gl: WebGL2RenderingContext,
    ) {
        super();
    }

    public Awake(): void {
        const vertCode =
            'attribute vec3 coordinates;' +
            'void main(void) {' +
            '   gl_Position = vec4(coordinates, 1.0);' +
            '}';

        const fragCode =
            'void main(void) {' +
            '   gl_FragColor = vec4(1, 0.5, 0.0, 1);' +
            '}';

        const vertShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vertShader, vertCode);
        this.gl.compileShader(vertShader);

        const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragShader, fragCode);
        this.gl.compileShader(fragShader);

        this.shaderProgram = this.gl.createProgram()!;
        this.gl.attachShader(this.shaderProgram, vertShader);
        this.gl.attachShader(this.shaderProgram, fragShader);
        this.gl.linkProgram(this.shaderProgram);
    }

    public Update(): void {
        this.gl.useProgram(this.shaderProgram);

        const coord = this.gl.getAttribLocation(this.shaderProgram, 'coordinates');
        this.gl.enableVertexAttribArray(coord);
        this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
    }
}