CREATE TABLE usuarios (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL
);

CREATE TABLE clientes (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  telefone VARCHAR(20)
);

CREATE TABLE produtos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descricao VARCHAR(150) NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0)
);

CREATE TABLE pedidos (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'Aguardando'
    CHECK (status IN ('Aguardando', 'Em preparação', 'Enviado', 'Concluído', 'Cancelado'))
);

CREATE TABLE itens_pedido (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario NUMERIC(10, 2) NOT NULL CHECK (valor_unitario >= 0),
  UNIQUE (pedido_id, produto_id)
);
