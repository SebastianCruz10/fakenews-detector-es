import logging
import numpy as np
import shap
import torch

logger = logging.getLogger(__name__)

_CORPUS_REFERENCIA = [
    "El gobierno anuncio nuevas medidas economicas para frenar la inflacion.",
    "Los cientificos descubrieron una nueva especie de mamifero en la Amazonia.",
    "El presidente firmo el decreto de emergencia sanitaria nacional.",
    "La seleccion nacional gano el partido por dos goles a cero.",
    "Las autoridades confirmaron tres nuevos casos de la enfermedad.",
    "El banco central mantuvo la tasa de interes sin cambios.",
    "Los estudiantes protestaron frente al ministerio de educacion.",
    "La empresa anuncio la contratacion de mil nuevos empleados.",
    "El congreso aprobo la nueva ley de presupuesto nacional.",
    "Las lluvias causaron inundaciones en varias provincias del pais.",
    "El ministro renuncio tras el escandalo de corrupcion.",
    "La vacuna fue aprobada por las autoridades sanitarias internacionales.",
    "El equipo clasifico a la final del torneo sudamericano.",
    "La inflacion bajo al tres por ciento segun el informe oficial.",
    "El tribunal condeno al acusado a diez anos de prision.",
    "Los medicos advierten sobre el aumento de casos de gripe.",
    "La empresa tecnologica lanzo su nuevo producto al mercado.",
    "El alcalde inauguro el nuevo parque en el centro de la ciudad.",
    "Los bomberos controlaron el incendio en el almacen industrial.",
    "El acuerdo comercial beneficiara a miles de productores locales.",
    "La universidad otorgo becas a estudiantes de bajos recursos.",
    "El candidato gano las elecciones con el sesenta por ciento de votos.",
    "Las exportaciones aumentaron un veinte por ciento este trimestre.",
    "El hospital recibio nuevos equipos de alta tecnologia medica.",
    "La policia detuvo a los sospechosos del robo al banco central.",
    "El festival de musica reunio a mas de diez mil personas.",
    "La reforma educativa entrara en vigor el proximo ano escolar.",
    "Los trabajadores lograron un aumento salarial del quince por ciento.",
    "El gobierno destino fondos para la reconstruccion de zonas afectadas.",
    "La investigacion cientifica demostro nuevos avances contra el cancer.",
    "El partido de futbol termino en empate ante miles de espectadores.",
    "La tormenta dejo sin electricidad a varios distritos de la ciudad.",
    "El museo inauguro una nueva exposicion de arte contemporaneo.",
    "Las autoridades tomaron medidas para controlar el trafico vehicular.",
    "El proyecto de ley fue debatido durante tres horas en el pleno.",
    "La delegacion diplomatica llego al pais para iniciar negociaciones.",
    "El actor recibio el premio por su destacada trayectoria artistica.",
    "La nueva autopista reducira el tiempo de viaje entre ciudades.",
    "El informe revela que la pobreza bajo en los ultimos dos anos.",
    "Los voluntarios ayudaron a las familias afectadas por el desastre.",
    "El congresista denuncio irregularidades en el proceso de licitacion.",
    "La empresa farmaceutica anuncio resultados positivos en sus ensayos.",
    "El tornedo destruyo varias viviendas en la zona rural del departamento.",
    "Los jueces fallaron a favor del demandante en el caso historico.",
    "La nueva ley protege los derechos de los trabajadores informales.",
    "El ministro de economia presento el plan de reactivacion productiva.",
    "Las autoridades advirtieron sobre el riesgo de deslizamientos de tierra.",
    "El programa social beneficia a mas de cien mil familias vulnerables.",
    "La seleccion femenina clasifico al mundial por primera vez en historia.",
    "El nuevo acuerdo de paz fue firmado por ambas partes en conflicto."
]

class ExplainerService:
    def explain(self, text: str, classifier) -> list:
        try:
            model = classifier._model
            tokenizer = classifier._tokenizer
            device = classifier._device

            def predict_fn(texts):
                if isinstance(texts, str):
                    texts = [texts]
                texts = [str(t) for t in texts]
                inputs = tokenizer(
                    texts,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512,
                    padding=True
                ).to(device)
                with torch.no_grad():
                    logits = model(**inputs).logits
                probs = torch.softmax(logits, dim=-1).cpu().numpy()
                return probs

            masker = shap.maskers.Text(r"\W+")
            explainer = shap.Explainer(predict_fn, masker, output_names=["REAL", "FALSA"])
            shap_values = explainer([text])

            tokens = shap_values.data[0]
            values = shap_values.values[0]

            if len(values.shape) > 1:
                values_fake = values[:, 1]
            else:
                values_fake = values

            valid_indices = [
                i for i, tok in enumerate(tokens)
                if not str(tok).startswith("##")
                and len(str(tok).strip()) > 1
                and any(c.isalpha() for c in str(tok))
            ]

            tokens_filtered = [tokens[i] for i in valid_indices]
            values_filtered = [float(values_fake[i]) for i in valid_indices]

            sorted_pairs = sorted(
                zip(tokens_filtered, values_filtered),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:20]

            return [
                {"token": tok, "shap_value": round(val, 4), "position": i}
                for i, (tok, val) in enumerate(sorted_pairs)
            ]
        except Exception as e:
            logger.error("Error en SHAP: %s", str(e))
            return []

explainer_service = ExplainerService()
