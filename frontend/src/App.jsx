import { useState } from "react";
import "./App.css";

export default function App() {
  const [transacoes, setTransacoes] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mes, setMes] = useState("9");
  const [ano, setAno] = useState("2026");
  const [resumo, setResumo] = useState(null);

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
      // Busca a lista de transações.
      const respostaTransacoes = await fetch(
        `/transacoes?ano=${anoNumero}&mes=${mes}`,
      );

      if (!respostaTransacoes.ok) {
        throw new Error(
          `Erro ao buscar transações: HTTP ${respostaTransacoes.status}`,
        );
      }

      const dadosTransacoes = await respostaTransacoes.json();

      // Busca os totais calculados pelo Spring.
      const respostaResumo = await fetch(
        `/transacoes/resumo?ano=2026&mes=${mes}`,
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

  return (
    <main>
      <h1>Controle financeiro</h1>
      <h2>Transações de {ano}</h2>

      <label>
        Ano:
        <input
          type="number"
          min="1"
          max="9999"
          step="1"
          value={ano}
          onChange={alterarAno}
          disabled={carregando}
        />
      </label>

      <label>
        Mês:
        <select value={mes} onChange={alterarMes} disabled={carregando}>
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

      <button onClick={carregarTransacoes} disabled={carregando}>
        {carregando ? "Carregando..." : "Carregar transações"}
      </button>

      {erro && <p role="alert">{erro}</p>}

      {resumo !== null && (
        <div>
          <p>
            Entradas: <strong>{formatarMoeda(resumo.totalEntradas)}</strong>
          </p>

          <p>
            Saídas: <strong>{formatarMoeda(resumo.totalSaidas)}</strong>
          </p>

          <p>
            Saldo: <strong>{formatarMoeda(resumo.saldo)}</strong>
          </p>
        </div>
      )}
      {transacoes !== null &&
        (transacoes.length === 0 ? (
          <p>Nenhuma transação encontrada neste mês.</p>
        ) : (
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
                  <td>{transacao.descricao}</td>
                  <td>{transacao.tipo === "ENTRADA" ? "Entrada" : "Saída"}</td>
                  <td>{formatarMoeda(transacao.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </main>
  );
}
