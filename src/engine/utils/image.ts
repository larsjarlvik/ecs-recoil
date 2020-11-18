
export const load = async (uri: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => { resolve(img); };
        img.onerror = () => { reject(); };
        img.src = uri;
    });
};