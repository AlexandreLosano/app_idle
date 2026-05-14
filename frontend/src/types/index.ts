export interface Factor {
  letra: string;
  cont: number;
  valor: string;
  dgts: number;
}

export interface Mine {
  id: number;
  nome: string;
  island_id: number | null;
  island_nome: string | null;
  armazem_nivel: number | null;
  armazem_letra: string | null;
  elevador_nivel: number | null;
  elevador_letra: string | null;
  extracao_nivel: number | null;
  extracao_letra: string | null;
  prestigio_atual: number;
  prestigio_maximo: number;
  proximo_prestigio_valor: number | null;
  proximo_prestigio_letra: string | null;
  updated_at: string;
}

export interface Artefato {
  id: number;
  quantidade: number;
  ativo: boolean;
  tipo: string;
  updated_at: string;
}

export interface Island {
  id: number;
  nome: string;
  ordem: number | null;
  updated_at: string;
}
