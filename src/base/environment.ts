import GL from 'global/gl';

const gl = GL.Instance;

export interface Environment {
    diffuse: WebGLTexture;
    specular: WebGLTexture;
    brdfLut: WebGLTexture;
}

const getImage = async (uri: string) => {
    return new Promise<HTMLImageElement>(resolve => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = uri;
    });
};

const createCubeMap = (textures: HTMLImageElement[]) => {
    const cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    textures.forEach((t, i) => {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t);
    });
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    return cubeMap;
};

export const loadEnvironment = async (): Promise<Environment> => {
    const names = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    const diffuseTextures = await Promise.all(names.map(n => getImage(`environment/diffuse_${n}.jpg`)));
    const specularTextures = await Promise.all(names.map(n => getImage(`environment/specular_${n}.jpg`)));

    const diffuse = createCubeMap(diffuseTextures);
    const specular = createCubeMap(specularTextures);

    const brdfLutTexture = await getImage('environment/brdf_lut.png');
    const brdfLut = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, brdfLut);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, brdfLutTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    if (!diffuse || !specular || !brdfLut) {
        throw new Error('Failed to load environment!');
    }

    return {
        diffuse,
        specular,
        brdfLut,
    };
};
