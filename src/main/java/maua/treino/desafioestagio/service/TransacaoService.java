package maua.treino.desafioestagio.service;

import lombok.RequiredArgsConstructor;
import maua.treino.desafioestagio.database.model.Transacao;
import maua.treino.desafioestagio.database.repository.TransacaoRepository;
import maua.treino.desafioestagio.dto.request.TransacaoRequest;
import org.springframework.stereotype.Service;

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
}
