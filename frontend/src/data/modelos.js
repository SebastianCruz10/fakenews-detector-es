export const MODELOS_DATA = {
  'mrbert-es_E1': {
    nombre:       'MrBERT-es · E1',
    descripcion:  'Modelo principal optimizado con augmentación sintética (+50% clase fake)',
    accuracy:     0.8866,
    f1_macro:     0.8864,
    f1_fake:      0.8817,
    recall_fake:  0.8542,
    mejor:        true,
  },
  'mrbert-es_E0': {
    nombre:       'MrBERT-es · E0',
    descripcion:  'Modelo principal baseline entrenado sin augmentación',
    accuracy:     0.8660,
    f1_macro:     0.8655,
    f1_fake:      0.8571,
    recall_fake:  0.8125,
    mejor:        false,
  },
  mroberta_E0: {
    nombre:       'mRoBERTa · E0',
    descripcion:  'Modelo comparativo multilingüe baseline',
    accuracy:     0.8454,
    f1_macro:     0.8443,
    f1_fake:      0.8315,
    recall_fake:  0.7708,
    mejor:        false,
  },
  mroberta_E1: {
    nombre:       'mRoBERTa · E1',
    descripcion:  'Modelo comparativo multilingüe con augmentación sintética',
    accuracy:     0.8351,
    f1_macro:     0.8336,
    f1_fake:      0.8182,
    recall_fake:  0.7500,
    mejor:        false,
  },
}

export const MODELOS_LIST = Object.entries(MODELOS_DATA).map(([id, data]) => ({
  id,
  ...data,
}))
