function bindDynamicEvents() {
    // Resaltar fila activa en tablas al hacer click
    document.querySelectorAll('table tbody tr').forEach(row => {
        row.addEventListener('click', function (e) {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
            this.classList.toggle('selected');
        });
    });

    // Cerrar alertas automáticamente
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => { alert.style.display = 'none'; }, 4000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar eventos por primera vez
    bindDynamicEvents();

    const mainContent = document.querySelector('.main');
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-item');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            const url = link.getAttribute('href');
            
            // Ignorar enlaces externos, logout o nueva cita si se desea comportamiento normal
            if (!url || url.startsWith('http') || url === '/logout' || url === '/catalogo') {
                return;
            }

            e.preventDefault();

            try {
                // Agregar estado de carga visual si lo deseas
                mainContent.style.opacity = '0.5';

                const response = await fetch(url);
                if (!response.ok) throw new Error('Error al cargar la página');
                
                const htmlText = await response.text();

                // Parsear el HTML recibido
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                // Extraer el nuevo contenido principal
                const newMain = doc.querySelector('.main');
                
                if (newMain) {
                    // Reemplazar el contenido
                    mainContent.innerHTML = newMain.innerHTML;
                    mainContent.style.opacity = '1';

                    // Re-ejecutar todos los scripts en el nuevo contenido
                    mainContent.querySelectorAll('script').forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                    
                    // Actualizar la URL sin recargar la página
                    history.pushState(null, '', url);
                    
                    // Actualizar clase activa en el sidebar
                    sidebarLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');

                    // Volver a enlazar eventos dinámicos para el nuevo contenido
                    bindDynamicEvents();
                } else {
                    // Fallback si no encuentra el contenedor main
                    window.location.href = url;
                }

            } catch (error) {
                console.error('Error durante la navegación AJAX:', error);
                mainContent.style.opacity = '1';
                window.location.href = url; // Fallback
            }
        });
    });

    // Manejar el botón de atrás/adelante del navegador
    window.addEventListener('popstate', () => {
        window.location.reload();
    });
});
