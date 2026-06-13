// Cliente API para comunicarse con el backend FastAPI
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://sebastiancruz10-fakenews-detector-es.hf.space'

/**
 * Analiza un texto y retorna la predicción de veracidad.
 * Respuesta: { label, confidence, probabilities: { real, fake }, model_id }
 */
export async function predict(text, modelId, signal) {
  try {
    const response = await fetch(`${BASE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: modelId }),
      signal,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || `Error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Obtiene la explicación SHAP de una predicción.
 * Respuesta: { tokens: [{ token, shap_value, position }] }
 */
export async function explain(text, modelId, signal) {
  try {
    const response = await fetch(`${BASE_URL}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: modelId }),
      signal,
    })
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Demasiadas solicitudes. Esperá un momento antes de pedir otra explicación.')
      }
      const err = await response.json()
      throw new Error(err.detail || err.error || `Error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Extrae el texto de una URL de artículo periodístico.
 * Respuesta: { text, detected_lang, is_spanish, char_count, word_count }
 */
export async function extract(url, signal) {
  try {
    const response = await fetch(`${BASE_URL}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal,
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || `Error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Verifica si el backend está activo y el modelo está cargado.
 * Respuesta: { status, modelo_activo, timestamp }
 */
export async function healthCheck(signal) {
  const response = await fetch(`${BASE_URL}/health`, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/**
 * Obtiene información y métricas del modelo especificado.
 * Respuesta: { model_id, hf_repo, escenario, arquitectura, f1_fake,
 *              f1_macro, accuracy, recall_fake, corpus, is_active }
 */
export async function getModelInfo(modelId) {
  try {
    const response = await fetch(`${BASE_URL}/api/model-info?model_id=${modelId}`)
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || `Error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}
