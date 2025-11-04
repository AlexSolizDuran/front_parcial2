
export const apiFetcher = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {

    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
    };

    try {
        const res = await fetch(url, { ...options, headers });

        if (!res.ok) {
            // 1. Empezamos con el error genérico como fallback.
            let errorMsg = `Error ${res.status}: ${res.statusText}`;
            let errorDetails: any = null;

            try {
                // 2. Intentamos parsear la respuesta de error del backend.
                errorDetails = await res.json();

                // 3. SI TUVIMOS ÉXITO, buscamos el mensaje específico.
                // (Puedes añadir más claves si tu backend usa otras: ej. 'error', 'validation_errors')
                if (errorDetails) {
                    if (typeof errorDetails === 'string') {
                        errorMsg = errorDetails;
                    } else if (errorDetails.message) {
                        errorMsg = errorDetails.message;
                    } else if (errorDetails.detail) {
                        errorMsg = errorDetails.detail;
                    } else if (errorDetails.error) {
                        errorMsg = errorDetails.error;
                    } else {
                        // 4. Si es JSON pero no encontramos una clave conocida, lo stringify.
                        errorMsg = JSON.stringify(errorDetails);
                    }
                }
            } catch (jsonError) {
                // 5. Si res.json() falla, no era JSON.
                // No hacemos nada aquí, porque 'errorMsg' ya tiene el fallback genérico (Paso 1).
                console.warn("API Fetcher: La respuesta de error no era JSON.", jsonError);
            }

            // 6. Log del body (esto estaba bien y es muy útil)
            if (options.body) {
                if (isFormData) {
                    console.error("Body de la Petición Fallida (FormData):");
                    for (let [key, value] of (options.body as FormData).entries()) {
                        console.error(key, value instanceof File ? value.name : value);
                    }
                } else {
                    console.error("Body de la Petición Fallida (JSON):", options.body);
                }
            }
            
            // 7. Lanzamos el error (ahora será el específico si se encontró).
            throw new Error(errorMsg);
        }

        // Si la respuesta es 204 (No Content), es un éxito pero sin body.
        if (res.status === 204) return {} as T;

        // Éxito (200, 201)
        return res.json() as Promise<T>;

    } catch (err: any) {
        // Este catch captura errores de red (ej. servidor caído) o el error que lanzamos arriba.
        console.error("API Fetcher (catch principal) detectó un error:", err);
        throw err; // Re-lanzamos para que SWR, React Query, etc., lo detecten.
    }
};
