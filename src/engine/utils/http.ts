export async function request(request: RequestInfo): Promise<any> {
    const response = await fetch(request);
    return await response.json();
}
