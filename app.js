// VANILLA JS (CSS selector)
var CSS_seleccionado = document.querySelector("#style");

function cambiarCSS(estilo) {
  CSS_seleccionado.href = estilo;
}

// VUEJS

Vue.component("tag-ejercicio", {
  props: ["ejercicio"],
  template: "<div><span> {{ ejercicio.nombre }} </span></div>",
});

var app = new Vue({
  el: "#app",
  data: {
    ejercicios: ejercicios_data,
    num: 6,
    series: 5,
    t_activo: 30,
    t_descanso: 10,
    t_descanso_serie: 60,
    t_calentamiento: 0,
    t_etiqueta_entrenamiento: "",
    t_etiqueta_siguiente: "",
    t_tiempo: 0,
    serie_actual: 0,
    intervalo: null,
    modal_v: false,
    num_rutina: 0,
    hora_actual: "", // String
    hora_sin_formato: "", // Tipo Date
    hora_fin_bloqueada: "", // String
  },
  computed: {
    // Tiempo total: calentamiento + (series * ejercicios * tiempo por ejercicio) + (series * (ejercicios-1) * descanso) + (series-1) * descanso entre series
    t_total_entrenamiento_s: function () {
      return (
        this.t_calentamiento +
        this.num_rutina * this.series * this.t_activo +
        (this.num_rutina - 1) * this.series * this.t_descanso +
        (this.series - 1) * this.t_descanso_serie +
        5
      );
    },
    t_minutos_entrenamiento: function () {
      return Math.floor(this.t_total_entrenamiento_s / 60);
    },
    t_segundos_entrenamiento: function () {
      return this.t_total_entrenamiento_s % 60;
    },
    hora_fin: function () {
      d = this.hora_sin_formato;
      d.setSeconds(d.getSeconds() + this.t_total_entrenamiento_s);
      let h = this.cero_izquierda(d.getHours());
      let m = this.cero_izquierda(d.getMinutes());

      return h + ":" + m;
    },
  },
  created: function () {
    this.hora_cada_segundo();
    this.ejercicios.forEach((element, index) => {
      this.ejercicios[index].seleccionado = false;
    });
  },
  methods: {
    cero_izquierda: function (num) {
      if (num < 10) {
        num = "0" + num;
      }
      return num;
    },
    set_hora_actual: function () {
      let d = new Date();
      this.hora_sin_formato = d;
      let h = this.cero_izquierda(d.getHours());
      let m = this.cero_izquierda(d.getMinutes());

      this.hora_actual = h + ":" + m;
    },
    hora_cada_segundo: function () {
      setInterval(this.set_hora_actual, 1000);
    },
    rutina: function () {
      let rutina = this.ejercicios.filter(
        (ejercicio) => ejercicio.seleccionado === true
      );
      this.num_rutina = rutina.length;
      return rutina;
    },
    shuffle: function () {
      // El "_" es parte de la biblioteca lodash
      this.ejercicios = _.shuffle(this.ejercicios);
    },
    // Crear rutina aleatoria
    crear_rutina: function () {
      this.ejercicios.forEach((element, index) => {
        this.ejercicios[index].seleccionado = false;
      });
      var tl = gsap.timeline();
      tl.from("#rutina-div", { duration: 0.5, opacity: 0, x: -200, scale: 1 });
      tl.to("#rutina-div", { duration: 0.3, opacity: 1, x: 0, scale: 1 });

      let rutina = _.slice(_.shuffle(this.ejercicios), 0, this.num);
      this.ejercicios = _.shuffle(this.ejercicios);

      for (let index = 0; index < rutina.length; index++) {
        const id = rutina[index].id;
        this.ejercicios[id].seleccionado = true;
      }
      //this.$forceUpdate();

      // ESTO LO USABA CUANDO RUTINA NO ERA UNA PROPIEDAD COMPUTADA
      // this.rutina = _.slice(_.shuffle(this.ejercicios), 0, this.num);
      // this.ejercicios.forEach((element, index) => {
      //   console.log(element);
      //   if (this.rutina.includes(element)) {
      //     this.ejercicios[index].seleccionado = true;
      //   }
      // });
    },
    // Necesario para forzar que un ejercicio se seleccione o deseleccione al pulsar sobre él
    forzar: function (ejercicio) {
      ejercicio.seleccionado = !ejercicio.seleccionado;
      this.num_rutina = this.rutina().length;
      this.$forceUpdate();
    },
    entrenar: function () {
      // Borramos el entrenamiento en curso al pulsar
      if (this.intervalo) clearInterval(this.intervalo);

      // Mostarmos la ventana modal
      this.modal_v = true;

      if (
        this.t_activo < 1 ||
        this.series < 1 ||
        this.t_descanso < 1 ||
        this.t_descanso_serie < 1
      ) {
        app.t_etiqueta_entrenamiento = "Entrenamiento no válido";
      } else {
        // Hora del final del entrenamiento
        this.hora_fin_bloqueada = this.hora_fin;

        // Componer el entrenamiento
        const audio1 = new Audio();
        const audio2 = new Audio();
        const audio3 = new Audio();
        const audio_go = new Audio();
        const audio_descanso = new Audio();
        const audio_calentamiento = new Audio();
        const audio_fin = new Audio();
        // Hay que reproducir con interacción del usuario
        // antes de usar los sonidos donde corresponde
        // para que funcione en Safari en iOS
        audio1.play();
        audio2.play();
        audio3.play();
        audio_go.play();
        audio_calentamiento.play();
        audio_descanso.play();
        audio_fin.play();

        // Formar el array de ejercicios. Cada elemento del array tiene nombre, duración y serie actual.
        let array_ejercicios = this.rutina();
        console.log(array_ejercicios);

        let array_entrenamiento = [];
        let objeto_a = {};
        objeto_a["nombre"] = "Cuenta atrás";
        objeto_a["tiempo"] = 5;
        objeto_a["serie"] = 1;
        array_entrenamiento.push(objeto_a);
        let objeto_c = {};
        if (this.t_calentamiento > 0) {
          objeto_c["nombre"] = "Calentamiento";
          objeto_c["tiempo"] = this.t_calentamiento;
          objeto_c["serie"] = 1;
          array_entrenamiento.push(objeto_c);
        }
        for (let i = 0; i < this.series; i++) {
          for (let j = 0; j < array_ejercicios.length; j++) {
            let objeto1 = {};
            let objeto2 = {};
            objeto1["nombre"] = array_ejercicios[j].nombre;
            objeto1["tiempo"] = this.t_activo;
            objeto1["serie"] = i + 1;
            array_entrenamiento.push(objeto1);
            objeto2["nombre"] = "Descanso";
            if (j === array_ejercicios.length - 1) {
              objeto2["tiempo"] = this.t_descanso_serie;
            } else {
              objeto2["tiempo"] = this.t_descanso;
            }
            objeto2["serie"] = i + 1;
            array_entrenamiento.push(objeto2);
          }
        }
        array_entrenamiento.pop();

        console.log(array_entrenamiento);

        this.t_etiqueta_entrenamiento = "Empezamos";
        this.serie_actual = 1;
        // let par = true;
        let fin = false;
        let elem_actual = 0;
        let suena_inicial = false;

        audio3.src = "./tres.wav";
        audio2.src = "./dos.wav";
        audio1.src = "./uno.wav";
        audio_calentamiento.src = "./calentamiento.wav";
        audio_go.src = "./vamos.wav";
        audio_descanso.src = "./descanso.wav";
        audio_fin.src = "./crowd.wav";

        // Función de intervalo (OJO: las variables de Vue no
        // llevan this, sino el nombre de la instancia)
        this.intervalo = setInterval(function () {
          console.log("Fin: {1}, Tiempo: {2}", fin, app.t_tiempo);
          console.log("Array ejercicios ", array_ejercicios.length);
          if (array_ejercicios.length === 0) {
            app.t_etiqueta_entrenamiento = "No has seleccionado una rutina";
            clearInterval(app.intervalo);
          } else {
            if (elem_actual === array_entrenamiento.length) {
              app.t_tiempo = "";
              app.t_etiqueta_entrenamiento = "Fin del entrenamiento";
              audio_fin.play();
              clearInterval(app.intervalo);
            } else {
              app.t_tiempo = array_entrenamiento[elem_actual].tiempo--;
              app.t_etiqueta_entrenamiento =
                array_entrenamiento[elem_actual].nombre;
              // Solo se actualiza el ejercicio siguiente si existe
              if (elem_actual < array_entrenamiento.length - 1) {
                app.t_etiqueta_siguiente =
                  array_entrenamiento[elem_actual + 1].nombre;
              } else {
                app.t_etiqueta_siguiente = "Fin del entrenamiento";
              }

              app.serie_actual = array_entrenamiento[elem_actual].serie;
              console.log(app.t_etiqueta_entrenamiento);
              if (app.t_tiempo === 1) {
                elem_actual++;
              }
              // En los últimos 3 segundos hay alerta de sonido
              // if (app.t_tiempo >= 1 && app.t_tiempo <= 3) {
              //   par
              //     ? (audio1.play(), (par = false))
              //     : (audio2.play(), (par = true));
              // }

              // Cambio a sonidos con voz
              if (app.t_tiempo === 3) audio3.play();
              if (app.t_tiempo === 2) audio2.play();
              if (app.t_tiempo === 1) audio1.play();

              if (
                suena_inicial &&
                array_entrenamiento[elem_actual].nombre == "Calentamiento"
              ) {
                // Suena "Calentamiento"
                suena_inicial = false;
                audio_calentamiento.play();
              } else if (
                suena_inicial &&
                array_entrenamiento[elem_actual].nombre == "Descanso"
              ) {
                // Suena "Descanso"
                suena_inicial = false;
                audio_descanso.play();
              } else if (suena_inicial) {
                // Suena "¡Vamos!"
                suena_inicial = false;
                audio_go.play();
              }

              if (app.t_tiempo === 1) {
                suena_inicial = true;
              }
            }
          }
        }, 1000);
      }
    },
    reset_entrenamiento: function () {
      clearInterval(this.intervalo);
      this.t_tiempo = 0;
      this.modal_v = false;
    },
  },
});
