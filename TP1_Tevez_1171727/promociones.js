const catalogo = {
  mochila: { nombre: "Mochila urbana", precio: 45200, elegible3x2: true },
  botella: { nombre: "Botella termica", precio: 24800, elegible3x2: true },
  gorra: { nombre: "Gorra clasica", precio: 12500, elegible3x2: false },
  agenda: { nombre: "Agenda 2025", precio: 15900, elegible3x2: false },
  personalizacion: { nombre: "Personalizacion", precio: 8000, elegible3x2: false },
  mate: { nombre: "Mate de acero", precio: 18700, elegible3x2: true }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promo-form");
  const listaItems = document.getElementById("lista-items");
  const totalSin = document.getElementById("total-sin");
  const totalDescuento = document.getElementById("total-descuento");
  const totalFinal = document.getElementById("total-final");
  const limpiarBtn = document.getElementById("limpiar-lista");

  let items = [];

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const producto = form.producto.value;
    const cantidad = parseInt(form.cantidad.value, 10);
    if (!producto || Number.isNaN(cantidad) || cantidad <= 0 || !catalogo[producto]) {
      return;
    }

    const existente = items.find((item) => item.producto === producto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({ producto, cantidad });
    }

    form.reset();
    form.cantidad.value = 1;
    render();
  });

  limpiarBtn?.addEventListener("click", () => {
    items = [];
    render();
  });

  function calcularLinea(productoClave, cantidad) {
    const producto = catalogo[productoClave];
    const subtotal = producto.precio * cantidad;

    const pares = Math.floor(cantidad / 2);
    const descuentoSegundo = pares * producto.precio * 0.5;

    let descuento3x2 = 0;
    if (producto.elegible3x2) {
      const trios = Math.floor(cantidad / 3);
      descuento3x2 = trios * producto.precio;
    }

    let descuento = 0;
    let promo = "Sin promo";
    if (descuento3x2 > descuentoSegundo) {
      descuento = descuento3x2;
      promo = descuento3x2 > 0 ? "3x2 aplicado" : promo;
    } else if (descuentoSegundo > 0) {
      descuento = descuentoSegundo;
      promo = "50% en el segundo";
    }

    return { subtotal, descuento, total: subtotal - descuento, promo };
  }

  function calcularTotales(lista) {
    let subtotal = 0;
    let descuentos = 0;

    lista.forEach(({ producto, cantidad }) => {
      const linea = calcularLinea(producto, cantidad);
      subtotal += linea.subtotal;
      descuentos += linea.descuento;
    });

    const subtotalConPromo = subtotal - descuentos;
    const descuentoExtra = subtotalConPromo >= 30000 ? subtotalConPromo * 0.1 : 0;
    const total = subtotalConPromo - descuentoExtra;

    return {
      subtotal,
      descuentoAplicado: descuentos + descuentoExtra,
      total
    };
  }

  function render() {
    if (!listaItems) return;

    if (items.length === 0) {
      listaItems.innerHTML = "<p>No agregaste productos todavia.</p>";
    } else {
      const listado = items
        .map(({ producto, cantidad }) => {
          const data = catalogo[producto];
          const linea = calcularLinea(producto, cantidad);
          return `
            <div class="item-linea">
              <div>
                <strong>${data.nombre}</strong> x${cantidad}
                <span class="promo-tag">${linea.promo}</span>
              </div>
              <div class="item-precio">
                ${formatearDinero(linea.subtotal)}
                ${linea.descuento > 0 ? `<span class="item-descuento">-${formatearDinero(linea.descuento)}</span>` : ""}
                <span class="item-total">${formatearDinero(linea.total)}</span>
              </div>
            </div>
          `;
        })
        .join("");
      listaItems.innerHTML = listado;
    }

    const totales = calcularTotales(items);
    if (totalSin && totalDescuento && totalFinal) {
      totalSin.textContent = formatearDinero(totales.subtotal);
      totalDescuento.textContent =
        totales.descuentoAplicado === 0 ? "$0" : `-${formatearDinero(totales.descuentoAplicado)}`;
      totalFinal.textContent = formatearDinero(totales.total);
    }
  }

  function formatearDinero(valor) {
    return `$${valor.toLocaleString("es-AR")}`;
  }

  render();
});
