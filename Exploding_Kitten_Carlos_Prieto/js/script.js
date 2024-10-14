class Jugador {
  constructor(nombre, turno, eliminado) {
    this.nombre = nombre;
    this.turno = turno;
    this.eliminado = eliminado;
    this.cartas = [];
  }
  addCarta(carta) {
    // añadir una carta al jugador
    this.cartas.push(carta);
  }
  contarCartasTipo(tipo) {
    return this.cartas.filter((carta) => carta.tipo === tipo).length;
  }

  contarCartasTotal() {
    return this.cartas.length;
  }

  numSaltarTurno() {
    // cuenta cuantas cartas hay del tipo saltar
    let resultado = 0;
    for (let i = 0; i < this.cartas.length; i++) {
      if (this.cartas[i].tipo === "saltar") {
        resultado++;
      }
    }
    return resultado;
  }
  numDesac() {
    let resultado = 0;
    for (let i = 0; i < this.cartas.length; i++) {
      if (this.cartas[i].tipo === "desactivacion") {
        resultado++;
      }
    }
    return resultado;
  }
  eliminarCartaDesac() {
    // eliminar una carta del array del jugador solo las de desactivar bomba y las de saltar turno
    for (let i = this.cartas.length - 1; i >= 0; i--) {
      if (this.cartas[i].tipo === "desactivacion") {
        this.cartas.splice(i, 1);
        return 1; // devuelve 1 para indicar que se eliminó una carta
      }
    }

    return 0;
  }

  eliminarCartasSaltar() {
    for (let i = this.cartas.length - 1; i >= 0; i--) {
      if (this.cartas[i].tipo === "saltar") {
        this.cartas.splice(i, 1);
      }
    }
  }

  sumarPuntos() {
    let puntos = 0;
    for (let i = 0; i < this.cartas.length; i++) {
      if (this.cartas[i].tipo === "puntos") {
        puntos = puntos + this.cartas[i].puntos;
      }
    }
    return puntos;
  }
}

class Carta {
  constructor(tipo, puntos, src) {
    this.tipo = tipo;
    this.puntos = puntos;
    this.src = src;
  }
}

class mazo {
  constructor(cartas = []) {
    this.cartas = cartas;
  }
  init() {
    for (let i = 0; i < 6; i++) {
      let bomba = new Carta("bomba", 0, "/img/bomba/bomba.png");
      this.cartas.push(bomba);
    }

    for (let i = 0; i < 6; i++) {
      let desactivacion = new Carta(
        "desactivacion",
        0,
        "img/herramienta/herramienta.png"
      );
      this.cartas.push(desactivacion);
    }

    for (let i = 0; i < 10; i++) {
      let saltarTurno = new Carta(
        "saltar",
        0,
        "/img/pasarTurno/pasarTurno.png"
      );
      this.cartas.push(saltarTurno);
    }

    for (let i = 0; i < 38; i++) {
      let random = Math.floor(Math.random() * 10) + 1;
      let puntos = new Carta("puntos", random, getRandomPathImg());
      this.cartas.push(puntos);
    }

    return this.cartas;
  }

  // Mezclar la baraja por el algoritmo  Fisher-Yates Shuffle
  mezclar() {
    for (let i = this.cartas.length - 1; i >= 0; i--) {
      let aleatorio = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[aleatorio]] = [
        this.cartas[aleatorio],
        this.cartas[i],
      ];
    }
    return this.cartas;
  }

  robarCarta() {
    let ultimaCarta = this.cartas.pop();
    return ultimaCarta;
  }
}

let mazo1 = new mazo();
let j1 = new Jugador("jugador1", true, false);
let j2 = new Jugador("jugador2", false, false);
let j3 = new Jugador("jugador3", false, false);

let jugadores = [];
jugadores.push(j1);
jugadores.push(j2);
jugadores.push(j3);

// boton robar carta
let btnRobar = document.getElementById("btnRobar");
btnRobar.onclick = robar;

let btnPasar = document.getElementById("btnPasar");
btnPasar.style.display = "none";
btnPasar.onclick = pasarTurno;
/*
  Funcion que devuelve el path de una imagen
  de robot de manera aleatoria
  */
function getRandomPathImg() {
  let random = Math.floor(Math.random() * 20) + 1;
  if (random < 10) {
    return `./img/card/robot_0${random}.png`;
  }
  return `./img/card/robot_${random}.png`;
}

// Funcion robar
mazo1.init();
console.log(mazo1.mezclar()); // console.log para comprobar la mezcla de la baraja por consola
let ganador = false;

