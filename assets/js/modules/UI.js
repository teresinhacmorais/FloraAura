export function updateConnectionStatus(element) {
    if (!element) {
        return;
    }

    element.textContent = navigator.onLine
        ? "Aplicação pronta."
        : "Estás offline. Podes continuar a consultar a aplicação.";
}