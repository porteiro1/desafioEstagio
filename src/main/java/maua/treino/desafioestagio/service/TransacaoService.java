package maua.treino.desafioestagio.service;

import lombok.RequiredArgsConstructor;
import maua.treino.desafioestagio.database.model.Transacao;
import maua.treino.desafioestagio.database.repository.TransacaoRepository;
import maua.treino.desafioestagio.dto.request.TransacaoRequest;
import maua.treino.desafioestagio.dto.response.ResumoMensalResponse;
import maua.treino.desafioestagio.enumered.TipoTransacao;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransacaoService {
    private final TransacaoRepository repository;

    public Transacao criar(TransacaoRequest request){
        return repository.save(Transacao.builder()
                        .valor(request.getValor())
                        .descricao(request.getDescricao())
                        .data(request.getData())
                        .tipo(request.getTipo())
                .build());
    }


    public List<Transacao> listaPorMes(int ano, int mes){
        YearMonth periodo = YearMonth.of(ano,mes);

        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        return repository.findByDataBetweenOrderByDataDesc(inicio,fim);

    }

    public ResumoMensalResponse resumirMes(int ano, int mes){
        List<Transacao> transacoes = listaPorMes(ano,mes);

        BigDecimal totalEntradas = BigDecimal.ZERO;
        BigDecimal totalSaidas = BigDecimal.ZERO;

        for(Transacao transacao: transacoes){
            if (transacao.getTipo().equals(TipoTransacao.ENTRADA)){
                totalEntradas = totalEntradas.add(transacao.getValor());
            }else {
                totalSaidas = totalSaidas.add(transacao.getValor());
            }
        }
        BigDecimal saldo = totalEntradas.subtract(totalSaidas);

        return new ResumoMensalResponse(totalEntradas,totalSaidas,saldo);
    }
}
