export function updateConnectionStatus(element) {
    if (!element) {
        return;
    }

    element.textContent = navigator.onLine
        ? "🌱 O teu jardim está pronto."
        : "🌱 Estás offline. Podes continuar a consultar a aplicação.";
}