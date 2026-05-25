export interface Factor {
  letra: string;
  cont: number;
}

export interface Mine {
  id: number;
  nome: string;
  continent_id: number | null;
  continent_nome: string | null;
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
  fator_rendimento: number | null;
  updated_at: string;
}

export interface Artefato {
  id: number;
  quantidade: number;
  ativo: boolean;
  tipo: string;
  updated_at: string;
}

export interface Continent {
  id: number;
  nome: string;
  game_mode_id: number;
  updated_at: string;
}

export interface GameMode {
  id: number;
  nome: string;
  updated_at: string;
}

export interface Meta {
  continent_id: number;
  valor: number;
  letra: string;
  unidade: 's' | 'min' | 'd';
  updated_at: string;
}
