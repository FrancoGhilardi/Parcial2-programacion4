export type TipoUnidad = 'peso' | 'volumen' | 'contable'

export interface UnidadMedida {
  id: number
  nombre: string
  simbolo: string
  tipo: TipoUnidad
}
