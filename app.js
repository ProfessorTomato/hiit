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
  },
  computed: {},
  created: function () {
    this.ejercicios.forEach((element, index) => {
      this.ejercicios[index].seleccionado = false;
    });
  },
  methods: {
    rutina: function () {
      return this.ejercicios.filter(
        (ejercicio) => ejercicio.seleccionado === true
      );
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
    forzar: function (ejercicio) {
      ejercicio.seleccionado = !ejercicio.seleccionado;
      this.$forceUpdate();
    },
    entrenar: function () {
      // Borramos el entrenamiento en curso al pulsar
      if (this.intervalo) clearInterval(this.intervalo);

      // Mostarmos la ventana modal
      this.modal_v = true;

      // Componer el entrenamiento
      const audio1 = new Audio();
      const audio2 = new Audio();
      const audio_go = new Audio();
      const audio_fin = new Audio();
      // Hay que reproducir con interacción del usuario
      // antes de usar los sonidos donde corresponde
      // para que funcione en Safari en iOS
      audio1.play();
      audio2.play();
      audio_go.play();
      audio_fin.play();

      // Formar el array de ejercicios
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
      let par = true;
      let fin = false;
      let elem_actual = 0;
      let suena_inicial = false;

      audio1.src = "./beep1.ogg";
      audio2.src = "./beep1.ogg";
      audio_go.src = "./cannon.ogg";
      audio_fin.src = "./crowd.ogg";

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
            if (app.t_tiempo >= 1 && app.t_tiempo <= 3) {
              par
                ? (audio1.play(), (par = false))
                : (audio2.play(), (par = true));
            }
            if (suena_inicial) {
              audio_go.play();
              suena_inicial = false;
            }
            if (app.t_tiempo === 1) {
              suena_inicial = true;
            }
          }
        }
      }, 1000);
    },
    reset_entrenamiento: function () {
      clearInterval(this.intervalo);
      this.t_tiempo = 0;
      this.modal_v = false;
    },
  },
});
