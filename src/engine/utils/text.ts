import GL from 'engine/gl';

const gl = GL.Instance;

export interface TextBuffer {
    vertexBuffer: WebGLBuffer;
    texCoordBuffer: WebGLBuffer;
    length: number;
}

export interface Metrics {
    chars: { [key: string]: number[] };
    buffer: number;
    size: number;
}

const drawGlyph = (metrics: Metrics, chr: string, pen, size: number, vertexElements: number[], textureElements: number[]) => {
    const metric = metrics.chars[chr];
    if (!metric) return;

    const scale = size / metrics.size;

    const factor = 1;

    let width = metric[0];
    let height = metric[1];
    const horiBearingX = metric[2];
    const horiBearingY = metric[3];
    const horiAdvance = metric[4];
    const posX = metric[5];
    const posY = metric[6];

    if (width > 0 && height > 0) {
        width += metrics.buffer * 2;
        height += metrics.buffer * 2;

        // Add a quad (= two triangles) per glyph.
        vertexElements.push(
            (factor * (pen.x + ((horiBearingX - metrics.buffer + width) * scale))), (factor * (pen.y - horiBearingY * scale)),
            (factor * (pen.x + ((horiBearingX - metrics.buffer) * scale))), (factor * (pen.y - horiBearingY * scale)),
            (factor * (pen.x + ((horiBearingX - metrics.buffer) * scale))), (factor * (pen.y + (height - horiBearingY) * scale)),

            (factor * (pen.x + ((horiBearingX - metrics.buffer + width) * scale))), (factor * (pen.y - horiBearingY * scale)),
            (factor * (pen.x + ((horiBearingX - metrics.buffer) * scale))), (factor * (pen.y + (height - horiBearingY) * scale)),
            (factor * (pen.x + ((horiBearingX - metrics.buffer + width) * scale))), (factor * (pen.y + (height - horiBearingY) * scale))
        );

        textureElements.push(
            posX + width, posY,
            posX, posY,
            posX, posY + height,

            posX + width, posY,
            posX, posY + height,
            posX + width, posY + height
        );
    }

    pen.x = pen.x + horiAdvance * scale;
};

export const createText = (metrics: Metrics, value: string, size: number) => {
    const vertexElements = [];
    const textureElements = [];

    const pen = { x: 0.0, y: size * 0.8 };
    for (let i = 0; i < value.length; i++) {
        const chr = value[i];
        drawGlyph(metrics, chr, pen, size, vertexElements, textureElements);
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexElements), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureElements), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        vertexBuffer,
        texCoordBuffer,
        length: vertexElements.length / 2,
    } as TextBuffer;
};