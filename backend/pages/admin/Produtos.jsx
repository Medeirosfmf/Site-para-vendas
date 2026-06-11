import produtos from "../../data/produtos";

function Produtos() {
  return (
    <div>
      <h1>Produtos</h1>

      {produtos.map((produto) => (
        <div key={produto.id}>
          <h3>{produto.nome}</h3>
          <p>R$ {produto.preco}</p>
        </div>
      ))}
    </div>
  );
}

export default Produtos;