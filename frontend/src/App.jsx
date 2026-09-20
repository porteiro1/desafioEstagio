import { useState } from "react";
import "./App.css";

export default function App() {
  const [transacoes, setTransacoes] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mes, setMes] = useState("9");
  const [ano, setAno] = useState("2026");
  const [resumo, setResumo] = useState(null);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("SAIDA");

  const [salvando, setSalvando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState("");

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function alterarMes(evento) {
    setMes(evento.target.value);
    setTransacoes(null);
    setResumo(null);
    setErro("");
  }

  function alterarAno(evento) {
    setAno(evento.target.value);
    setTransacoes(null);
    setResumo(null);
    setErro("");
  }

  async function carregarTransacoes() {
    const anoNumero = Number(ano);

    if (!Number.isInteger(anoNumero) || anoNumero < 1 || anoNumero > 9999) {
      setErro("Informe um ano inteiro entre 1 e 9999.");
      return;
    }

    setCarregando(true);
    setErro("");
    setTransacoes(null);
    setResumo(null);

    try {
      const respostaTransacoes = await fetch(
        `/transacoes?ano=${anoNumero}&mes=${mes}`,
      );

      if (!respostaTransacoes.ok) {
        throw new Error(
          `Erro ao buscar transações: HTTP ${respostaTransacoes.status}`,
        );
      }

      const dadosTransacoes = await respostaTransacoes.json();

      const respostaResumo = await fetch(
        `/transacoes/resumo?ano=${anoNumero}&mes=${mes}`,
      );

      if (!respostaResumo.ok) {
        throw new Error(`Erro ao buscar resumo: HTTP ${respostaResumo.status}`);
      }

      const dadosResumo = await respostaResumo.json();

      setTransacoes(dadosTransacoes);
      setResumo(dadosResumo);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function criarTransacao(evento) {
    evento.preventDefault();

    if (salvando || carregando) return;

    setErroCadastro("");
    setSucessoCadastro("");

    if (!descricao.trim()) {
      setErroCadastro("Preencha a descrição.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/transacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: descricao.trim(),
          valor: Number(valor),
          data: data,
          tipo: tipo,
        }),
      });

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível cadastrar. Confira os dados e tente novamente.",
        );
      }

      setDescricao("");
      setValor("");
      setSucessoCadastro("Transação cadastrada com sucesso!");

      await carregarTransacoes();
    } catch (error) {
      setErroCadastro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="cabecalho">
        <p className="sobretitulo">Visão mensal</p>
        <h1>Controle financeiro</h1>
        <p className="texto-secundario">
          Consulte seu saldo e registre novas movimentações.
        </p>
      </header>

      <section className="painel filtros" aria-labelledby="titulo-periodo">
        <div>
          <h2 id="titulo-periodo">Consultar período</h2>
          <p className="texto-secundario">Escolha o ano e o mês.</p>
        </div>

        <div className="filtros-campos">
          <label>
            Ano
            <input
              type="number"
              min="1"
              max="9999"
              step="1"
              value={ano}
              onChange={alterarAno}
              disabled={carregando || salvando}
            />
          </label>

          <label>
            Mês
            <select
              value={mes}
              onChange={alterarMes}
              disabled={carregando || salvando}
            >
              <option value="1">Janeiro</option>
              <option value="2">Fevereiro</option>
              <option value="3">Março</option>
              <option value="4">Abril</option>
              <option value="5">Maio</option>
              <option value="6">Junho</option>
              <option value="7">Julho</option>
              <option value="8">Agosto</option>
              <option value="9">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </label>

          <button
            type="button"
            onClick={carregarTransacoes}
            disabled={carregando || salvando}
          >
            {carregando ? "Carregando..." : "Consultar"}
          </button>
        </div>
      </section>

      {erro && (
        <p className="mensagem erro" role="alert">
          {erro}
        </p>
      )}

      {/* Cada cartão usa um campo do objeto recebido do Spring. */}
      {resumo !== null && (
        <section className="resumo" aria-label="Resumo do período">
          <article className="cartao entrada">
            <p>Total de entradas</p>
            <strong>{formatarMoeda(resumo.totalEntradas)}</strong>
          </article>

          <article className="cartao saida">
            <p>Total de saídas</p>
            <strong>{formatarMoeda(resumo.totalSaidas)}</strong>
          </article>

          <article className="cartao saldo">
            <p>Saldo do período</p>
            <strong className={resumo.saldo < 0 ? "negativo" : ""}>
              {formatarMoeda(resumo.saldo)}
            </strong>
          </article>
        </section>
      )}

      {/* O CSS organiza estas duas áreas em colunas nas telas maiores. */}
      <div className="conteudo">
        <section
          className="painel movimentacoes"
          aria-labelledby="titulo-transacoes"
          aria-busy={carregando}
        >
          <h2 id="titulo-transacoes">Movimentações</h2>
          <p className="texto-secundario">Registros do período selecionado.</p>

          {carregando && (
            <p className="estado" role="status">
              Carregando transações e resumo...
            </p>
          )}

          {!carregando && transacoes === null && (
            <p className="estado">
              {erro
                ? "Confira a mensagem acima e tente consultar novamente."
                : "Escolha um período e clique em Consultar."}
            </p>
          )}

          {transacoes !== null &&
            (transacoes.length === 0 ? (
              <p className="estado">Nenhuma transação encontrada neste mês.</p>
            ) : (
              <div
                className="tabela-rolagem"
                role="region"
                aria-label="Tabela de transações"
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Data</th>
                      <th scope="col">Descrição</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((transacao) => (
                      <tr key={transacao.id}>
                        <td>{formatarData(transacao.data)}</td>
                        <td className="descricao">{transacao.descricao}</td>
                        <td>
                          <span
                            className={
                              transacao.tipo === "ENTRADA"
                                ? "tipo entrada"
                                : "tipo saida"
                            }
                          >
                            {transacao.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                          </span>
                        </td>
                        <td>{formatarMoeda(transacao.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </section>

        <form
          className="painel formulario"
          onSubmit={criarTransacao}
          aria-busy={salvando}
        >
          <fieldset className="cadastro" disabled={salvando || carregando}>
            <legend>Nova transação</legend>

            <label>
              Descrição
              <input
                type="text"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
                placeholder="Ex.: compra no mercado"
                maxLength={255}
                required
              />
            </label>

            <label>
              Valor (R$)
              <input
                type="number"
                value={valor}
                onChange={(evento) => setValor(evento.target.value)}
                placeholder="0,00"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                required
              />
            </label>

            <label>
              Data
              <input
                type="date"
                value={data}
                onChange={(evento) => setData(evento.target.value)}
                min="0001-01-01"
                max="9999-12-31"
                required
              />
            </label>

            <label>
              Tipo
              <select
                value={tipo}
                onChange={(evento) => setTipo(evento.target.value)}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </label>

            <button type="submit">
              {salvando ? "Salvando..." : "Cadastrar transação"}
            </button>
          </fieldset>

          {erroCadastro && (
            <p className="mensagem erro" role="alert">
              {erroCadastro}
            </p>
          )}
          {sucessoCadastro && (
            <p className="mensagem sucesso" role="status">
              {sucessoCadastro}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
