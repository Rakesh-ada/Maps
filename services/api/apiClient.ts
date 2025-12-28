export const apiClient = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
            let detail: string | undefined;
            try {
                const ct = response.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j: any = await response.json();
                    detail = typeof j?.detail === 'string' ? j.detail : JSON.stringify(j);
                } else {
                    const t = await response.text();
                    detail = t ? String(t).slice(0, 500) : undefined;
                }
            } catch {
                detail = undefined;
            }
            const suffix = detail ? ` - ${detail}` : '';
            throw new Error(`API Error: ${response.status} ${response.statusText}${suffix}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};