function robar() {
  let jugadorActual = jugadores.find(function (jugador) {
    return jugador.turno === true;
  });
  let posicionJugadorActual = jugadores.findIndex(function (jugador) {
    return jugador.turno === true;
  });
  posicionJugadorActual++;
  if (jugadorActual.turno === true) {
    let ultimaCarta = mazo1.cartas.pop();

    jugadorActual.addCarta(ultimaCarta);
    let textoNumeroCartas = document.getElementById(
      `J${posicionJugadorActual}NumCartas`
    );
    textoNumeroCartas.textContent =
      "Número de cartas: " + jugadorActual.contarCartasTotal();

    // añadir carta robada al dom
    let imagen = document.getElementById("imgCartaRobada");
    imagen.src = ultimaCarta.src;

    // Comprobacion del tipo de carta
    if (ultimaCarta.tipo === "bomba") {
      // si es bomba evaluamos los diferentes casos
      if (jugadorActual.numDesac() > 0) {
        descartar(ultimaCarta);
        console.log(jugadorActual.eliminarCartaDesac());
        let desactivacion = jugadorActual.numDesac();
        let textoDesactivacion = document.getElementById(
          `J${posicionJugadorActual}Desactivacion`
        );
        textoDesactivacion.textContent =
          "Cartas desactivacion:" + desactivacion;
        textoNumeroCartas.textContent =
          "Número de cartas: " + jugadorActual.contarCartasTotal();
      } else {
        descartar(jugadorActual.cartas);
        console.log("cartas del jugador " + jugadorActual.cartas.length);
        console.log(mazo1.cartas.length);
        jugadorActual.eliminado = true;
      }
    } else if (ultimaCarta.tipo === "puntos") {
      let puntos = jugadorActual.sumarPuntos();
      let textoPuntos = document.getElementById(
        `J${posicionJugadorActual}Puntos`
      );
      textoPuntos.textContent = "Puntos totales: " + puntos;
    } else if (ultimaCarta.tipo === "desactivacion") {
      let desactivacion = jugadorActual.numDesac();
      let textoDesactivacion = document.getElementById(
        `J${posicionJugadorActual}Desactivacion`
      );
      textoDesactivacion.textContent = "Cartas desactivacion: " + desactivacion;
    } else if (ultimaCarta.tipo === "saltar") {
      let saltar = jugadorActual.numSaltarTurno();
      let textoSaltar = document.getElementById(
        `J${posicionJugadorActual}saltoTurno`
      );
      textoSaltar.textContent = "Cartas salto turno: " + saltar;
    }
  }

  comprobarGanador();
  actualizarBotonPasar();
  pasarTurno();
}

function descartar(carta) {
  if (Array.isArray(carta)) {
    let listaDesordenada = document.getElementById("listaDescarte");
    carta.forEach((element) => {
      let listaNueva = document.createElement("li");
      listaNueva.style.listStyleType = "circle";
      listaNueva.textContent = element.tipo;
      listaDesordenada.appendChild(listaNueva);
    });
  } else {
    let listaDesordenada = document.getElementById("listaDescarte");
    let listaNueva = document.createElement("li");
    listaNueva.style.listStyleType = "circle";
    listaNueva.textContent = carta.tipo;
    listaDesordenada.appendChild(listaNueva);
  }
}

function pasarTurno() {
  //obtenemos la poicion del jugador actual
  let jugadorActualIndice = jugadores.findIndex(function (jugador) {
    return jugador.turno === true;
  });

  if (jugadorActualIndice == 0) {
    if (jugadores[1].eliminado == true) {
      jugadores[0].turno = false;
      jugadores[2].turno = true;
    } else {
      jugadores[0].turno = false;
      jugadores[1].turno = true;
    }
  } else if (jugadorActualIndice == 1) {
    if (jugadores[2].eliminado == true) {
      jugadores[2].turno = false;
      jugadores[0].turno = true;
    } else {
      jugadores[1].turno = false;
      jugadores[2].turno = true;
    }
  } else if (jugadorActualIndice == 2) {
    if (jugadores[0].eliminado == true) {
      jugadores[2].turno = false;
      jugadores[1].turno = true;
    } else {
      jugadores[0].turno = true;
      jugadores[2].turno = false;
    }
  }

  // Resetear el color de todos los h2 a blanco
  for (let i = 0; i < jugadores.length; i++) {
    let titulo = document.getElementById(`jugador${i}`);
    if (titulo) {
      titulo.style.color = "white";
    }
  }

  // Buscamo el nuevo jugador con el turno a true
  let nuevoJugadorActivo = jugadores.findIndex(function (jugador) {
    return jugador.turno === true;
  });

  // modificamos cada h2 del jugador que tiene el turno

  let tituloNuevoJugadorActivo = document.getElementById(
    `jugador${nuevoJugadorActivo}`
  );

  tituloNuevoJugadorActivo.style.color = "yellow";
}

function comprobarGanador() {
  let ganador = null;
  const eliminados = [];
  jugadores.forEach((jugador) => {
    if (jugador.eliminado == true) {
      eliminados.push(jugador);
    }
  });

  // si se hay mas de 1 jugador eliminado comprobamos ganador
  if (eliminados.length > 1) {
    jugadores.forEach((jugador) => {
      if (jugador.eliminado === false) {
        ganador = jugador;
        alert("El ganador ha sido: " + ganador.nombre);
        btnReiniciar();
      }
    });
  }

  // si se acaban las cartas y queda mas de 1 jugador sin eliminar obtenemos el jugador con más puntos

  if (mazo1.cartas.length === 0 && eliminados.length <= 1) {
    ganador = jugadores[0];
    for (let i = 0; i < jugadores.length; i++) {
      if (jugadores[i].puntos > ganador.puntos) {
        ganador = jugadores[i];
      }
    }

    alert("El ganador ha sido: " + ganador.nombre);
    btnReiniciar();
  }
}

function actualizarBotonPasar() {
  let jugadorActual = jugadores.find(function (jugador) {
    return jugador.turno === true;
  });

  if (jugadorActual.numSaltarTurno() > 0) {
    btnPasar.style.display = "block";
  } else {
    btnPasar.style.display = "none";
  }
}

//funcion para crear un boton reiniciar
function btnReiniciar() {
  let btnRobar = document.getElementById("btnRobar");
  let btnPasar = document.getElementById("btnPasar");
  let btnJuganNuevo = document.createElement("button");

  btnJuganNuevo.textContent = "Jugar de Nuevo";
  btnJuganNuevo.classList.add("btnAccion");
  btnJuganNuevo.addEventListener("click", function () {
    location.reload();
  });

  let divBotones = document.getElementById("contenedorAcciones");
  divBotones.removeChild(btnRobar);
  divBotones.removeChild(btnPasar);
  divBotones.appendChild(btnJuganNuevo);
}
