import logging
import numpy as np
import shap
from transformers import pipeline as hf_pipeline

logger = logging.getLogger(__name__)

_CORPUS_REFERENCIA = [
    "El gobierno anunció nuevas medidas económicas para frenar la inflación.",
    "Los científicos descubrieron una nueva especie de mamífero en la Amazonía.",
    "El equipo nacional clasificó para la final del campeonato mundial.",
    "La bolsa de valores registró fuertes caídas ante la incertidumbre política.",
    "El ministro de sanidad presentó el plan de vacunación para el próximo año.",
    "Las lluvias torrenciales causaron inundaciones en varias provincias del norte.",
    "El parlamento aprobó la nueva ley de protección de datos con amplia mayoría.",
    "La empresa tecnológica despidió a miles de empleados en una reestructuración.",
    "El presidente firmó un acuerdo de libre comercio con países de la región.",
    "Los precios del petróleo subieron tras la decisión de la OPEP de reducir producción.",
    "El tribunal condenó al exalcalde por malversación de fondos públicos.",
    "La selección femenina ganó la medalla de oro en los Juegos Olímpicos.",
    "El banco central subió los tipos de interés para combatir la inflación.",
    "Miles de manifestantes salieron a las calles para protestar por el alza de precios.",
    "La investigación reveló que el medicamento reduce el riesgo de infarto en un treinta por ciento.",
    "El festival de cine premiará a las mejores producciones latinoamericanas.",
    "La sequía amenaza las cosechas de cereal en las regiones agrícolas del sur.",
    "El sindicato convocó una huelga general para el próximo martes.",
    "El municipio invertirá en la renovación de la red de transporte público.",
    "Los expertos alertan sobre el aumento de ciberataques a infraestructuras críticas.",
    "La empresa farmacéutica anunció resultados positivos en los ensayos clínicos.",
    "El congreso debatirá la reforma del sistema de pensiones la próxima semana.",
    "Las exportaciones crecieron un doce por ciento respecto al mismo periodo del año anterior.",
    "El incendio forestal arrasó miles de hectáreas en la sierra central.",
    "El acusado fue absuelto por falta de pruebas suficientes.",
    "La vacuna contra el dengue comenzará a distribuirse en zonas tropicales.",
    "El nuevo estadio será inaugurado antes del inicio de la próxima temporada.",
    "La tasa de desempleo bajó al nivel más bajo en la última década.",
    "El satélite fue lanzado con éxito desde la base espacial.",
    "El alcalde propuso medidas para reducir la contaminación en el centro urbano.",
    "La cumbre climática concluyó con un acuerdo para reducir las emisiones de carbono.",
    "El hospital amplió su capacidad de urgencias tras la ola de calor.",
    "La editorial publicará las obras completas del escritor premiado.",
    "Los mercados asiáticos cerraron a la baja ante los datos de empleo en Estados Unidos.",
    "El informe reveló irregularidades en la gestión de contratos públicos.",
    "La aerolínea canceló cientos de vuelos por la huelga de controladores aéreos.",
    "El partido opositor presentó una moción de censura contra el ejecutivo.",
    "La ONU pidió un alto el fuego inmediato en la región en conflicto.",
    "El proyecto de ley de vivienda asequible fue rechazado en primera lectura.",
    "La selección masculina de baloncesto conquistó el campeonato europeo.",
    "El gobierno destinará fondos adicionales para la investigación en inteligencia artificial.",
    "Las autoridades detectaron un brote de gripe aviar en granjas del noreste.",
    "La plataforma digital superó los cien millones de suscriptores en todo el mundo.",
    "El terremoto de magnitud seis sacudió la costa sin causar víctimas mortales.",
    "El estudio demostró que la dieta mediterránea reduce el riesgo de enfermedades crónicas.",
    "La empresa constructora ganó el concurso para edificar el nuevo hospital regional.",
    "El acuerdo de paz fue firmado por los representantes de ambas partes en conflicto.",
    "La reforma educativa incluirá más horas de ciencia y tecnología en los colegios.",
    "Las autoridades decomisaron un cargamento de sustancias ilegales en el puerto.",
    "El escritor recibió el premio nacional de literatura por su última novela.",
]


class ExplainerService:
    def explain(self, text: str, classifier) -> list:
        try:
            pipe = hf_pipeline(
                "text-classification",
                model=classifier._model,
                tokenizer=classifier._tokenizer,
                device=0 if str(classifier._device) == "cuda" else -1,
                top_k=None
            )
            explainer = shap.Explainer(pipe)
            shap_values = explainer([text])
            # shap_values[0].values: shape [n_tokens, n_classes]
            # index 1 = FAKE class
            tokens = shap_values[0].data
            values = shap_values[0].values[:, 1]
            top_indices = np.argsort(np.abs(values))[::-1][:20]
            return [
                {
                    "token": str(tokens[i]),
                    "shap_value": round(float(values[i]), 6),
                    "position": int(i),
                }
                for i in top_indices
            ]
        except Exception as exc:
            logger.error("Error en SHAP explain: %s", exc)
            return []


explainer_service = ExplainerService()
